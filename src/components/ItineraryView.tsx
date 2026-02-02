'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Map, Calendar, Hotel, X } from 'lucide-react';
import { Attraction, Coordinates, Trip } from '@/types';
import SuggestionsPanel from './SuggestionsPanel';
import DayCard from './DayCard';
import { PlaceCardContent } from './PlaceCard';
import { calculateDays, formatDate } from './DateRangePicker';
import MapWrapper from './MapWrapper';
import HotelSearch from './HotelSearch';

interface HotelData {
  name: string;
  address: string;
  coordinates: Coordinates;
}

interface ItineraryViewProps {
  trip: Trip;
  selectedAttractionId?: string | null;
  onAttractionsChange: (attractions: Attraction[]) => void;
  onSelectAttraction: (id: string) => void;
  onRemoveAttraction?: (id: string) => void;
  onMapClick?: (coordinates: Coordinates) => void;
  isSelectingHotel?: boolean;
  onHotelSelect?: (hotel: HotelData) => void;
  onHotelClear?: () => void;
  hotelSearchMode?: 'none' | 'search' | 'click';
  onHotelSearchModeChange?: (mode: 'none' | 'search' | 'click') => void;
}

export default function ItineraryView({
  trip,
  selectedAttractionId,
  onAttractionsChange,
  onSelectAttraction,
  onRemoveAttraction,
  onMapClick,
  isSelectingHotel,
  onHotelSelect,
  onHotelClear,
  hotelSearchMode = 'none',
  onHotelSearchModeChange,
}: ItineraryViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [mapDayFilter, setMapDayFilter] = useState<number | 'all' | 'unassigned'>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { attractions, start_date, end_date } = trip;
  const numDays = start_date && end_date ? calculateDays(start_date, end_date) : 0;

  // Group attractions
  const unassigned = attractions.filter((a) => a.day === null || a.day === undefined);
  const dayGroups: Record<number, Attraction[]> = {};
  
  for (let i = 1; i <= numDays; i++) {
    dayGroups[i] = attractions.filter((a) => a.day === i);
  }

  const activeAttraction = activeId
    ? attractions.find((a) => a.id === activeId)
    : null;

  const findContainer = (id: string): string | null => {
    if (id === 'unassigned' || id.startsWith('day-')) {
      return id;
    }

    const attraction = attractions.find((a) => a.id === id);
    if (!attraction) return null;
    
    if (attraction.day === null || attraction.day === undefined) {
      return 'unassigned';
    }
    return `day-${attraction.day}`;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    const newAttractions = attractions.map((a) => {
      if (a.id === active.id) {
        const newDay = overContainer === 'unassigned' 
          ? null 
          : parseInt(overContainer.replace('day-', ''));
        return { ...a, day: newDay };
      }
      return a;
    });

    onAttractionsChange(newAttractions);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      const containerAttractions = activeContainer === 'unassigned'
        ? unassigned
        : dayGroups[parseInt(activeContainer.replace('day-', ''))];

      const oldIndex = containerAttractions.findIndex((a) => a.id === active.id);
      const overAttraction = attractions.find((a) => a.id === over.id);
      
      if (overAttraction) {
        const newIndex = containerAttractions.findIndex((a) => a.id === over.id);
        
        if (oldIndex !== newIndex) {
          const reordered = arrayMove(containerAttractions, oldIndex, newIndex);
          
          const updatedGroup = reordered.map((a, index) => ({
            ...a,
            order: index + 1,
          }));

          const newAttractions = attractions.map((a) => {
            const updated = updatedGroup.find((u) => u.id === a.id);
            return updated || a;
          });

          onAttractionsChange(newAttractions);
        }
      }
    } else {
      const targetDay = overContainer === 'unassigned'
        ? null
        : parseInt(overContainer.replace('day-', ''));
      
      const targetAttractions = attractions.filter((a) => 
        targetDay === null 
          ? (a.day === null || a.day === undefined)
          : a.day === targetDay
      );

      const newAttractions = attractions.map((a) => {
        const indexInTarget = targetAttractions.findIndex((t) => t.id === a.id);
        if (indexInTarget !== -1) {
          return { ...a, order: indexInTarget + 1 };
        }
        return a;
      });

      onAttractionsChange(newAttractions);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-h-[600px] h-[calc(100vh-280px)] -mx-8 rounded-[2rem] overflow-hidden border border-border/30">
        {/* Left Sidebar - Suggestions */}
        <SuggestionsPanel
          attractions={unassigned}
          selectedAttractionId={selectedAttractionId}
          onSelectAttraction={onSelectAttraction}
          onRemoveAttraction={onRemoveAttraction}
        />

        {/* Main Content - Itinerary */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Header - Controls only */}
          <div className="bg-card border-b border-border/50 px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left side - Info and hotel */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <p className="text-sm text-muted font-body font-light flex-shrink-0">
                  {start_date && end_date ? (
                    `${numDays} day itinerary`
                  ) : (
                    <span className="flex items-center gap-2">
                      <Calendar size={14} strokeWidth={1.5} />
                      Set dates
                    </span>
                  )}
                </p>
                
                {/* Hotel section - inline */}
                {hotelSearchMode === 'none' && !trip.hotel_location && (
                  <button
                    onClick={() => onHotelSearchModeChange?.('search')}
                    className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
                    style={{ color: '#5C6B4A' }}
                  >
                    <Hotel size={14} strokeWidth={1.5} />
                    <span>+ Hotel</span>
                  </button>
                )}
                
                {hotelSearchMode === 'none' && trip.hotel_location && (
                  <div className="flex items-center gap-2 min-w-0">
                    <Hotel size={14} style={{ color: '#5C6B4A' }} strokeWidth={1.5} className="flex-shrink-0" />
                    <span className="text-sm text-foreground truncate max-w-[150px]">
                      {trip.hotel_name || 'Hotel'}
                    </span>
                    <button
                      onClick={() => onHotelSearchModeChange?.('search')}
                      className="text-xs hover:text-foreground transition-colors flex-shrink-0"
                      style={{ color: '#5C6B4A' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={onHotelClear}
                      className="text-xs text-muted hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Right side - Map toggle */}
              <button 
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className={`px-4 py-2 text-sm rounded-xl transition-all duration-300 flex items-center gap-2 flex-shrink-0 ${
                  isMapExpanded 
                    ? 'bg-primary text-white' 
                    : 'bg-background border border-border/50 text-foreground hover:bg-moss-light'
                }`}
              >
                <Map size={16} strokeWidth={1.5} />
                Map View
              </button>
            </div>
            
            {/* Hotel Search - expanded below when active */}
            {hotelSearchMode === 'search' && (
              <div className="mt-3 flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'rgba(92, 107, 74, 0.05)' }}>
                <Hotel size={16} style={{ color: '#5C6B4A' }} strokeWidth={1.5} />
                <HotelSearch
                  destination={trip.destination}
                  onSelect={(hotel) => {
                    onHotelSelect?.(hotel);
                    onHotelSearchModeChange?.('none');
                  }}
                  onCancel={() => onHotelSearchModeChange?.('none')}
                />
              </div>
            )}
            
            {hotelSearchMode === 'click' && (
              <div className="mt-3 flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'rgba(92, 107, 74, 0.05)' }}>
                <Hotel size={16} style={{ color: '#5C6B4A' }} strokeWidth={1.5} />
                <span className="text-sm font-medium" style={{ color: '#5C6B4A' }}>Click on map to place hotel</span>
                <button
                  onClick={() => onHotelSearchModeChange?.('none')}
                  className="text-sm text-muted hover:text-foreground ml-2"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Map - Collapsible */}
            {isMapExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4"
              >
                {/* Day filter tabs */}
                {start_date && end_date && (
                  <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-2">
                    <span className="label-premium text-muted flex-shrink-0">Show:</span>
                    <button
                      onClick={() => setMapDayFilter('all')}
                      className={`px-3 py-1 text-xs rounded-full flex-shrink-0 transition-all duration-300 ${
                        mapDayFilter === 'all' 
                          ? 'bg-primary text-white' 
                          : 'bg-background border border-border/50 text-muted hover:border-primary'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setMapDayFilter('unassigned')}
                      className={`px-3 py-1 text-xs rounded-full flex-shrink-0 transition-all duration-300 ${
                        mapDayFilter === 'unassigned' 
                          ? 'bg-secondary text-white' 
                          : 'bg-background border border-border/50 text-muted hover:border-secondary'
                      }`}
                    >
                      Unassigned
                    </button>
                    {Array.from({ length: numDays }, (_, i) => i + 1).map((dayNum) => (
                      <button
                        key={dayNum}
                        onClick={() => setMapDayFilter(dayNum)}
                        className={`px-3 py-1 text-xs rounded-full flex-shrink-0 transition-all duration-300 ${
                          mapDayFilter === dayNum 
                            ? 'bg-primary text-white' 
                            : 'bg-background border border-border/50 text-muted hover:border-primary'
                        }`}
                      >
                        Day {dayNum}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="h-[280px] rounded-2xl overflow-hidden border border-border/50">
                  <MapWrapper
                    attractions={
                      mapDayFilter === 'all' 
                        ? attractions 
                        : mapDayFilter === 'unassigned'
                          ? unassigned
                          : dayGroups[mapDayFilter] || []
                    }
                    hotelLocation={trip.hotel_location}
                    center={trip.destination_coordinates}
                    selectedAttractionId={selectedAttractionId}
                    onMarkerClick={onSelectAttraction}
                    onMapClick={onMapClick}
                    isSelectingHotel={isSelectingHotel}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Days Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4 max-w-3xl">
              {numDays > 0 ? (
                Array.from({ length: numDays }, (_, i) => i + 1).map((dayNum) => (
                  <DayCard
                    key={dayNum}
                    dayNumber={dayNum}
                    startDate={start_date!}
                    attractions={dayGroups[dayNum] || []}
                    onRemoveAttraction={onRemoveAttraction}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border/50 p-8 text-center"
                >
                  <Calendar size={40} className="mx-auto mb-4 text-muted/40" strokeWidth={1} />
                  <h3 className="font-heading font-semibold text-foreground mb-2">Set Your Trip Dates</h3>
                  <p className="text-muted font-body font-light text-sm">
                    Add trip dates to organize your attractions into a day-by-day itinerary
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeAttraction && (
          <div className="opacity-90 w-[280px]">
            <PlaceCardContent
              attraction={activeAttraction}
              isDragging
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
