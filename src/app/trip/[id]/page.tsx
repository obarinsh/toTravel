'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Map, Utensils, Sparkles, Hotel, Loader2 } from 'lucide-react';
import { Trip, Attraction, Coordinates } from '@/types';
import ItineraryView from '@/components/ItineraryView';
import QueryChat from '@/components/QueryChat';
import DateRangePicker, { calculateDays, formatDate } from '@/components/DateRangePicker';
import FoodTab from '@/components/FoodTab';
import ActivitiesTab from '@/components/ActivitiesTab';
import HotelSearch from '@/components/HotelSearch';

type TabType = 'route' | 'food' | 'activities';

export default function TripPage() {
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hotelSearchMode, setHotelSearchMode] = useState<'none' | 'search' | 'click'>('none');
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('route');

  // Fetch trip data
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await fetch(`/api/trips?id=${tripId}`);
        const data = await response.json();
        
        if (data.trip) {
          setTrip(data.trip);
        }
      } catch (error) {
        console.error('Error fetching trip:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  // Auto-save function
  const saveTrip = useCallback(async (updates: Partial<Trip>) => {
    if (!trip) return;

    setIsSaving(true);
    try {
      await fetch('/api/trips', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: trip.id, ...updates }),
      });
    } catch (error) {
      console.error('Error saving trip:', error);
    } finally {
      setIsSaving(false);
    }
  }, [trip]);

  const handleAttractionsChange = (newAttractions: Attraction[]) => {
    if (!trip) return;
    
    setTrip({ ...trip, attractions: newAttractions });
    saveTrip({ attractions: newAttractions });
  };

  const handleSaveDates = (startDate: string, endDate: string) => {
    if (!trip) return;
    
    setTrip({ ...trip, start_date: startDate, end_date: endDate });
    saveTrip({ start_date: startDate, end_date: endDate });
    setIsEditingDates(false);
  };

  const handleClearDates = () => {
    if (!trip) return;
    
    // Clear dates and reset all attractions to unassigned
    const resetAttractions = trip.attractions.map((a) => ({ ...a, day: null }));
    setTrip({ ...trip, start_date: null, end_date: null, attractions: resetAttractions });
    saveTrip({ start_date: null, end_date: null, attractions: resetAttractions });
  };

  const handleRemoveAttraction = (attractionId: string) => {
    if (!trip) return;
    
    if (!confirm('Remove this attraction from your itinerary?')) return;
    
    const newAttractions = trip.attractions
      .filter((a) => a.id !== attractionId)
      .map((a, index) => ({ ...a, order: index + 1 }));
    
    setTrip({ ...trip, attractions: newAttractions });
    saveTrip({ attractions: newAttractions });
  };

  const handleSelectAttraction = (attractionId: string) => {
    setSelectedAttractionId(attractionId);
  };

  const handleMapClickForHotel = async (coordinates: Coordinates) => {
    if (!trip || hotelSearchMode !== 'click') return;

    // Set coordinates immediately
    setTrip({ ...trip, hotel_location: coordinates, hotel_name: null, hotel_address: null });
    setHotelSearchMode('none');

    // Try to get address via reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'ToTravel App' } }
      );
      if (response.ok) {
        const data = await response.json();
        const address = data.display_name || null;
        // Extract the first part as the name
        const name = address ? address.split(',')[0].trim() : null;
        setTrip(prev => prev ? { ...prev, hotel_name: name, hotel_address: address } : null);
        saveTrip({ hotel_location: coordinates, hotel_name: name, hotel_address: address });
      } else {
        saveTrip({ hotel_location: coordinates, hotel_name: null, hotel_address: null });
      }
    } catch {
      saveTrip({ hotel_location: coordinates, hotel_name: null, hotel_address: null });
    }
  };

  const handleHotelSelect = (result: { name: string; address: string; coordinates: Coordinates }) => {
    if (!trip) return;

    setTrip({ 
      ...trip, 
      hotel_location: result.coordinates,
      hotel_name: result.name,
      hotel_address: result.address,
    });
    saveTrip({ 
      hotel_location: result.coordinates,
      hotel_name: result.name,
      hotel_address: result.address,
    });
    setHotelSearchMode('none');
  };

  const handleClearHotel = () => {
    if (!trip) return;

    setTrip({ ...trip, hotel_location: undefined, hotel_name: null, hotel_address: null });
    saveTrip({ 
      hotel_location: null as unknown as Coordinates,
      hotel_name: null,
      hotel_address: null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] pt-24">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: '#5C6B4A' }} strokeWidth={1.5} />
          <p className="text-muted font-body font-light">Loading your trip...</p>
        </motion.div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] pt-24">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-heading text-2xl font-semibold mb-3 text-foreground">Trip not found</h2>
          <p className="text-muted font-body font-light">This trip may have been deleted.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6 pt-20 px-6 md:px-8 max-w-6xl mx-auto pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header - City name, dates, and tabs */}
      <div className="flex items-center justify-between gap-6 flex-wrap">
        {/* Left side - City name and dates (only on route tab) */}
        {activeTab === 'route' ? (
          <div>
            <h1 className="font-heading text-3xl font-semibold text-foreground tracking-tight">
              {trip.destination}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {trip.start_date && trip.end_date ? (
                <>
                  <span className="text-muted font-body font-light">
                    {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                  </span>
                  {isEditingDates ? (
                    <DateRangePicker
                      startDate={trip.start_date}
                      endDate={trip.end_date}
                      onSave={handleSaveDates}
                      onCancel={() => setIsEditingDates(false)}
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditingDates(true)}
                        className="text-xs hover:text-foreground transition-colors"
                        style={{ color: '#5C6B4A' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleClearDates}
                        className="text-xs text-muted hover:text-red-500 transition-colors"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </>
              ) : isEditingDates ? (
                <DateRangePicker
                  startDate={trip.start_date}
                  endDate={trip.end_date}
                  onSave={handleSaveDates}
                  onCancel={() => setIsEditingDates(false)}
                />
              ) : (
                <button
                  onClick={() => setIsEditingDates(true)}
                  className="text-sm hover:text-foreground font-body transition-colors"
                  style={{ color: '#5C6B4A' }}
                >
                  + Add dates
                </button>
              )}
              {isSaving && <span className="text-xs ml-2" style={{ color: '#5C6B4A' }}>Saving...</span>}
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* Right side - Tab Navigation - Bold pill style */}
        <div className="flex gap-2 p-1 rounded-full" style={{ backgroundColor: '#E8EBE3' }}>
          <button
            onClick={() => setActiveTab('route')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'route'
                ? 'text-white shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-card'
            }`}
            style={activeTab === 'route' ? { backgroundColor: '#5C6B4A' } : undefined}
          >
            Route
          </button>
          <button
            onClick={() => setActiveTab('food')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'food'
                ? 'text-white shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-card'
            }`}
            style={activeTab === 'food' ? { backgroundColor: '#5C6B4A' } : undefined}
          >
            Food
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'activities'
                ? 'text-white shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-card'
            }`}
            style={activeTab === 'activities' ? { backgroundColor: '#5C6B4A' } : undefined}
          >
            Activities
          </button>
        </div>
      </div>

      {/* Hotel controls - only show on route tab */}
      {activeTab === 'route' && (
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(92, 107, 74, 0.1)' }}>
            <Hotel size={16} style={{ color: '#5C6B4A' }} strokeWidth={1.5} />
          </div>
          {hotelSearchMode === 'search' ? (
            <HotelSearch
              destination={trip.destination}
              onSelect={handleHotelSelect}
              onCancel={() => setHotelSearchMode('none')}
            />
          ) : hotelSearchMode === 'click' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: '#5C6B4A' }}>Click map to place hotel</span>
              <button
                onClick={() => setHotelSearchMode('none')}
                className="text-xs text-muted hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          ) : trip.hotel_location ? (
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-foreground font-body font-medium">
                  {trip.hotel_name || 'Hotel set'}
                </span>
                {trip.hotel_address && (
                  <span className="text-xs text-muted font-body font-light truncate max-w-[300px]">
                    {trip.hotel_address}
                  </span>
                )}
              </div>
              <button
                onClick={() => setHotelSearchMode('search')}
                className="text-xs hover:text-foreground transition-colors"
                style={{ color: '#5C6B4A' }}
              >
                Edit
              </button>
              <button
                onClick={handleClearHotel}
                className="text-xs text-muted hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setHotelSearchMode('search')}
                className="hover:text-foreground font-medium transition-colors"
                style={{ color: '#5C6B4A' }}
              >
                Search hotel
              </button>
              <span className="text-muted">or</span>
              <button
                onClick={() => setHotelSearchMode('click')}
                className="hover:text-foreground font-medium transition-colors"
                style={{ color: '#5C6B4A' }}
              >
                Click on map
              </button>
            </div>
          )}
        </div>
      )}

      {/* Route Tab Content - New Layout */}
      {activeTab === 'route' && (
        <ItineraryView
          trip={trip}
          selectedAttractionId={selectedAttractionId}
          onAttractionsChange={handleAttractionsChange}
          onSelectAttraction={handleSelectAttraction}
          onRemoveAttraction={handleRemoveAttraction}
          onMapClick={handleMapClickForHotel}
          isSelectingHotel={hotelSearchMode === 'click'}
        />
      )}

      {/* Food Tab Content */}
      {activeTab === 'food' && (
        <FoodTab
          destination={trip.destination}
          hotelLocation={trip.hotel_location}
          onAddRestaurant={(restaurant) => {
            const newAttraction: Attraction = {
              ...restaurant,
              id: `rest-${Date.now()}`,
              order: trip.attractions.length + 1,
            };
            handleAttractionsChange([...trip.attractions, newAttraction]);
          }}
        />
      )}

      {/* Activities Tab Content */}
      {activeTab === 'activities' && (
        <ActivitiesTab
          destination={trip.destination}
          hotelLocation={trip.hotel_location}
          existingAttractions={trip.attractions}
          onAddAttraction={(attraction) => {
            const newAttraction: Attraction = {
              ...attraction,
              id: `attr-${Date.now()}`,
              order: trip.attractions.length + 1,
            };
            handleAttractionsChange([...trip.attractions, newAttraction]);
          }}
        />
      )}

      {/* Query chat - floating */}
      <QueryChat
        destination={trip.destination}
        hotelLocation={trip.hotel_location}
      />
    </motion.div>
  );
}
