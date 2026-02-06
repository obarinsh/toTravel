'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Package, Sparkles, Loader2 } from 'lucide-react';
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
  onGenerateMore?: (category?: string) => Promise<void>;
  isGenerating?: boolean;
}

// Get place type from description
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

export default function SuggestionsPanel({
  attractions,
  selectedAttractionId,
  onSelectAttraction,
  onRemoveAttraction,
  onGenerateMore,
  isGenerating,
}: SuggestionsPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [generatingCategory, setGeneratingCategory] = useState<string | null>(null);

  const handleGenerateMore = async (category?: string) => {
    if (!onGenerateMore || isGenerating) return;
    setGeneratingCategory(category || 'all');
    try {
      await onGenerateMore(category);
    } finally {
      setGeneratingCategory(null);
    }
  };

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
      `}
      style={isOver ? { backgroundColor: 'rgba(92, 107, 74, 0.05)' } : undefined}
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
                      ? 'text-white shadow-warm'
                      : 'bg-background text-muted hover:text-foreground border border-border/50'
                  }`}
                  style={activeFilter === filter ? { backgroundColor: '#5C6B4A' } : { ':hover': { backgroundColor: '#E8EBE3' } } as React.CSSProperties}
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
                      isActive={selectedAttractionId === attraction.id}
                      onClick={() => onSelectAttraction(attraction.id)}
                    />
                  </motion.div>
                ))}

                {sortedAttractions.length === 0 && (
                  <div className="text-center py-8 text-muted text-sm font-body font-light">
                    <Package size={32} className="mx-auto mb-3 opacity-40" strokeWidth={1} />
                    {attractions.length === 0 
                      ? 'All places assigned!' 
                      : 'No matches for this filter'}
                  </div>
                )}

                {/* Generate More Button */}
                {onGenerateMore && (
                  <button
                    onClick={() => handleGenerateMore(activeFilter === 'All' ? undefined : activeFilter.toLowerCase())}
                    disabled={isGenerating}
                    className="w-full mt-3 py-2.5 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed text-xs font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
                    style={{ borderColor: '#5C6B4A', color: '#5C6B4A' }}
                  >
                    {isGenerating && generatingCategory ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        {activeFilter === 'All' ? 'Generate more places' : `More ${activeFilter}`}
                      </>
                    )}
                  </button>
                )}
              </div>
            </SortableContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
