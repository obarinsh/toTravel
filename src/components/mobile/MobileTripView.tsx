'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { MoreHorizontal, Calendar, MapPin, Map, Utensils, Sparkles } from 'lucide-react';
import { Trip, Attraction, Coordinates } from '@/types';
import { calculateDays, formatDate } from '@/components/DateRangePicker';
import MobileItineraryTab from './MobileItineraryTab';
import MobileNearbyTab from './MobileNearbyTab';
import MobileMapTab from './MobileMapTab';
import BottomNavBar from './BottomNavBar';
import AddPlacesSheet from './AddPlacesSheet';
import FoodTab from '@/components/FoodTab';
import ActivitiesTab from '@/components/ActivitiesTab';

type MobileTabType = 'itinerary' | 'nearby' | 'map' | 'food' | 'activities';

interface MobileTripViewProps {
  trip: Trip;
  onAttractionsChange: (attractions: Attraction[]) => void;
  onMenuOpen: () => void;
  onEditDates: () => void;
}

export default function MobileTripView({
  trip,
  onAttractionsChange,
  onMenuOpen,
  onEditDates,
}: MobileTripViewProps) {
  const [activeTab, setActiveTab] = useState<MobileTabType>('itinerary');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [addToDay, setAddToDay] = useState<number | null>(null);

  const { attractions, start_date, end_date } = trip;
  const numDays = start_date && end_date ? calculateDays(start_date, end_date) : 0;

  // Count assigned and unassigned
  const assigned = attractions.filter((a) => a.day !== null && a.day !== undefined);
  const unassigned = attractions.filter((a) => a.day === null || a.day === undefined);

  // Format date range
  const dateRange = start_date && end_date
    ? `${formatDate(start_date).split(',')[0]} – ${formatDate(end_date).split(',')[0]}`
    : 'Set dates';

  const handleOpenAddSheet = (dayNumber?: number) => {
    setAddToDay(dayNumber ?? null);
    setIsAddSheetOpen(true);
  };

  const handleAssignToDay = (attractionId: string, dayNumber: number) => {
    const newAttractions = attractions.map((a) => {
      if (a.id === attractionId) {
        return { ...a, day: dayNumber };
      }
      return a;
    });
    onAttractionsChange(newAttractions);
    setIsAddSheetOpen(false);
  };

  const handleRemoveFromDay = (attractionId: string) => {
    const newAttractions = attractions.map((a) => {
      if (a.id === attractionId) {
        return { ...a, day: null };
      }
      return a;
    });
    onAttractionsChange(newAttractions);
  };

  const handleAddRestaurant = (restaurant: Omit<Attraction, 'id' | 'order'>) => {
    const newAttraction: Attraction = {
      ...restaurant,
      id: `rest-${Date.now()}`,
      order: attractions.length + 1,
    };
    onAttractionsChange([...attractions, newAttraction]);
  };

  const handleAddActivity = (activity: Omit<Attraction, 'id' | 'order'>) => {
    const newAttraction: Attraction = {
      ...activity,
      id: `act-${Date.now()}`,
      order: attractions.length + 1,
    };
    onAttractionsChange([...attractions, newAttraction]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-20 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-semibold text-foreground">
              {trip.name || trip.destination}
            </h1>
            <p className="text-sm text-muted mt-0.5">
              <button 
                onClick={onEditDates}
                className="hover:underline hover:text-foreground transition-colors"
              >
                {dateRange}
              </button>
              {' · '}{assigned.length} assigned · {unassigned.length} remaining
            </p>
          </div>
          <button
            onClick={onMenuOpen}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal size={20} className="text-muted" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 -mx-4 px-4 overflow-x-auto scrollbar-hide pb-1">
          <div className="inline-flex p-1 rounded-full overflow-hidden" style={{ backgroundColor: '#E8EBE3' }}>
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'itinerary' ? 'bg-white text-foreground shadow-sm' : 'text-muted'
              }`}
            >
              <Calendar size={12} strokeWidth={1.5} />
              Itinerary
            </button>
            <button
              onClick={() => setActiveTab('nearby')}
              className={`flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'nearby' ? 'bg-white text-foreground shadow-sm' : 'text-muted'
              }`}
            >
              <MapPin size={12} strokeWidth={1.5} />
              Nearby
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'map' ? 'bg-white text-foreground shadow-sm' : 'text-muted'
              }`}
            >
              <Map size={12} strokeWidth={1.5} />
              Map
            </button>
            <button
              onClick={() => setActiveTab('food')}
              className={`flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'food' ? 'bg-white text-foreground shadow-sm' : 'text-muted'
              }`}
            >
              <Utensils size={12} strokeWidth={1.5} />
              Food
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'activities' ? 'bg-white text-foreground shadow-sm' : 'text-muted'
              }`}
            >
              <Sparkles size={12} strokeWidth={1.5} />
              Activities
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'itinerary' && (
          <MobileItineraryTab
            trip={trip}
            numDays={numDays}
            onAddMore={handleOpenAddSheet}
            onRemoveAttraction={handleRemoveFromDay}
          />
        )}
        {activeTab === 'nearby' && (
          <MobileNearbyTab
            trip={trip}
            onAssignToDay={handleAssignToDay}
          />
        )}
        {activeTab === 'map' && (
          <MobileMapTab
            trip={trip}
            numDays={numDays}
          />
        )}
        {activeTab === 'food' && (
          <div className="px-4 py-2">
            <FoodTab
              destination={trip.destination}
              hotelLocation={trip.hotel_location}
              onAddRestaurant={handleAddRestaurant}
            />
          </div>
        )}
        {activeTab === 'activities' && (
          <div className="px-4 py-2">
            <ActivitiesTab
              destination={trip.destination}
              hotelLocation={trip.hotel_location}
              existingAttractions={attractions}
              onAddAttraction={handleAddActivity}
            />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddPress={() => handleOpenAddSheet()}
      />

      {/* Add Places Sheet */}
      <AddPlacesSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        unassignedAttractions={unassigned}
        numDays={numDays}
        targetDay={addToDay}
        onAssign={handleAssignToDay}
        startDate={start_date}
      />
    </div>
  );
}
