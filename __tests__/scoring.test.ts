import {
  calcWalkingScore,
  calcDrivingScore,
  calcUrbanIndex,
  CATEGORY_WEIGHTS,
  WALKING_IDEALS,
} from "@/lib/scoring";
import { Amenity } from "@/lib/types";

function makeAmenity(category: string, distance_mi = 0.5): Amenity {
  return { name: `Test ${category}`, category, lat: 0, lng: 0, distance_mi };
}

function makeFullAmenities(ideals: Record<string, number>): Amenity[] {
  const amenities: Amenity[] = [];
  for (const [cat, count] of Object.entries(ideals)) {
    for (let i = 0; i < count; i++) {
      amenities.push(makeAmenity(cat, 0.3));
    }
  }
  return amenities;
}

describe("CATEGORY_WEIGHTS", () => {
  it("should sum to 100", () => {
    const sum = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });
});

describe("calcWalkingScore", () => {
  it("returns 0 for empty amenities", () => {
    expect(calcWalkingScore([])).toBe(0);
  });

  it("returns 100 when all categories meet their ideals", () => {
    const amenities = makeFullAmenities(WALKING_IDEALS);
    expect(calcWalkingScore(amenities)).toBe(100);
  });

  it("caps category contribution at its weight", () => {
    // 10x the ideal for grocery — should still only contribute 15
    const amenities = Array.from({ length: 20 }, () => makeAmenity("grocery"));
    const score = calcWalkingScore(amenities);
    expect(score).toBe(CATEGORY_WEIGHTS.grocery);
  });

  it("returns partial score for partial coverage", () => {
    // 1 grocery out of ideal 2 → half weight
    const amenities = [makeAmenity("grocery")];
    const score = calcWalkingScore(amenities);
    expect(score).toBe(Math.round(CATEGORY_WEIGHTS.grocery * (1 / WALKING_IDEALS.grocery)));
  });
});

describe("calcDrivingScore", () => {
  it("returns 0 for empty amenities", () => {
    expect(calcDrivingScore([])).toBe(0);
  });

  it("gives higher score for closer amenities", () => {
    const close = [makeAmenity("grocery", 0.5)];
    const far = [makeAmenity("grocery", 4.5)];
    expect(calcDrivingScore(close)).toBeGreaterThan(calcDrivingScore(far));
  });

  it("gives 0 contribution for amenity at exactly 5mi", () => {
    const amenities = [makeAmenity("grocery", 5)];
    expect(calcDrivingScore(amenities)).toBe(0);
  });
});

describe("calcUrbanIndex", () => {
  it("returns Rural for empty amenities", () => {
    expect(calcUrbanIndex([]).label).toBe("Rural");
  });

  it("returns correct labels at threshold boundaries", () => {
    // density = count / π; Urban threshold is 30
    const urbanCount = Math.ceil(30 * Math.PI);
    const urban = Array.from({ length: urbanCount }, () => makeAmenity("restaurant"));
    expect(calcUrbanIndex(urban).label).toBe("Urban");

    const denseCount = Math.ceil(15 * Math.PI);
    const dense = Array.from({ length: denseCount }, () => makeAmenity("restaurant"));
    expect(calcUrbanIndex(dense).label).toBe("Dense Suburban");

    const subCount = Math.ceil(6 * Math.PI);
    const sub = Array.from({ length: subCount }, () => makeAmenity("restaurant"));
    expect(calcUrbanIndex(sub).label).toBe("Suburban");
  });
});
