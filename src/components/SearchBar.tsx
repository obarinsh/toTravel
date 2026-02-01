'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, MapPin } from 'lucide-react';
import { GeocodingResult } from '@/types';

interface SearchBarProps {
  onSelect: (result: GeocodingResult) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchBar({ onSelect, placeholder = 'Search for a destination...', disabled = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSelect = (result: GeocodingResult) => {
    setQuery(result.display_name.split(',')[0]);
    setShowDropdown(false);
    onSelect(result);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted">
          <Search size={20} strokeWidth={1.5} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-14 pr-14 py-5 text-lg font-body font-light border border-border rounded-[2rem] bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-warm placeholder:text-muted/60"
        />
        {isLoading && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary">
            <Loader2 size={20} className="animate-spin" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && results.length > 0 && (
          <motion.ul 
            className="absolute z-50 w-full mt-3 bg-card border border-border rounded-[1.5rem] shadow-warm-lg overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {results.map((result, index) => (
              <motion.li 
                key={result.place_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => handleSelect(result)}
                  className="w-full px-6 py-4 text-left hover:bg-background transition-colors duration-200 border-b border-border/50 last:border-b-0 group flex items-start gap-4"
                >
                  <div className="mt-1 text-muted group-hover:text-secondary transition-colors duration-200">
                    <MapPin size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="font-heading font-semibold text-foreground block">
                      {result.display_name.split(',')[0]}
                    </span>
                    <span className="text-muted text-sm font-body font-light block truncate max-w-md">
                      {result.display_name}
                    </span>
                  </div>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
