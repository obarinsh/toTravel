import { NextRequest, NextResponse } from 'next/server';
import { geocodeWithGemini } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { placeName, city } = await request.json();

    if (!placeName || !city) {
      return NextResponse.json(
        { error: 'Place name and city are required' },
        { status: 400 }
      );
    }

    const coordinates = await geocodeWithGemini(placeName, city);

    if (!coordinates) {
      return NextResponse.json(
        { error: 'Could not find this place' },
        { status: 404 }
      );
    }

    return NextResponse.json({ coordinates });
  } catch (error) {
    console.error('Error geocoding place:', error);
    return NextResponse.json(
      { error: 'Failed to geocode place' },
      { status: 500 }
    );
  }
}
