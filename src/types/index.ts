export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  coordinates: Coordinates;
  photo_url?: string;
  rating?: number;
  order: number;
  day?: number | null; // 1 = Day 1, 2 = Day 2, etc. null/undefined = unassigned
}

export interface Trip {
  id: string;
  name?: string;
  destination: string;
  destination_coordinates: Coordinates;
  attractions: Attraction[];
  hotel_location?: Coordinates;
  start_date?: string | null; // ISO date string (YYYY-MM-DD)
  end_date?: string | null; // ISO date string (YYYY-MM-DD)
  created_at: string;
  updated_at: string;
}

export interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
