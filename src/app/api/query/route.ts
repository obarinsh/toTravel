import { NextRequest, NextResponse } from 'next/server';
import { answerTravelQuery } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { destination, query, hotelLocation } = await request.json();

    if (!destination || !query) {
      return NextResponse.json(
        { error: 'Destination and query are required' },
        { status: 400 }
      );
    }

    const response = await answerTravelQuery(destination, query, hotelLocation);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error answering query:', error);
    return NextResponse.json(
      { error: 'Failed to answer query' },
      { status: 500 }
    );
  }
}
