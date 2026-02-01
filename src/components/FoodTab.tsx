'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, Leaf, Wheat } from 'lucide-react';
import { Coordinates } from '@/types';

interface FoodTabProps {
  destination: string;
  hotelLocation?: Coordinates;
  startDate?: string | null;
  endDate?: string | null;
  numDays: number;
}

interface Restaurant {
  name: string;
  cuisine: string;
  description: string;
  priceRange: string;
  dietaryOptions: string[];
}

// Simple markdown parser for AI responses
function formatResponse(text: string): React.ReactNode {
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let partIndex = 0;
    
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(<span key={`${lineIndex}-${partIndex++}`}>{remaining.slice(0, boldMatch.index)}</span>);
        }
        parts.push(<strong key={`${lineIndex}-${partIndex++}`} className="font-semibold text-foreground">{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      } else {
        parts.push(<span key={`${lineIndex}-${partIndex++}`}>{remaining}</span>);
        break;
      }
    }
    
    return (
      <p key={lineIndex} className={line.trim() === '' ? 'h-3' : 'mb-2'}>
        {parts.length > 0 ? parts : '\u00A0'}
      </p>
    );
  });
}

const DIETARY_FILTERS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: Leaf },
  { id: 'vegan', label: 'Vegan', icon: Leaf },
  { id: 'kosher', label: 'Kosher', icon: null },
  { id: 'halal', label: 'Halal', icon: null },
  { id: 'gluten-free', label: 'Gluten-Free', icon: Wheat },
];

const CUISINE_FILTERS = [
  'Local', 'Italian', 'Asian', 'Mediterranean', 'French', 'American', 'Indian', 'Mexican', 'Japanese', 'Thai'
];

export default function FoodTab({ destination, hotelLocation, numDays }: FoodTabProps) {
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [cuisineFilter, setCuisineFilter] = useState<string>('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const toggleDietaryFilter = (filter: string) => {
    setDietaryFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const searchRestaurants = async () => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const filterString = [
        ...dietaryFilters,
        cuisineFilter
      ].filter(Boolean).join(', ');

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          query: `Recommend 5 restaurants in ${destination}${filterString ? ` that are ${filterString}` : ''}. For each restaurant provide: name, cuisine type, brief description, price range ($, $$, $$$), and any dietary options they accommodate. Format as a list.`,
          hotelLocation,
        }),
      });

      const data = await response.json();
      
      if (data.response) {
        setRestaurants([{
          name: 'Search Results',
          cuisine: '',
          description: data.response,
          priceRange: '',
          dietaryOptions: [],
        }]);
      }
    } catch (error) {
      console.error('Error searching restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Day selector */}
      {numDays > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <span className="label-premium text-muted flex-shrink-0">Day:</span>
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-5 py-2.5 text-sm rounded-full flex-shrink-0 transition-all duration-300 font-body ${
              selectedDay === 'all'
                ? 'bg-foreground text-background'
                : 'bg-card border border-border/50 text-muted hover:border-primary hover:text-foreground'
            }`}
          >
            All Days
          </button>
          {Array.from({ length: numDays }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-2.5 text-sm rounded-full flex-shrink-0 transition-all duration-300 font-body ${
                selectedDay === day
                  ? 'bg-foreground text-background'
                  : 'bg-card border border-border/50 text-muted hover:border-primary hover:text-foreground'
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>
      )}

      {/* Dietary filters */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-foreground">Dietary Preferences</h3>
        <div className="flex flex-wrap gap-3">
          {DIETARY_FILTERS.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => toggleDietaryFilter(filter.id)}
              className={`px-5 py-3 rounded-[2rem] text-sm flex items-center gap-2 transition-all duration-300 font-body ${
                dietaryFilters.includes(filter.id)
                  ? 'bg-secondary text-white shadow-warm'
                  : 'bg-card border border-border/50 text-foreground hover:border-secondary hover:scale-[1.02]'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {filter.icon && <filter.icon size={16} strokeWidth={1.5} />}
              {filter.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cuisine filter */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-foreground">Cuisine Type</h3>
        <div className="flex flex-wrap gap-3">
          {CUISINE_FILTERS.map((cuisine) => (
            <motion.button
              key={cuisine}
              onClick={() => setCuisineFilter(cuisineFilter === cuisine ? '' : cuisine)}
              className={`px-5 py-3 rounded-[2rem] text-sm transition-all duration-300 font-body ${
                cuisineFilter === cuisine
                  ? 'bg-primary text-white shadow-warm'
                  : 'bg-card border border-border/50 text-foreground hover:border-primary hover:scale-[1.02]'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {cuisine}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Search button */}
      <motion.button
        onClick={searchRestaurants}
        disabled={isLoading}
        className="w-full py-4 bg-primary text-white rounded-[2rem] font-body font-medium hover:bg-primary-dark hover:scale-[1.01] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-3 shadow-warm"
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" strokeWidth={1.5} />
            <span>Searching...</span>
          </>
        ) : (
          <>
            <Search size={20} strokeWidth={1.5} />
            <span>Find Restaurants</span>
          </>
        )}
      </motion.button>

      {/* Results */}
      {hasSearched && (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-heading font-semibold text-lg text-foreground">Recommendations</h3>
          {restaurants.length > 0 ? (
            <div className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-warm">
              <div className="text-sm text-muted font-body font-light leading-relaxed">
                {formatResponse(restaurants[0].description)}
              </div>
            </div>
          ) : (
            <p className="text-muted text-center py-12 font-body font-light">No restaurants found. Try adjusting your filters.</p>
          )}
        </motion.div>
      )}

      {/* Empty state */}
      {!hasSearched && (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-20 h-20 bg-secondary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-secondary" strokeWidth={1} />
          </div>
          <p className="font-heading text-xl font-semibold mb-2 text-foreground">Find the perfect restaurant</p>
          <p className="text-muted font-body font-light">Select your preferences and search for recommendations</p>
        </motion.div>
      )}
    </motion.div>
  );
}
