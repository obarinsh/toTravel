'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoreHorizontal, Calendar, MapPin, Map, Utensils, Sparkles, Pencil, X, Check } from 'lucide-react';
import { Trip, Attraction } from '@/types';
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
  onNameChange?: (name: string) => void;
  onGenerateMore?: () => Promise<void>;
  isGenerating?: boolean;
}

export default function MobileTripView({
  trip,
  onAttractionsChange,
  onMenuOpen,
  onEditDates,
  onNameChange,
  onGenerateMore,
  isGenerating,
}: MobileTripViewProps) {
  const [activeTab, setActiveTab] = useState<MobileTabType>('itinerary');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [addToDay, setAddToDay] = useState<number | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(trip.name || '');

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

  const handleSaveName = () => {
    if (onNameChange) {
      onNameChange(editedName.trim() || trip.destination);
    }
    setIsEditingName(false);
  };

  const handleCancelEditName = () => {
    setEditedName(trip.name || '');
    setIsEditingName(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-20 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            {/* Trip Name - Tappable to edit */}
            <button
              onClick={() => setIsEditingName(true)}
              className="flex items-center gap-2 group text-left"
            >
              <h1 className="font-heading text-xl font-semibold text-foreground truncate">
                {trip.name || trip.destination}
              </h1>
              <Pencil 
                size={14} 
                className="text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" 
              />
            </button>
            {/* Destination (shown if name is different) */}
            {trip.name && trip.name !== trip.destination && (
              <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                <MapPin size={10} />
                {trip.destination}
              </p>
            )}
            {/* Date and stats */}
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
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
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
        onGenerateMore={onGenerateMore}
        isGenerating={isGenerating}
      />

      {/* Edit Name Sheet */}
      <AnimatePresence>
        {isEditingName && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelEditName}
              className="fixed inset-0 bg-black/40 z-50"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl"
              style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-4">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Edit Trip Name
                </h2>
                <button
                  onClick={handleCancelEditName}
                  className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-muted" />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 pb-4">
                {/* Destination info */}
                <p className="text-xs text-muted mb-3 flex items-center gap-1">
                  <MapPin size={12} />
                  Destination: {trip.destination}
                </p>

                {/* Name input */}
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder={trip.destination}
                  className="w-full px-4 py-3 border-2 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5C6B4A]/20 focus:border-[#5C6B4A] transition-all text-base"
                  style={{ borderColor: '#D1D5C8', color: '#4A4F45' }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEditName();
                  }}
                />
                <p className="text-xs text-muted mt-2">
                  Leave empty to use the destination name
                </p>

                {/* Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCancelEditName}
                    className="flex-1 px-4 py-3 rounded-full text-sm font-medium transition-colors border-2"
                    style={{ borderColor: '#D1D5C8', color: '#8B9082' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveName}
                    className="flex-1 px-4 py-3 rounded-full text-sm font-medium text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#5C6B4A' }}
                  >
                    <Check size={16} />
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
