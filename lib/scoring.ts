import { Amenity } from "./types";

const WALKING_IDEALS: Record<string, number> = {
  grocery: 2,
  restaurant: 5,
  cafe: 3,
  transit: 3,
  park: 2,
  school: 2,
  pharmacy: 1,
  shopping: 3,
};

const CATEGORY_WEIGHTS: Record<string, number> = {
  grocery: 20,
  restaurant: 15,
  cafe: 10,
  transit: 20,
  park: 10,
  school: 10,
  pharmacy: 10,
  shopping: 5,
};

function computeScore(
  amenities: Amenity[],
  ideals: Record<string, number>
): number {
  const counts: Record<string, number> = {};
  for (const a of amenities) {
    counts[a.category] = (counts[a.category] || 0) + 1;
  }

  let score = 0;
  for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    const count = counts[category] || 0;
    const ideal = ideals[category] || 1;
    const categoryScore = Math.min(count / ideal, 1.0) * weight;
    score += categoryScore;
  }

  return Math.round(Math.min(Math.max(score, 0), 100));
}

export function calcWalkingScore(amenities: Amenity[]): number {
  return computeScore(amenities, WALKING_IDEALS);
}

export function calcDrivingScore(amenities: Amenity[]): number {
  const drivingIdeals: Record<string, number> = {};
  for (const [key, val] of Object.entries(WALKING_IDEALS)) {
    drivingIdeals[key] = val * 3;
  }
  return computeScore(amenities, drivingIdeals);
}

export function calcUrbanIndex(walkingAmenities: Amenity[]): {
  label: string;
  density: number;
} {
  const density = walkingAmenities.length / Math.PI; // amenities per sq mile (radius = 1mi)

  let label: string;
  if (density >= 30) label = "Urban";
  else if (density >= 15) label = "Dense Suburban";
  else if (density >= 6) label = "Suburban";
  else label = "Rural";

  return { label, density: Math.round(density * 10) / 10 };
}
