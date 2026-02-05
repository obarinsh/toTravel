'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Map, Utensils, Sparkles, Loader2, Download, Share2, MoreVertical, Pencil, Check, X, MapPin, Building2 } from 'lucide-react';
import { Trip, Attraction, Coordinates } from '@/types';
import ItineraryView from '@/components/ItineraryView';
import DateRangePicker, { calculateDays, formatDate } from '@/components/DateRangePicker';
import FoodTab from '@/components/FoodTab';
import ActivitiesTab from '@/components/ActivitiesTab';
import NearbyTab from '@/components/NearbyTab';
import MobileTripView from '@/components/mobile/MobileTripView';
import HotelSearch from '@/components/HotelSearch';
import { exportTripToPDF } from '@/lib/pdfExport';

type TabType = 'route' | 'nearby' | 'food' | 'activities';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isMobileHotelSearchOpen, setIsMobileHotelSearchOpen] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);

  // Share trip functionality
  const handleShareTrip = useCallback(async () => {
    const tripUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Trip to ${trip?.destination}`,
          text: `Check out my trip to ${trip?.destination}!`,
          url: tripUrl,
        });
        setIsMenuOpen(false);
        return;
      } catch {
        // Fall back to clipboard
      }
    }
    
    try {
      await navigator.clipboard.writeText(tripUrl);
      alert('Link copied to clipboard!');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = tripUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
    setIsMenuOpen(false);
  }, [trip?.destination]);

  // Fetch trip data
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await fetch(`/api/trips?id=${tripId}`);
        const data = await response.json();
        
        if (data.trip) {
          setTrip(data.trip);
          // Auto-open date picker if dates are not set
          if (!data.trip.start_date || !data.trip.end_date) {
            setIsEditingDates(true);
          }
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

  // Generate more attractions (optionally filtered by category)
  const handleGenerateMore = useCallback(async (category?: string) => {
    if (!trip) return;
    
    setIsGeneratingMore(true);
    try {
      const response = await fetch('/api/attractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: trip.destination,
          destinationCoordinates: trip.destination_coordinates,
          excludeNames: trip.attractions.map(a => a.name),
          category, // Pass category filter if provided
        }),
      });

      const { attractions: newAttractions } = await response.json();
      
      if (newAttractions && newAttractions.length > 0) {
        // Add new attractions with proper order numbers
        const startOrder = trip.attractions.length + 1;
        const attractionsToAdd = newAttractions.map((a: Attraction, i: number) => ({
          ...a,
          id: `attr-${Date.now()}-${i}`,
          order: startOrder + i,
          day: null, // Unassigned
        }));
        
        const updatedAttractions = [...trip.attractions, ...attractionsToAdd];
        setTrip({ ...trip, attractions: updatedAttractions });
        saveTrip({ attractions: updatedAttractions });
      }
    } catch (error) {
      console.error('Error generating more attractions:', error);
      alert('Failed to generate more places. Please try again.');
    } finally {
      setIsGeneratingMore(false);
    }
  }, [trip, saveTrip]);

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

  const handleSaveName = () => {
    if (!trip) return;
    const newName = editedName.trim() || undefined;
    setTrip({ ...trip, name: newName });
    saveTrip({ name: newName });
    setIsEditingName(false);
  };

  const handleStartEditingName = () => {
    if (!trip) return;
    setEditedName(trip.name || '');
    setIsEditingName(true);
  };

  // Dates are required - no clear dates function needed

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
    <>
      {/* Mobile View - Hidden on md and up */}
      <div className="md:hidden">
        <MobileTripView
          trip={trip}
          onAttractionsChange={handleAttractionsChange}
          onMenuOpen={() => setIsMenuOpen(true)}
          onEditDates={() => setIsEditingDates(true)}
          onGenerateMore={handleGenerateMore}
          isGenerating={isGeneratingMore}
        />
        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="fixed top-4 right-4 bg-white rounded-xl shadow-lg border border-border py-2 min-w-[180px] z-50">
              <button
                onClick={handleShareTrip}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-gray-50 transition-colors"
              >
                <Share2 size={18} style={{ color: '#8B9082' }} strokeWidth={1.5} />
                Share
              </button>
              <button
                onClick={() => {
                  exportTripToPDF({ trip, startDate: trip.start_date, endDate: trip.end_date });
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-gray-50 transition-colors"
              >
                <Download size={18} style={{ color: '#8B9082' }} strokeWidth={1.5} />
                Export PDF
              </button>
              <button
                onClick={() => {
                  setIsEditingDates(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-gray-50 transition-colors"
              >
                <Pencil size={18} style={{ color: '#8B9082' }} strokeWidth={1.5} />
                Edit dates
              </button>
              <button
                onClick={() => {
                  setIsMobileHotelSearchOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-gray-50 transition-colors"
              >
                <Building2 size={18} style={{ color: '#8B9082' }} strokeWidth={1.5} />
                {trip.hotel_location ? 'Change hotel' : 'Set hotel'}
              </button>
              {trip.hotel_location && (
                <button
                  onClick={() => {
                    handleClearHotel();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-gray-50 transition-colors"
                >
                  <X size={18} strokeWidth={1.5} />
                  Remove hotel
                </button>
              )}
            </div>
          </>
        )}
        {/* Mobile Hotel Search Modal */}
        {isMobileHotelSearchOpen && (
          <div className="fixed inset-0 flex items-end justify-center z-[99999]">
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileHotelSearchOpen(false)}
            />
            <div className="relative w-full bg-white rounded-t-3xl p-5 pb-8 safe-area-pb z-[100000]">
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                {trip.hotel_location ? 'Change your hotel' : 'Where are you staying?'}
              </h3>
              {trip.hotel_name && (
                <p className="text-sm text-muted mb-4">
                  Current: {trip.hotel_name}
                </p>
              )}
              <HotelSearch
                destination={trip.destination}
                onSelect={(result) => {
                  handleHotelSelect(result);
                  setIsMobileHotelSearchOpen(false);
                }}
                onCancel={() => setIsMobileHotelSearchOpen(false)}
              />
            </div>
          </div>
        )}
        {/* Date Picker Modal for Mobile - Full screen bottom sheet */}
        {isEditingDates && (
          <div className="fixed inset-0 flex items-end justify-center z-[99999]">
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => {
                if (trip.start_date && trip.end_date) {
                  setIsEditingDates(false);
                }
              }}
            />
            <div className="relative w-full bg-white rounded-t-3xl px-5 pt-4 pb-8 safe-area-pb z-[100000]">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>
              <DateRangePicker
                startDate={trip.start_date}
                endDate={trip.end_date}
                onSave={handleSaveDates}
                onCancel={() => setIsEditingDates(false)}
                required={!trip.start_date || !trip.end_date}
                embedded
              />
            </div>
          </div>
        )}
      </div>

      {/* Desktop View - Hidden on mobile */}
      <motion.div 
        className="hidden md:block space-y-6 pt-20 px-6 md:px-8 max-w-6xl mx-auto pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
      {/* Header - Responsive layout */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Title and dates */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex flex-col min-w-0">
            {/* Trip name with edit functionality */}
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder={trip.destination}
                    className="font-heading text-xl md:text-2xl font-semibold text-foreground tracking-tight bg-transparent border-b-2 border-secondary focus:outline-none min-w-0 flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Check size={18} style={{ color: '#5C6B4A' }} />
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={18} style={{ color: '#8B9082' }} />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="font-heading text-xl md:text-2xl font-semibold text-foreground tracking-tight truncate">
                    {trip.name || trip.destination}
                  </h1>
                  <button
                    onClick={handleStartEditingName}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    <Pencil size={14} style={{ color: '#8B9082' }} />
                  </button>
                </>
              )}
            </div>
            {/* Destination and dates row */}
            <div className="flex items-center gap-2">
              {trip.name && (
                <span className="text-muted font-body text-sm">{trip.destination}</span>
              )}
              {trip.name && trip.start_date && trip.end_date && (
                <span className="text-muted">·</span>
              )}
              <button 
                onClick={() => setIsEditingDates(true)}
                className="hover:opacity-70 transition-opacity"
              >
                {trip.start_date && trip.end_date ? (
                  <span className="text-muted font-body text-sm">
                    {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
                  </span>
                ) : (
                  <span className="text-sm font-body" style={{ color: '#5C6B4A' }}>+ dates</span>
                )}
              </button>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="h-8 w-px flex-shrink-0" style={{ backgroundColor: '#E0E0DC' }} />

          {/* Tab Navigation - Desktop (3 tabs) */}
          <div className="flex gap-1 p-1 rounded-full flex-shrink-0" style={{ backgroundColor: '#E8EBE3' }}>
          <button
            onClick={() => setActiveTab('route')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'route'
                ? 'text-white shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
            style={activeTab === 'route' ? { backgroundColor: '#5C6B4A' } : undefined}
          >
            <span className="flex items-center gap-1.5">
              <Map size={14} strokeWidth={1.5} />
              Route
            </span>
          </button>
          <button
            onClick={() => setActiveTab('food')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'food'
                ? 'text-white shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
            style={activeTab === 'food' ? { backgroundColor: '#5C6B4A' } : undefined}
          >
            <span className="flex items-center gap-1.5">
              <Utensils size={14} strokeWidth={1.5} />
              Food
            </span>
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'activities'
                ? 'text-white shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
            style={activeTab === 'activities' ? { backgroundColor: '#5C6B4A' } : undefined}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} strokeWidth={1.5} />
              Activities
            </span>
          </button>
          </div>
        </div>

        {/* Menu button */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical size={20} style={{ color: '#8B9082' }} />
          </button>
          
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-border py-2 min-w-[180px] z-50">
                <button
                  onClick={handleShareTrip}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-gray-50 transition-colors"
                >
                  <Share2 size={18} style={{ color: '#8B9082' }} strokeWidth={1.5} />
                  Share
                </button>
                <button
                  onClick={() => {
                    exportTripToPDF({ trip, startDate: trip.start_date, endDate: trip.end_date });
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-gray-50 transition-colors"
                >
                  <Download size={18} style={{ color: '#8B9082' }} strokeWidth={1.5} />
                  Export PDF
                </button>
                <button
                  onClick={() => {
                    setIsEditingDates(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-gray-50 transition-colors"
                >
                  <Pencil size={18} style={{ color: '#8B9082' }} strokeWidth={1.5} />
                  Edit details
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Date Picker Modal */}
      {isEditingDates && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(107, 114, 99, 0.85)' }}
            onClick={() => {
              // Only allow closing if dates are already set
              if (trip.start_date && trip.end_date) {
                setIsEditingDates(false);
              }
            }}
          />
          <div className="relative w-full max-w-md" style={{ zIndex: 10000 }}>
            <DateRangePicker
              startDate={trip.start_date}
              endDate={trip.end_date}
              onSave={handleSaveDates}
              onCancel={() => setIsEditingDates(false)}
              required={!trip.start_date || !trip.end_date}
            />
          </div>
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
          onHotelSelect={handleHotelSelect}
          onHotelClear={handleClearHotel}
          hotelSearchMode={hotelSearchMode}
          onHotelSearchModeChange={setHotelSearchMode}
          onGenerateMore={handleGenerateMore}
          isGenerating={isGeneratingMore}
        />
      )}

      {/* Nearby Tab Content - Mobile Only */}
      {activeTab === 'nearby' && (
        <NearbyTab
          trip={trip}
          onSelectAttraction={handleSelectAttraction}
          selectedAttractionId={selectedAttractionId}
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

      </motion.div>
    </>
  );
}
