'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Plus, Check, Info, Landmark, Building2, Trees, Church, PartyPopper, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { Attraction, AttractionCategory } from '@/types';
import { getDayDate } from '@/components/DateRangePicker';
import Image from 'next/image';
import PlaceModal from '@/components/PlaceModal';

const categoryConfig: Record<AttractionCategory, { label: string; icon: React.ElementType; color: string }> = {
  landmark: { label: 'Landmarks', icon: Landmark, color: '#E4B84A' },
  museum: { label: 'Museums', icon: Building2, color: '#8B5CF6' },
  nature: { label: 'Nature', icon: Trees, color: '#22C55E' },
  religious: { label: 'Religious', icon: Church, color: '#6366F1' },
  entertainment: { label: 'Entertainment', icon: PartyPopper, color: '#EC4899' },
  food: { label: 'Food', icon: UtensilsCrossed, color: '#F97316' },
  shopping: { label: 'Shopping', icon: ShoppingBag, color: '#06B6D4' },
};

interface AddPlacesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  unassignedAttractions: Attraction[];
  numDays: number;
  targetDay: number | null;
  onAssign: (attractionId: string, dayNumber: number) => void;
  startDate?: string | null;
}

export default function AddPlacesSheet({
  isOpen,
  onClose,
  unassignedAttractions,
  numDays,
  targetDay,
  onAssign,
  startDate,
}: AddPlacesSheetProps) {
  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(targetDay);
  const [viewingAttraction, setViewingAttraction] = useState<Attraction | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AttractionCategory | 'all'>('all');

  // Infer category from attraction name/description if not set
  const inferCategory = (attraction: Attraction): AttractionCategory => {
    if (attraction.category) return attraction.category;
    
    const text = `${attraction.name} ${attraction.description || ''}`.toLowerCase();
    
    if (text.includes('museum') || text.includes('gallery') || text.includes('art ')) return 'museum';
    if (text.includes('park') || text.includes('garden') || text.includes('beach') || text.includes('nature') || text.includes('mountain') || text.includes('lake') || text.includes('waterfall')) return 'nature';
    if (text.includes('church') || text.includes('cathedral') || text.includes('temple') || text.includes('mosque') || text.includes('monastery') || text.includes('religious')) return 'religious';
    if (text.includes('restaurant') || text.includes('food') || text.includes('market') || text.includes('cafe') || text.includes('cuisine')) return 'food';
    if (text.includes('shop') || text.includes('mall') || text.includes('store') || text.includes('boutique')) return 'shopping';
    if (text.includes('theater') || text.includes('cinema') || text.includes('show') || text.includes('entertainment') || text.includes('zoo') || text.includes('aquarium')) return 'entertainment';
    
    return 'landmark'; // Default
  };

  // Attractions with inferred categories
  const attractionsWithCategories = useMemo(() => {
    return unassignedAttractions.map(a => ({
      ...a,
      category: inferCategory(a),
    }));
  }, [unassignedAttractions]);

  // Get unique categories from attractions
  const availableCategories = useMemo(() => {
    const categories = new Set<AttractionCategory>();
    attractionsWithCategories.forEach(a => {
      categories.add(a.category!);
    });
    return Array.from(categories).sort();
  }, [attractionsWithCategories]);

  // Filter attractions by selected category
  const filteredAttractions = useMemo(() => {
    if (selectedCategory === 'all') return attractionsWithCategories;
    return attractionsWithCategories.filter(a => a.category === selectedCategory);
  }, [attractionsWithCategories, selectedCategory]);

  // Update selectedDay when targetDay changes
  useMemo(() => {
    if (targetDay !== null) {
      setSelectedDay(targetDay);
    }
  }, [targetDay]);

  const handleAssign = () => {
    if (selectedAttractionId && selectedDay) {
      onAssign(selectedAttractionId, selectedDay);
      setSelectedAttractionId(null);
      setSelectedDay(targetDay);
    }
  };

  const handleSelectAttraction = (id: string) => {
    setSelectedAttractionId(selectedAttractionId === id ? null : id);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 border-b border-border">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Add Places
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-muted" />
              </button>
            </div>

            {/* Day Selector (if no target day) */}
            {targetDay === null && numDays > 0 && (
              <div className="px-5 py-3 border-b border-border">
                <p className="text-sm text-muted mb-2">Select a day:</p>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
                  {Array.from({ length: numDays }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        selectedDay === day
                          ? 'bg-[#5C6B4A] text-white'
                          : 'bg-gray-100 text-muted hover:bg-gray-200'
                      }`}
                    >
                      Day {day}
                      {startDate && (
                        <span className="ml-1 text-xs opacity-70">
                          ({getDayDate(startDate, day).split(',')[0]})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter */}
            {unassignedAttractions.length > 0 && (
              <div className="px-5 py-3 border-b border-border">
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedCategory === 'all'
                        ? 'bg-[#5C6B4A] text-white'
                        : 'bg-gray-100 text-muted hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {availableCategories.map((cat) => {
                    const config = categoryConfig[cat];
                    const Icon = config.icon;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          selectedCategory === cat
                            ? 'text-white'
                            : 'bg-gray-100 text-muted hover:bg-gray-200'
                        }`}
                        style={selectedCategory === cat ? { backgroundColor: config.color } : undefined}
                      >
                        <Icon size={12} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Unassigned List */}
            <div className="flex-1 overflow-y-auto p-5">
              {filteredAttractions.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  <MapPin size={32} className="mx-auto mb-3 opacity-50" />
                  <p>{unassignedAttractions.length === 0 ? 'All places have been assigned!' : 'No places in this category'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAttractions.map((attraction) => (
                    <div
                      key={attraction.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        selectedAttractionId === attraction.id
                          ? 'bg-[#5C6B4A]/10 ring-2 ring-[#5C6B4A]'
                          : 'bg-gray-50'
                      }`}
                    >
                      {/* Checkbox - tappable area for selection */}
                      <button
                        onClick={() => handleSelectAttraction(attraction.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                          selectedAttractionId === attraction.id
                            ? 'bg-[#5C6B4A]'
                            : 'bg-white border-2 border-gray-300'
                        }`}
                      >
                        {selectedAttractionId === attraction.id && (
                          <Check size={14} className="text-white" strokeWidth={3} />
                        )}
                      </button>

                      {/* Clickable content area - opens details */}
                      <button
                        onClick={() => setViewingAttraction(attraction)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      >
                        {/* Image */}
                        {attraction.photo_url ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={attraction.photo_url}
                              alt={attraction.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: 'rgba(92, 107, 74, 0.1)' }}
                          >
                            <MapPin size={16} style={{ color: '#5C6B4A' }} />
                          </div>
                        )}
                        
                        {/* Name and Category */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {attraction.name}
                          </p>
                          {attraction.category && categoryConfig[attraction.category] && (
                            <span 
                              className="inline-flex items-center gap-1 text-[10px] font-medium mt-0.5 px-1.5 py-0.5 rounded-full"
                              style={{ 
                                backgroundColor: `${categoryConfig[attraction.category].color}15`,
                                color: categoryConfig[attraction.category].color
                              }}
                            >
                              {(() => {
                                const Icon = categoryConfig[attraction.category!].icon;
                                return <Icon size={10} />;
                              })()}
                              {categoryConfig[attraction.category].label}
                            </span>
                          )}
                          {attraction.description && (
                            <p className="text-xs text-muted truncate">
                              {attraction.description}
                            </p>
                          )}
                        </div>

                        {/* Info icon hint */}
                        <Info size={16} className="text-muted flex-shrink-0" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Add Button */}
            {unassignedAttractions.length > 0 && (
              <div className="p-5 border-t border-border safe-area-pb">
                <button
                  onClick={handleAssign}
                  disabled={!selectedAttractionId || !selectedDay}
                  className="w-full py-3.5 rounded-full text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#5C6B4A' }}
                >
                  {selectedDay ? (
                    <>Add to Day {selectedDay}</>
                  ) : (
                    <>Select a day</>
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* Place Details Modal */}
          {viewingAttraction && (
            <PlaceModal
              attraction={viewingAttraction}
              isOpen={!!viewingAttraction}
              onClose={() => setViewingAttraction(null)}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
