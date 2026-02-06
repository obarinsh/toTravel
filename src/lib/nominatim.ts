import { GeocodingResult, Coordinates } from '@/types';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Rate limiting: Nominatim requires max 1 request per second
let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < 1000) {
    await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  
  return fetch(url, {
    headers: {
      'User-Agent': 'LaLuz App (personal project)',
    },
  });
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=en`;
  
  const response = await rateLimitedFetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to search locations');
  }
  
  return response.json();
}

export async function geocodeAddress(address: string, nearCity?: string): Promise<Coordinates | null> {
  const query = nearCity ? `${address}, ${nearCity}` : address;
  const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=en`;
  
  const response = await rateLimitedFetch(url);
  
  if (!response.ok) {
    return null;
  }
  
  const results: GeocodingResult[] = await response.json();
  
  if (results.length === 0) {
    return null;
  }
  
  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
  };
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}`;
  
  const response = await rateLimitedFetch(url);
  
  if (!response.ok) {
    return null;
  }
  
  const result = await response.json();
  return result.display_name || null;
}
