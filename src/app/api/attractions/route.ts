import { NextRequest, NextResponse } from 'next/server';
import { generateAttractions } from '@/lib/gemini';
import { getAttractionImageUrl } from '@/lib/images';
import { Attraction } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { destination, destinationCoordinates, excludeNames, category } = await request.json();

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    console.log('Generating attractions for:', destination, 'excluding:', excludeNames?.length || 0, 'places');

    // Generate attractions using Gemini (now includes coordinates and optional category filter)
    const result = await generateAttractions(destination, excludeNames, category);
    
    if (!result || !result.attractions) {
      console.error('Invalid response from Gemini:', result);
      return NextResponse.json(
        { error: 'Invalid response from AI', attractions: [] },
        { status: 200 }
      );
    }

    const rawAttractions = result.attractions;
    console.log('Gemini returned', rawAttractions.length, 'attractions');

    // Map Gemini response to our Attraction format
    const attractions: Attraction[] = rawAttractions.map((attr, i) => ({
      id: `attr-${Date.now()}-${i}`,
      name: attr.name,
      description: attr.description,
      coordinates: {
        lat: attr.latitude,
        lng: attr.longitude,
      },
      photo_url: getAttractionImageUrl(attr.image_search_term, attr.name),
      order: i + 1,
      category: attr.category as Attraction['category'],
    }));

    return NextResponse.json({ attractions });
  } catch (error) {
    console.error('Error generating attractions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate attractions: ${errorMessage}`, attractions: [] },
      { status: 500 }
    );
  }
}
