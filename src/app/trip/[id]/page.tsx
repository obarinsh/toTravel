'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Map, Utensils, Sparkles, Calendar, Hotel, ChevronDown, Loader2 } from 'lucide-react';
import { Trip, Attraction, Coordinates } from '@/types';
import MapWrapper from '@/components/MapWrapper';
import DayBasedItinerary from '@/components/DayBasedItinerary';
import QueryChat from '@/components/QueryChat';
import DateRangePicker, { calculateDays, formatDate } from '@/components/DateRangePicker';
import FoodTab from '@/components/FoodTab';
import ActivitiesTab from '@/components/ActivitiesTab';

type TabType = 'route' | 'food' | 'activities';

export default function TripPage() {
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSelectingHotel, setIsSelectingHotel] = useState(false);
  const [hotelSearchMode, setHotelSearchMode] = useState<'none' | 'search' | 'click'>('none');
  const [hotelSearchQuery, setHotelSearchQuery] = useState('');
  const [isSearchingHotel, setIsSearchingHotel] = useState(false);
  const [hotelSearchError, setHotelSearchError] = useState<string | null>(null);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [mapDayFilter, setMapDayFilter] = useState<number | 'all' | 'unassigned'>('all');
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

  const handleMarkerClick = (attractionId: string) => {
    setSelectedAttractionId(attractionId);
  };

  const handleSelectAttraction = (attractionId: string) => {
    setSelectedAttractionId(attractionId);
  };

  const handleMapClickForHotel = (coordinates: Coordinates) => {
    if (!trip || hotelSearchMode !== 'click') return;

    setTrip({ ...trip, hotel_location: coordinates });
    saveTrip({ hotel_location: coordinates });
    setHotelSearchMode('none');
    setIsSelectingHotel(false);
  };

  const handleHotelSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip || !hotelSearchQuery.trim()) return;

    setIsSearchingHotel(true);
    setHotelSearchError(null);

    try {
      const response = await fetch('/api/geocode-place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeName: hotelSearchQuery,
          city: trip.destination,
        }),
      });

      if (!response.ok) {
        throw new Error('Could not find this place');
      }

      const { coordinates } = await response.json();
      setTrip({ ...trip, hotel_location: coordinates });
      saveTrip({ hotel_location: coordinates });
      setHotelSearchMode('none');
      setHotelSearchQuery('');
    } catch (error) {
      setHotelSearchError('Could not find this place. Try clicking on the map instead.');
    } finally {
      setIsSearchingHotel(false);
    }
  };

  const handleClearHotel = () => {
    if (!trip) return;

    setTrip({ ...trip, hotel_location: undefined });
    saveTrip({ hotel_location: null as unknown as Coordinates });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 size={40} className="text-primary animate-spin mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-muted font-body font-light">Loading your trip...</p>
        </motion.div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
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
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header with Tabs on same row */}
      <div className="flex items-start justify-between gap-8">
        {/* Left: Trip info */}
        <div className="flex-shrink-0">
          <p className="label-premium text-muted mb-2">Your Trip To</p>
          <h1 className="font-heading text-4xl font-semibold text-foreground tracking-tight">{trip.destination}</h1>
          <p className="text-muted font-body font-light mt-2">
            {trip.attractions.length} attractions
            {trip.start_date && trip.end_date && (
              <span className="ml-2">
                • {calculateDays(trip.start_date, trip.end_date)} days
              </span>
            )}
            {isSaving && <span className="ml-2 text-secondary">Saving...</span>}
          </p>
        </div>

        {/* Right: Tab Navigation */}
        <div className="flex gap-2 p-2 bg-card border border-border/50 rounded-[2rem] shadow-warm">
          <button
            onClick={() => setActiveTab('route')}
            className={`flex items-center justify-center gap-3 px-6 py-3 rounded-[1.5rem] font-body font-medium transition-all duration-300 ${
              activeTab === 'route'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted hover:text-foreground hover:bg-primary/10'
            }`}
          >
            <Map size={18} strokeWidth={1.5} />
            <span className="label-premium">Route</span>
          </button>
          <button
            onClick={() => setActiveTab('food')}
            className={`flex items-center justify-center gap-3 px-6 py-3 rounded-[1.5rem] font-body font-medium transition-all duration-300 ${
              activeTab === 'food'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted hover:text-foreground hover:bg-primary/10'
            }`}
          >
            <Utensils size={18} strokeWidth={1.5} />
            <span className="label-premium">Food</span>
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex items-center justify-center gap-3 px-6 py-3 rounded-[1.5rem] font-body font-medium transition-all duration-300 ${
              activeTab === 'activities'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted hover:text-foreground hover:bg-primary/10'
            }`}
          >
            <Sparkles size={18} strokeWidth={1.5} />
            <span className="label-premium">Activities</span>
          </button>
        </div>
      </div>

      {/* Route Tab Content */}
      {activeTab === 'route' && (
        <>
          {/* Trip Dates & Hotel - Same row */}
          <div className="flex items-start justify-between gap-6 flex-wrap">
            {/* Dates - Left */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Calendar size={18} className="text-primary" strokeWidth={1.5} />
                </div>
                {isEditingDates ? (
                  <div className="flex items-center gap-2">
                    <DateRangePicker
                      startDate={trip.start_date}
                      endDate={trip.end_date}
                      onSave={handleSaveDates}
                      onCancel={() => setIsEditingDates(false)}
                    />
                  </div>
                ) : trip.start_date && trip.end_date ? (
                  <span className="text-foreground font-body font-medium">
                    {formatDate(trip.start_date)} - {formatDate(trip.end_date)} 
                    <span className="text-muted ml-2 font-light">({calculateDays(trip.start_date, trip.end_date)} days)</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setIsEditingDates(true)}
                    className="text-secondary hover:text-foreground font-body font-medium transition-colors duration-300"
                  >
                    + Set trip dates
                  </button>
                )}
              </div>
              {trip.start_date && trip.end_date && !isEditingDates && (
                <div className="flex gap-3 text-xs">
                  <button
                    onClick={() => setIsEditingDates(true)}
                    className="text-secondary hover:text-foreground transition-colors duration-300"
                  >
                    Edit
                  </button>
                  <span className="text-border">|</span>
                  <button
                    onClick={handleClearDates}
                    className="text-muted hover:text-red-500 transition-colors duration-300"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Hotel - Right */}
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 bg-secondary/10 rounded-2xl flex items-center justify-center">
                <Hotel size={18} className="text-secondary" strokeWidth={1.5} />
              </div>
              {hotelSearchMode === 'search' ? (
                <form onSubmit={handleHotelSearch} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={hotelSearchQuery}
                    onChange={(e) => setHotelSearchQuery(e.target.value)}
                    placeholder="Hotel name"
                    className="w-36 px-4 py-2 text-sm font-body border border-border rounded-2xl bg-background focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all duration-300"
                    disabled={isSearchingHotel}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSearchingHotel || !hotelSearchQuery.trim()}
                    className="px-4 py-2 bg-secondary text-white text-xs font-medium rounded-2xl hover:scale-[1.02] disabled:opacity-50 transition-all duration-300"
                  >
                    {isSearchingHotel ? '...' : 'Find'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setHotelSearchMode('none'); setHotelSearchError(null); }}
                    className="text-xs text-muted hover:text-foreground transition-colors duration-300"
                  >
                    Cancel
                  </button>
                </form>
              ) : hotelSearchMode === 'click' ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-secondary font-medium">Click map to place</span>
                  <button
                    onClick={() => setHotelSearchMode('none')}
                    className="text-xs text-muted hover:text-foreground transition-colors duration-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : trip.hotel_location ? (
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-foreground font-body font-medium">Hotel set</span>
                  <button
                    onClick={() => setHotelSearchMode('search')}
                    className="text-secondary hover:text-foreground transition-colors duration-300"
                  >
                    Edit
                  </button>
                  <span className="text-border">|</span>
                  <button
                    onClick={handleClearHotel}
                    className="text-muted hover:text-red-500 transition-colors duration-300"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-xs">
                  <button
                    onClick={() => setHotelSearchMode('search')}
                    className="text-secondary hover:text-foreground font-medium transition-colors duration-300"
                  >
                    Search
                  </button>
                  <span className="text-muted">or</span>
                  <button
                    onClick={() => setHotelSearchMode('click')}
                    className="text-secondary hover:text-foreground font-medium transition-colors duration-300"
                  >
                    Click map
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Collapsible Map */}
          <div className={`bg-card border rounded-[2rem] overflow-hidden shadow-warm ${hotelSearchMode === 'click' ? 'border-secondary border-2' : 'border-border/50'}`}>
            <button
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-background/50 transition-colors duration-300"
            >
              <h3 className="font-heading font-semibold flex items-center gap-3 text-foreground">
                <Map size={20} className="text-primary" strokeWidth={1.5} />
                Map View
              </h3>
              <ChevronDown 
                size={20} 
                className={`text-muted transition-transform duration-300 ${isMapExpanded ? 'rotate-180' : ''}`} 
                strokeWidth={1.5}
              />
            </button>
        
            {isMapExpanded && (
              <div className="border-t border-border/50">
                {/* Day filter tabs */}
                {trip.start_date && trip.end_date && (
                  <div className="px-6 py-3 bg-background/30 border-b border-border/50 flex items-center gap-3 overflow-x-auto">
                    <span className="label-premium text-muted flex-shrink-0">Show:</span>
                    <button
                      onClick={() => setMapDayFilter('all')}
                      className={`px-4 py-1.5 text-xs rounded-full flex-shrink-0 transition-all duration-300 ${
                        mapDayFilter === 'all' 
                          ? 'bg-primary text-white' 
                          : 'bg-background border border-border/50 text-muted hover:border-primary hover:text-foreground'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setMapDayFilter('unassigned')}
                      className={`px-4 py-1.5 text-xs rounded-full flex-shrink-0 transition-all duration-300 ${
                        mapDayFilter === 'unassigned' 
                          ? 'bg-secondary text-white' 
                          : 'bg-background border border-border/50 text-muted hover:border-secondary hover:text-foreground'
                      }`}
                    >
                      Unassigned
                    </button>
                    {Array.from({ length: calculateDays(trip.start_date, trip.end_date) }, (_, i) => i + 1).map((dayNum) => (
                      <button
                        key={dayNum}
                        onClick={() => setMapDayFilter(dayNum)}
                        className={`px-4 py-1.5 text-xs rounded-full flex-shrink-0 transition-all duration-300 ${
                          mapDayFilter === dayNum 
                            ? 'bg-primary text-white' 
                            : 'bg-background border border-border/50 text-muted hover:border-primary hover:text-foreground'
                        }`}
                      >
                        Day {dayNum}
                      </button>
                    ))}
                  </div>
                )}
                
                {hotelSearchMode === 'click' && (
                  <div className="bg-secondary text-white text-center py-3 text-sm font-body font-medium">
                    Click on the map to set your hotel location
                  </div>
                )}
                <div className="h-[350px]">
                  <MapWrapper
                    attractions={
                      mapDayFilter === 'all' 
                        ? trip.attractions 
                        : mapDayFilter === 'unassigned'
                          ? trip.attractions.filter(a => a.day === null || a.day === undefined)
                          : trip.attractions.filter(a => a.day === mapDayFilter)
                    }
                    hotelLocation={trip.hotel_location}
                    center={trip.destination_coordinates}
                    selectedAttractionId={selectedAttractionId}
                    onMarkerClick={handleMarkerClick}
                    onMapClick={handleMapClickForHotel}
                    isSelectingHotel={hotelSearchMode === 'click'}
                  />
                </div>
              </div>
            )}
          </div>

      {/* Day-based Itinerary - full width */}
      <DayBasedItinerary
        attractions={trip.attractions}
        startDate={trip.start_date}
        endDate={trip.end_date}
        selectedAttractionId={selectedAttractionId}
        onAttractionsChange={handleAttractionsChange}
        onSelectAttraction={handleSelectAttraction}
        onRemoveAttraction={handleRemoveAttraction}
      />
        </>
      )}

      {/* Food Tab Content */}
      {activeTab === 'food' && (
        <FoodTab
          destination={trip.destination}
          hotelLocation={trip.hotel_location}
          startDate={trip.start_date}
          endDate={trip.end_date}
          numDays={trip.start_date && trip.end_date ? calculateDays(trip.start_date, trip.end_date) : 0}
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
