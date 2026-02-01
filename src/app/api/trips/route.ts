import { NextRequest, NextResponse } from 'next/server';
import { saveTrip, getAllTrips, updateTrip, deleteTrip, getTrip } from '@/lib/supabase';

// GET all trips or single trip by id
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const trip = await getTrip(id);
      if (!trip) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }
      return NextResponse.json({ trip });
    }

    const trips = await getAllTrips();
    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

// POST create new trip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const trip = await saveTrip(body);
    return NextResponse.json({ trip });
  } catch (error) {
    console.error('Error saving trip:', error);
    return NextResponse.json(
      { error: 'Failed to save trip' },
      { status: 500 }
    );
  }
}

// PUT update existing trip
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    const trip = await updateTrip(id, updates);
    return NextResponse.json({ trip });
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

// DELETE trip
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    await deleteTrip(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}
