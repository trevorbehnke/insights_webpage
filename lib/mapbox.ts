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

const POI_CATEGORIES = [
  "restaurant",
  "cafe",
  "bar",
  "grocery",
  "park",
  "school",
  "pharmacy",
  "transit",
  "shopping",
];

function milesToMeters(miles: number): number {
  return miles * 1609.34;
}

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

// Map Mapbox Geocoding V6 category to our simplified categories
function mapCategory(maki: string, poiCategory: string[]): string {
  const cats = poiCategory.map((c) => c.toLowerCase()).join(" ");
  const m = (maki || "").toLowerCase();
  const all = `${cats} ${m}`;

  if (all.includes("restaurant") || all.includes("food")) return "restaurant";
  if (all.includes("cafe") || all.includes("coffee")) return "cafe";
  if (all.includes("bar") || all.includes("beer") || all.includes("alcohol"))
    return "bar";
  if (
    all.includes("grocery") ||
    all.includes("supermarket") ||
    all.includes("food_and_drink_stores")
  )
    return "grocery";
  if (all.includes("park") || all.includes("garden")) return "park";
  if (all.includes("school") || all.includes("education")) return "school";
  if (all.includes("pharmacy") || all.includes("medical")) return "pharmacy";
  if (
    all.includes("transit") ||
    all.includes("bus") ||
    all.includes("train") ||
    all.includes("rail") ||
    all.includes("subway")
  )
    return "transit";
  if (
    all.includes("shop") ||
    all.includes("store") ||
    all.includes("retail") ||
    all.includes("mall")
  )
    return "shopping";
  return "shopping"; // default fallback
}

async function searchPOIs(
  lat: number,
  lng: number,
  radiusMiles: number,
  category: string
): Promise<Amenity[]> {
  const radiusMeters = Math.round(milesToMeters(radiusMiles));
  // Use Mapbox Search Box API (category search)
  const url = `${BASE}/search/searchbox/v1/category/${category}?access_token=${TOKEN}&proximity=${lng},${lat}&limit=10&radius=${radiusMeters}&language=en`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();

  return (data.features || []).map(
    (f: {
      properties: {
        name?: string;
        maki?: string;
        poi_category?: string[];
      };
      geometry: { coordinates: [number, number] };
    }) => {
      const fLng = f.geometry.coordinates[0];
      const fLat = f.geometry.coordinates[1];
      return {
        name: f.properties.name || "Unknown",
        category: mapCategory(
          f.properties.maki || "",
          f.properties.poi_category || [category]
        ),
        lat: fLat,
        lng: fLng,
        distance_mi:
          Math.round(haversineDistance(lat, lng, fLat, fLng) * 100) / 100,
      };
    }
  );
}

export async function searchAmenities(
  lat: number,
  lng: number
): Promise<{ walking: Amenity[]; driving: Amenity[] }> {
  // Search all categories at both radii
  const walkingPromises = POI_CATEGORIES.map((cat) =>
    searchPOIs(lat, lng, 1, cat)
  );
  const drivingPromises = POI_CATEGORIES.map((cat) =>
    searchPOIs(lat, lng, 5, cat)
  );

  const walkingResults = await Promise.all(walkingPromises);
  const drivingResults = await Promise.all(drivingPromises);

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
