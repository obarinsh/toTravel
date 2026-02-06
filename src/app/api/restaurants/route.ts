import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now?: boolean;
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types?: string[];
}

interface PlaceDetails {
  website?: string;
  url?: string;
  formatted_phone_number?: string;
  reviews?: Array<{
    text: string;
    rating: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, cuisine, dietary, coordinates } = body;

    console.log('Restaurant search request:', { destination, cuisine, dietary, hasCoordinates: !!coordinates });

    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    // If no Google API key, fall back to AI-generated results
    if (!GOOGLE_API_KEY) {
      console.log('No Google Places API key, returning fallback');
      return NextResponse.json({ 
        restaurants: [],
        fallback: true,
        message: 'Google Places API key not configured - use AI fallback'
      }, { status: 200 });
    }

    // Build search query
    let query = `restaurants in ${destination}`;
    if (cuisine && Array.isArray(cuisine) && cuisine.length > 0) {
      const validCuisines = cuisine.filter(Boolean);
      if (validCuisines.length > 0) {
        query = `${validCuisines.join(' ')} restaurants in ${destination}`;
      }
    }
    if (dietary && Array.isArray(dietary) && dietary.length > 0) {
      const validDietary = dietary.filter(Boolean);
      if (validDietary.length > 0) {
        query += ` ${validDietary.join(' ')}`;
      }
    }
    
    console.log('Google Places query:', query);

    // Use Text Search for better results
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    searchUrl.searchParams.set('query', query);
    searchUrl.searchParams.set('type', 'restaurant');
    searchUrl.searchParams.set('key', GOOGLE_API_KEY);
    
    if (coordinates) {
      searchUrl.searchParams.set('location', `${coordinates.lat},${coordinates.lng}`);
      searchUrl.searchParams.set('radius', '5000'); // 5km radius
    }

    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();

    if (searchData.status !== 'OK' || !searchData.results) {
      return NextResponse.json({ 
        restaurants: [],
        message: 'No restaurants found'
      });
    }

    // Get details for top 6 restaurants
    const restaurants = await Promise.all(
      searchData.results.slice(0, 6).map(async (place: GooglePlaceResult) => {
        // Get place details for website
        let details: PlaceDetails = {};
        try {
          const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
          detailsUrl.searchParams.set('place_id', place.place_id);
          detailsUrl.searchParams.set('fields', 'website,url,formatted_phone_number');
          detailsUrl.searchParams.set('key', GOOGLE_API_KEY);
          
          const detailsResponse = await fetch(detailsUrl.toString());
          const detailsData = await detailsResponse.json();
          details = detailsData.result || {};
        } catch {
          // Ignore details errors
        }

        // Get photo URL
        let photoUrl = null;
        if (place.photos && place.photos.length > 0) {
          photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`;
        }

        // Convert price level to $ symbols
        const priceSymbols = place.price_level 
          ? '$'.repeat(place.price_level) 
          : '$$';

        // Detect cuisine type from types
        let cuisineType = 'Restaurant';
        if (place.types) {
          if (place.types.includes('italian_restaurant')) cuisineType = 'Italian';
          else if (place.types.includes('japanese_restaurant')) cuisineType = 'Japanese';
          else if (place.types.includes('chinese_restaurant')) cuisineType = 'Chinese';
          else if (place.types.includes('indian_restaurant')) cuisineType = 'Indian';
          else if (place.types.includes('mexican_restaurant')) cuisineType = 'Mexican';
          else if (place.types.includes('thai_restaurant')) cuisineType = 'Thai';
          else if (place.types.includes('french_restaurant')) cuisineType = 'French';
          else if (place.types.includes('mediterranean_restaurant')) cuisineType = 'Mediterranean';
          else if (place.types.includes('cafe')) cuisineType = 'Cafe';
          else if (place.types.includes('bakery')) cuisineType = 'Bakery';
          else if (place.types.includes('bar')) cuisineType = 'Bar';
        }

        return {
          id: place.place_id,
          name: place.name,
          cuisine: cuisineType,
          address: place.formatted_address || destination,
          priceRange: priceSymbols,
          rating: place.rating,
          reviewCount: place.user_ratings_total,
          photoUrl,
          website: details.website || null,
          googleMapsUrl: details.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
          phone: details.formatted_phone_number || null,
          isOpen: place.opening_hours?.open_now,
          coordinates: place.geometry?.location || null,
        };
      })
    );

    return NextResponse.json({ restaurants });

  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
  }
}
