import { NextRequest, NextResponse } from 'next/server';
import { geocodeWithGemini } from '@/lib/gemini';

// Get address from coordinates via reverse geocoding
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'User-Agent': 'LaLuz App' } }
    );
    if (response.ok) {
      const data = await response.json();
      return data.display_name || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placeName, city } = body;

    console.log('Geocode request:', { placeName, city });

    if (!placeName || !city) {
      console.log('Missing placeName or city');
      return NextResponse.json(
        { error: 'Place name and city are required', received: { placeName, city } },
        { status: 400 }
      );
    }

    const coordinates = await geocodeWithGemini(placeName, city);

    if (!coordinates) {
      console.log('Could not geocode place:', placeName, city);
      return NextResponse.json(
        { error: 'Could not find this place' },
        { status: 404 }
      );
    }

    // Get the address from the coordinates to verify accuracy
    const address = await reverseGeocode(coordinates.lat, coordinates.lng);

    console.log('Geocode result:', { coordinates, address });
    return NextResponse.json({ coordinates, address });
  } catch (error) {
    console.error('Error geocoding place:', error);
    return NextResponse.json(
      { error: 'Failed to geocode place', details: String(error) },
      { status: 500 }
    );
  }
}
