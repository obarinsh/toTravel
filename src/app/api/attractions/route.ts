import { NextRequest, NextResponse } from 'next/server';
import { generateAttractions } from '@/lib/gemini';
import { getAttractionImageUrl } from '@/lib/images';
import { Attraction } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { destination, destinationCoordinates, excludeNames } = await request.json();

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    // Generate attractions using Gemini (now includes coordinates)
    const { attractions: rawAttractions } = await generateAttractions(destination, excludeNames);
    
    console.log('Gemini returned attractions:', JSON.stringify(rawAttractions, null, 2));

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
    return NextResponse.json(
      { error: 'Failed to generate attractions' },
      { status: 500 }
    );
  }
}
