import { NextRequest, NextResponse } from 'next/server';
import { searchLocations } from '@/lib/nominatim';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const results = await searchLocations(query);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error geocoding:', error);
    return NextResponse.json(
      { error: 'Failed to search locations' },
      { status: 500 }
    );
  }
}
