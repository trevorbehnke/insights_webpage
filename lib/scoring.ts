import { Amenity } from "./types";

export const WALKING_IDEALS: Record<string, number> = {
  grocery: 2,
  restaurant: 4,
  cafe: 2,
  transit: 3,
  park: 2,
  school: 2,
  pharmacy: 1,
  shopping: 2,
  gym: 1,
  bank: 1,
  entertainment: 1,
  medical: 1,
  bar: 2,
};

export const CATEGORY_WEIGHTS: Record<string, number> = {
  grocery: 15,
  restaurant: 12,
  cafe: 7,
  transit: 15,
  park: 8,
  school: 7,
  pharmacy: 7,
  shopping: 5,
  gym: 5,
  bank: 5,
  entertainment: 4,
  medical: 5,
  bar: 5,
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
  // Find nearest amenity per category
  const nearest: Record<string, number> = {};
  for (const a of amenities) {
    if (nearest[a.category] === undefined || a.distance_mi < nearest[a.category]) {
      nearest[a.category] = a.distance_mi;
    }
  }

  // Score each category by proximity: closer = higher score
  let score = 0;
  for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    const dist = nearest[category];
    if (dist !== undefined) {
      score += Math.max(0, 1 - dist / 5) * weight;
    }
  }

  return Math.round(Math.min(Math.max(score, 0), 100));
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
