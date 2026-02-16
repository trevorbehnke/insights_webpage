import { GeoResult, Amenity } from "./types";

const TOKEN = process.env.MAPBOX_ACCESS_TOKEN!;
const BASE = "https://api.mapbox.com";

export async function forwardGeocode(query: string): Promise<GeoResult[]> {
  const url = `${BASE}/search/geocode/v6/forward?q=${encodeURIComponent(query)}&access_token=${TOKEN}&limit=5&types=address,place`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();

  return (data.features || []).map(
    (f: {
      properties: { full_address?: string; name?: string };
      geometry: { coordinates: [number, number] };
    }) => ({
      place_name: f.properties.full_address || f.properties.name || "",
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    })
  );
}

// Maps scoring categories to canonical Mapbox SearchBox v1 category IDs.
// Transit uses multiple IDs to capture bus stops, train stations, etc.
const POI_CATEGORIES: Record<string, string | string[]> = {
  restaurant: "restaurant",
  cafe: "cafe",
  grocery: "grocery",
  park: "park",
  school: "school",
  pharmacy: "pharmacy",
  transit: ["bus_stop", "public_transportation_station", "railway_station"],
  shopping: "shopping",
  gym: "gym",
  bank: ["bank", "atm"],
  entertainment: ["cinema", "theatre"],
  medical: ["hospital", "medical_clinic"],
  bar: "bar",
};

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bboxFromCenter(
  lat: number,
  lng: number,
  radiusMiles: number
): [number, number, number, number] {
  const latDelta = radiusMiles / 69.0;
  const lngDelta = radiusMiles / (69.0 * Math.cos((lat * Math.PI) / 180));
  return [lng - lngDelta, lat - latDelta, lng + lngDelta, lat + latDelta];
}

async function batchPromises<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    results.push(...(await Promise.all(batch.map((fn) => fn()))));
  }
  return results;
}

async function searchPOIs(
  lat: number,
  lng: number,
  radiusMiles: number,
  category: string,
  mapboxCategoryId: string
): Promise<Amenity[]> {
  const bbox = bboxFromCenter(lat, lng, radiusMiles);
  const url = `${BASE}/search/searchbox/v1/category/${mapboxCategoryId}?access_token=${TOKEN}&proximity=${lng},${lat}&limit=25&bbox=${bbox.join(",")}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return (data.features || []).map(
        (f: {
          properties: { name?: string };
          geometry: { coordinates: [number, number] };
        }) => {
          const fLng = f.geometry.coordinates[0];
          const fLat = f.geometry.coordinates[1];
          return {
            name: f.properties.name || "Unknown",
            category,
            lat: fLat,
            lng: fLng,
            distance_mi:
              Math.round(haversineDistance(lat, lng, fLat, fLng) * 100) / 100,
          };
        }
      );
    }
    if (res.status === 429 && attempt < 2) {
      await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
      continue;
    }
    return [];
  }
  return [];
}

export async function searchAmenities(
  lat: number,
  lng: number
): Promise<{ walking: Amenity[]; driving: Amenity[] }> {
  // Build tasks, expanding categories with multiple Mapbox IDs (e.g. transit)
  const taskEntries: { category: string; mapboxId: string }[] = [];
  for (const [category, ids] of Object.entries(POI_CATEGORIES)) {
    const idList = Array.isArray(ids) ? ids : [ids];
    for (const id of idList) {
      taskEntries.push({ category, mapboxId: id });
    }
  }

  // Batch requests to avoid hitting Mapbox rate limits on serverless
  const walkingTasks = taskEntries.map(
    ({ category, mapboxId }) => () => searchPOIs(lat, lng, 1, category, mapboxId)
  );
  const drivingTasks = taskEntries.map(
    ({ category, mapboxId }) => () => searchPOIs(lat, lng, 5, category, mapboxId)
  );

  const walkingResults = await batchPromises(walkingTasks, 4);
  const drivingResults = await batchPromises(drivingTasks, 4);

  const walking = walkingResults.flat().filter((a) => a.distance_mi <= 1);
  const driving = drivingResults.flat().filter((a) => a.distance_mi <= 5);

  // Deduplicate by name+category
  const dedup = (arr: Amenity[]) => {
    const seen = new Set<string>();
    return arr.filter((a) => {
      const key = `${a.name}-${a.category}-${a.lat}-${a.lng}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  return { walking: dedup(walking), driving: dedup(driving) };
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  const url = `${BASE}/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&access_token=${TOKEN}&types=address`;
  const res = await fetch(url);
  if (!res.ok) return `${lat}, ${lng}`;
  const data = await res.json();
  const feature = data.features?.[0];
  return feature?.properties?.full_address || `${lat}, ${lng}`;
}
