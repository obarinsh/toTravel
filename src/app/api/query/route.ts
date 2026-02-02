import { NextRequest, NextResponse } from 'next/server';
import { answerTravelQuery } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, query, hotelLocation } = body;

    console.log('Query request:', { destination, queryLength: query?.length, hasHotel: !!hotelLocation });

    if (!destination || !query) {
      return NextResponse.json(
        { error: 'Destination and query are required' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'AI service not configured. Please add GEMINI_API_KEY to your environment variables.' },
        { status: 503 }
      );
    }

    const response = await answerTravelQuery(destination, query, hotelLocation);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error answering query:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for rate limit errors
    if (errorMessage.includes('rate limit') || errorMessage.includes('429') || errorMessage.includes('quota')) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a moment and try again.', rateLimited: true },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to answer query', details: errorMessage },
      { status: 500 }
    );
  }
}
