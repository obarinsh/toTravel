import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase-server';

// GET all trips or single trip by id
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const user = await getServerUser();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const { data: trip, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !trip) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }
      return NextResponse.json({ trip });
    }

    // Get trips for current user only
    if (!user) {
      return NextResponse.json({ trips: [] });
    }

    const { data: trips, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ trips: trips || [] });
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
    const supabase = await createServerSupabaseClient();
    const user = await getServerUser();
    const body = await request.json();
    
    const { data: trip, error } = await supabase
      .from('trips')
      .insert([{
        user_id: user?.id || null,
        name: body.name,
        destination: body.destination,
        destination_coordinates: body.destination_coordinates,
        attractions: body.attractions || [],
        hotel_location: body.hotel_location,
      }])
      .select()
      .single();

    if (error) throw error;
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
    const supabase = await createServerSupabaseClient();
    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    const { data: trip, error } = await supabase
      .from('trips')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
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
    const supabase = await createServerSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}
