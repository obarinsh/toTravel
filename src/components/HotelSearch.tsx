'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, MapPin, Sparkles } from 'lucide-react';

interface HotelSearchResult {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  source?: 'nominatim' | 'ai';
}

interface HotelSearchProps {
  destination: string;
  onSelect: (result: { name: string; address: string; coordinates: { lat: number; lng: number } }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function HotelSearch({ destination, onSelect, onCancel, isLoading: externalLoading }: HotelSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<HotelSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isManualSearching, setIsManualSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for suggestions using Nominatim
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Try multiple search strategies
        const searchQueries = [
          `${query} hotel ${destination}`,
          `${query} ${destination}`,
          query,
        ];
        
        let results: HotelSearchResult[] = [];
        
        for (const searchQuery of searchQueries) {
          if (results.length >= 3) break;
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
            { headers: { 'User-Agent': 'LaLuz App' } }
          );
          
          if (response.ok) {
            const data: HotelSearchResult[] = await response.json();
            // Add results that aren't duplicates
            for (const item of data) {
              if (!results.find(r => r.place_id === item.place_id)) {
                results.push({ ...item, source: 'nominatim' });
              }
            }
          }
        }
        
        // Limit to 6 results
        results = results.slice(0, 6);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, destination]);

  const handleSelect = (result: HotelSearchResult) => {
    // Extract a clean name from the display_name
    const nameParts = result.display_name.split(',');
    const cleanName = nameParts[0].trim();
    
    onSelect({
      name: cleanName,
      address: result.display_name,
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      },
    });
    setShowSuggestions(false);
  };

  // Manual search using AI geocoding when user clicks "Find with AI"
  const handleAISearch = async () => {
    if (!query.trim()) return;
    
    setIsManualSearching(true);
    setShowSuggestions(false);
    
    try {
      const response = await fetch('/api/geocode-place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeName: query,
          city: destination,
        }),
      });

      if (response.ok) {
        const { coordinates, address } = await response.json();
        onSelect({
          name: query.trim(),
          address: address || `${query}, ${destination}`,
          coordinates,
        });
      } else {
        // Show error in suggestions area
        setSuggestions([]);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('AI search error:', error);
    } finally {
      setIsManualSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    } else if (query.trim()) {
      // If no suggestions, try AI search
      handleAISearch();
    }
  };

  // Extract short address from full display_name
  const getShortAddress = (displayName: string) => {
    const parts = displayName.split(',');
    return parts.slice(1, 3).join(',').trim();
  };

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search hotel..."
            className="w-48 pl-8 pr-3 py-1.5 text-sm font-body border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-secondary/30"
            disabled={externalLoading || isManualSearching}
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" strokeWidth={1.5} />
          {(isSearching || isManualSearching) && (
            <Loader2 size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary animate-spin" strokeWidth={2} />
          )}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </form>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && !isManualSearching && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-80 bg-card border border-border rounded-xl shadow-warm-lg overflow-hidden z-50"
          >
            <div className="max-h-72 overflow-y-auto">
              {suggestions.length > 0 ? (
                suggestions.map((result) => (
                  <button
                    key={result.place_id}
                    type="button"
                    onClick={() => handleSelect(result)}
                    className="w-full px-3 py-2.5 text-left hover:bg-moss-light/50 transition-colors border-b border-border/30 last:border-0"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-secondary mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-body font-medium text-foreground line-clamp-1">
                          {result.display_name.split(',')[0]}
                        </p>
                        <p className="text-xs text-muted font-body font-light line-clamp-1 mt-0.5">
                          {getShortAddress(result.display_name)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : query.length >= 2 && !isSearching ? (
                <div className="p-3">
                  <p className="text-xs text-muted font-body mb-2">No results found in map data.</p>
                </div>
              ) : null}
              
              {/* AI Search option - always show when there's a query */}
              {query.trim().length >= 2 && !isSearching && (
                <button
                  type="button"
                  onClick={handleAISearch}
                  className="w-full px-3 py-2.5 text-left hover:bg-secondary/10 transition-colors border-t border-border/50 bg-secondary/5"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-secondary flex-shrink-0" strokeWidth={1.5} />
                    <div className="flex-1">
                      <p className="text-sm font-body font-medium text-secondary">
                        Find "{query}" with AI
                      </p>
                      <p className="text-xs text-muted font-body font-light">
                        Use AI to locate this place
                      </p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
