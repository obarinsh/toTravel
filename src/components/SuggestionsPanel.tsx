'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { Attraction } from '@/types';
import { SortablePlaceCard } from './PlaceCard';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface SuggestionsPanelProps {
  attractions: Attraction[];
  selectedAttractionId?: string | null;
  onSelectAttraction: (id: string) => void;
  onRemoveAttraction?: (id: string) => void;
}

// Map attraction types to emojis
const typeEmojis: Record<string, string> = {
  'Nature': '🏞️',
  'Historic': '🏛️',
  'Park': '⛵',
  'Landmark': '🗼',
  'Food': '🍦',
  'Shopping': '🛍️',
  'Museum': '🎨',
  'Beach': '🏖️',
  'Entertainment': '🎭',
  'Religious': '⛪',
  'Architecture': '🏰',
  'Garden': '🌸',
  'Default': '📍',
};

// Try to determine type from description/name
function getPlaceType(attraction: Attraction): string {
  const text = `${attraction.name} ${attraction.description}`.toLowerCase();
  
  if (text.includes('museum') || text.includes('gallery')) return 'Museum';
  if (text.includes('park') || text.includes('garden')) return 'Park';
  if (text.includes('church') || text.includes('cathedral') || text.includes('basilica') || text.includes('temple')) return 'Religious';
  if (text.includes('palace') || text.includes('castle') || text.includes('tower')) return 'Architecture';
  if (text.includes('beach') || text.includes('coast')) return 'Beach';
  if (text.includes('restaurant') || text.includes('food') || text.includes('cafe')) return 'Food';
  if (text.includes('market') || text.includes('shop')) return 'Shopping';
  if (text.includes('mountain') || text.includes('lake') || text.includes('river') || text.includes('nature') || text.includes('forest')) return 'Nature';
  if (text.includes('historic') || text.includes('monument') || text.includes('memorial')) return 'Historic';
  
  return 'Landmark';
}

function getEmoji(attraction: Attraction): string {
  const type = getPlaceType(attraction);
  return typeEmojis[type] || typeEmojis['Default'];
}

function getDuration(): string {
  const durations = ['1-2 hrs', '2-3 hrs', '3-4 hrs', 'Half day', 'Full day'];
  return durations[Math.floor(Math.random() * 3)]; // Mostly shorter durations
}

export default function SuggestionsPanel({
  attractions,
  selectedAttractionId,
  onSelectAttraction,
  onRemoveAttraction,
}: SuggestionsPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned',
  });

  // Get unique types from attractions
  const types = ['All', ...new Set(attractions.map(a => getPlaceType(a)))];

  // Filter attractions
  const filteredAttractions = activeFilter === 'All'
    ? attractions
    : attractions.filter(a => getPlaceType(a) === activeFilter);

  // Sort by order
  const sortedAttractions = [...filteredAttractions].sort((a, b) => a.order - b.order);

  return (
    <div
      ref={setNodeRef}
      className={`
        ${isCollapsed ? 'w-14' : 'w-80'} 
        bg-card border-r border-border/50 flex flex-col transition-all duration-300 flex-shrink-0 h-full
        ${isOver ? 'bg-secondary/5' : ''}
      `}
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-border/30 flex items-center justify-between">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="font-heading font-semibold text-foreground">Suggestions</h2>
              <p className="text-xs text-muted font-body font-light">{attractions.length} places to explore</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-background rounded-xl text-muted transition-colors duration-300"
        >
          {isCollapsed ? <ChevronRight size={18} strokeWidth={1.5} /> : <ChevronLeft size={18} strokeWidth={1.5} />}
        </button>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Filters */}
            <div className="p-3 border-b border-border/30 flex gap-1.5 flex-wrap">
              {types.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-1 text-xs rounded-full transition-all duration-300 ${
                    activeFilter === filter
                      ? 'bg-secondary text-white shadow-warm'
                      : 'bg-background text-muted hover:bg-primary/10 hover:text-foreground border border-border/50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Places List */}
            <SortableContext
              items={sortedAttractions.map(a => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {sortedAttractions.map((attraction, index) => (
                  <motion.div
                    key={attraction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <SortablePlaceCard
                      attraction={attraction}
                      emoji={getEmoji(attraction)}
                      type={getPlaceType(attraction)}
                      duration={getDuration()}
                      isActive={selectedAttractionId === attraction.id}
                      onClick={() => onSelectAttraction(attraction.id)}
                    />
                  </motion.div>
                ))}

                {sortedAttractions.length === 0 && (
                  <div className="text-center py-8 text-muted text-sm font-body font-light">
                    <Package size={32} className="mx-auto mb-3 opacity-40" strokeWidth={1} />
                    {attractions.length === 0 
                      ? 'All places assigned! 🎉' 
                      : 'No matches for this filter'}
                  </div>
                )}
              </div>
            </SortableContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
