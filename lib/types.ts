export interface Amenity {
  name: string;
  category: string;
  lat: number;
  lng: number;
  distance_mi: number;
}

export interface GeoResult {
  place_name: string;
  lat: number;
  lng: number;
}

export interface HistoryEntry {
  address: string;
  lat: number;
  lng: number;
  slug: string;
  timestamp: number;
}

export interface ScoreResult {
  walkingScore: number;
  drivingScore: number;
  urbanIndex: string;
  density: number;
}
