'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, Plus, Check, ImageIcon, MapPin, Star } from 'lucide-react';
import { Coordinates, Attraction } from '@/types';
import RestaurantModal from './RestaurantModal';

interface FoodTabProps {
  destination: string;
  hotelLocation?: Coordinates;
  onAddRestaurant?: (restaurant: Omit<Attraction, 'id' | 'order'>) => void;
}

interface RestaurantCard {
  id?: string;
  name: string;
  cuisine: string;
  description?: string;
  priceRange: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  photoUrl?: string | null;
  website?: string | null;
  googleMapsUrl?: string | null;
  coordinates?: { lat: number; lng: number } | null;
  isAdded: boolean;
  isAdding?: boolean;
}

// Fetch image from our API (fallback)
async function fetchRestaurantImage(name: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/image?query=${encodeURIComponent(name + ' restaurant food')}`);
    if (response.ok) {
      const data = await response.json();
      return data.imageUrl || null;
    }
    return null;
  } catch {
    return null;
  }
}

const DIETARY_FILTERS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'kosher', label: 'Kosher' },
  { id: 'halal', label: 'Halal' },
  { id: 'gluten-free', label: 'Gluten-Free' },
];

const CUISINE_FILTERS = [
  { id: 'local', label: 'Local' },
  { id: 'italian', label: 'Italian' },
  { id: 'asian', label: 'Asian' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'french', label: 'French' },
  { id: 'american', label: 'American' },
  { id: 'indian', label: 'Indian' },
  { id: 'mexican', label: 'Mexican' },
  { id: 'japanese', label: 'Japanese' },
  { id: 'thai', label: 'Thai' },
];

// Restaurant Card Component with real data support
function RestaurantCardComponent({ 
  restaurant, 
  index,
  onAdd,
}: { 
  restaurant: RestaurantCard; 
  index: number;
  onAdd: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(restaurant.photoUrl || null);
  const [imageLoading, setImageLoading] = useState(!restaurant.photoUrl);
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch fallback image if no photo provided
  useEffect(() => {
    if (!restaurant.photoUrl) {
      setImageLoading(true);
      setImageError(false);
      fetchRestaurantImage(restaurant.name).then((url) => {
        setImageUrl(url);
        setImageLoading(false);
      });
    }
  }, [restaurant.name, restaurant.photoUrl]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="bg-background rounded-xl overflow-hidden border border-transparent hover:border-border/50 hover:bg-moss-light/50 transition-all duration-300 group cursor-pointer"
        whileHover={{ scale: 1.01 }}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-start gap-3 p-3">
          {/* Photo thumbnail */}
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-moss-light relative">
            {imageLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={20} className="text-secondary/40 animate-pulse" strokeWidth={1.5} />
              </div>
            ) : imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={restaurant.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-secondary/30 to-secondary/50 flex items-center justify-center">
                <ImageIcon size={20} className="text-white/60" strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-medium text-foreground text-sm leading-tight line-clamp-1">
              {restaurant.name}
            </h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-muted font-body font-light">
                {restaurant.cuisine}
              </span>
              {restaurant.priceRange && (
                <>
                  <span className="text-border">·</span>
                  <span className="text-xs text-muted font-body font-light">
                    {restaurant.priceRange}
                  </span>
                </>
              )}
              {restaurant.rating && (
                <>
                  <span className="text-border">·</span>
                  <span className="text-xs text-secondary font-body font-medium flex items-center gap-0.5">
                    <Star size={10} strokeWidth={2} fill="currentColor" />
                    {restaurant.rating.toFixed(1)}
                  </span>
                </>
              )}
            </div>
            
            {/* Address */}
            {restaurant.address && (
              <p className="text-xs text-secondary font-body font-light mt-1 flex items-center gap-1 truncate">
                <MapPin size={10} strokeWidth={1.5} />
                <span className="truncate">{restaurant.address}</span>
              </p>
            )}
          </div>

          {/* Add button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            disabled={restaurant.isAdded || restaurant.isAdding}
            className={`flex-shrink-0 p-2 rounded-xl transition-all duration-300 text-white hover:scale-105 ${
              restaurant.isAdded ? 'bg-green-500' : ''
            }`}
            style={{ backgroundColor: restaurant.isAdded ? '#22c55e' : restaurant.isAdding ? 'rgba(92, 107, 74, 0.5)' : '#5C6B4A' }}
            whileTap={restaurant.isAdded || restaurant.isAdding ? {} : { scale: 0.95 }}
          >
            {restaurant.isAdded ? (
              <Check size={16} strokeWidth={2} />
            ) : restaurant.isAdding ? (
              <Loader2 size={16} strokeWidth={2} className="animate-spin" />
            ) : (
              <Plus size={16} strokeWidth={2} />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Modal */}
      <RestaurantModal
        restaurant={{
          ...restaurant,
          photoUrl: imageUrl,
        }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default function FoodTab({ destination, hotelLocation, onAddRestaurant }: FoodTabProps) {
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [cuisineFilters, setCuisineFilters] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const toggleDietaryFilter = (filter: string) => {
    setDietaryFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const toggleCuisineFilter = (filter: string) => {
    setCuisineFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Try Google Places API first, fall back to AI
  const searchRestaurants = async () => {
    setIsLoading(true);
    setHasSearched(true);
    setRestaurants([]); // Clear previous results

    try {
      // Try Google Places API first
      const googleResponse = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          cuisine: cuisineFilters.map(id => CUISINE_FILTERS.find(f => f.id === id)?.label).filter(Boolean),
          dietary: dietaryFilters.map(id => DIETARY_FILTERS.find(f => f.id === id)?.label).filter(Boolean),
          coordinates: hotelLocation,
        }),
      });

      if (!googleResponse.ok) {
        console.log('Google Places API error, falling back to AI');
        await searchRestaurantsWithAI();
        return;
      }

      const googleData = await googleResponse.json();
      console.log('Google Places response:', googleData);

      // If we got real restaurants from Google
      if (googleData.restaurants && googleData.restaurants.length > 0) {
        setRestaurants(googleData.restaurants.map((r: RestaurantCard) => ({
          ...r,
          isAdded: false,
        })));
        setIsLoading(false);
        return;
      }

      // Fall back to AI-generated results if no results or fallback flag
      console.log('No Google results, falling back to AI');
      await searchRestaurantsWithAI();

    } catch (error) {
      console.error('Error with Google Places, falling back to AI:', error);
      await searchRestaurantsWithAI();
    } finally {
      setIsLoading(false);
    }
  };

  // AI fallback search
  const searchRestaurantsWithAI = async () => {
    try {
      const dietaryString = dietaryFilters.length > 0 
        ? dietaryFilters.map(id => DIETARY_FILTERS.find(f => f.id === id)?.label).join(', ')
        : '';
      const cuisineString = cuisineFilters.length > 0
        ? cuisineFilters.map(id => CUISINE_FILTERS.find(f => f.id === id)?.label).join(', ')
        : '';

      const filters = [dietaryString, cuisineString].filter(Boolean).join(' and ');

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          query: `Recommend 6 real restaurants in ${destination}${filters ? ` that serve ${filters} cuisine` : ''}. 

For each restaurant, use this EXACT format:
1. **Restaurant Name**
CUISINE: [Type of cuisine]
PRICE: [$ or $$ or $$$]
ADDRESS: [Street address in ${destination}]
DESCRIPTION: A brief 1-2 sentence description of the restaurant and what makes it special.

Make sure each restaurant has a real name, cuisine type, price range, and address.`,
          hotelLocation,
        }),
      });

      const data = await response.json();
      
      if (data.response) {
        const parsed = parseRestaurantsFromResponse(data.response);
        setRestaurants(parsed.length > 0 ? parsed : []);
      }
    } catch (error) {
      console.error('Error searching restaurants with AI:', error);
    }
  };

  const parseRestaurantsFromResponse = (response: string): RestaurantCard[] => {
    const restaurants: RestaurantCard[] = [];
    
    const sections = response.split(/(?=\d+\.\s)/);
    
    for (const section of sections) {
      const trimmed = section.trim();
      if (!trimmed || trimmed.length < 10) continue;
      
      if (!trimmed.match(/^\d+\.\s/)) continue;
      
      const firstLine = trimmed.split('\n')[0].toLowerCase();
      if (firstLine.includes('here are') || 
          firstLine.includes('excellent') || 
          firstLine.includes('recommend') ||
          firstLine.includes('serving') ||
          firstLine.includes('restaurants in')) continue;
      
      const nameMatch = trimmed.match(/^\d+\.\s*\*?\*?([^*\n]+)\*?\*?\s*$/m) || 
                        trimmed.match(/^\d+\.\s*\*\*([^*]+)\*\*/);
      
      const addressMatch = trimmed.match(/ADDRESS:\s*([^\n]+)/i);
      const cuisineMatch = trimmed.match(/CUISINE:\s*([^\n]+)/i);
      const priceMatch = trimmed.match(/PRICE:\s*([^\n]+)/i) || trimmed.match(/(\$+)/);
      const descMatch = trimmed.match(/DESCRIPTION:\s*([\s\S]+)/i);
      
      let name = '';
      let address = '';
      let cuisine = '';
      let priceRange = '';
      let description = '';
      
      if (nameMatch) {
        name = nameMatch[1].replace(/\*\*/g, '').replace(/[-–:]\s*$/, '').trim();
      }
      
      if (addressMatch) address = addressMatch[1].trim();
      if (cuisineMatch) cuisine = cuisineMatch[1].trim();
      if (priceMatch) priceRange = priceMatch[1].trim();
      if (descMatch) description = descMatch[1].replace(/\*\*/g, '').trim();
      
      if (!name) {
        const lines = trimmed.split('\n').filter(l => l.trim());
        if (lines.length > 0) {
          name = lines[0].replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').replace(/[-–:]\s*$/, '').trim();
          
          for (const line of lines.slice(1)) {
            const lower = line.toLowerCase();
            if (lower.startsWith('address:')) address = line.replace(/^address:\s*/i, '').trim();
            else if (lower.startsWith('cuisine:')) cuisine = line.replace(/^cuisine:\s*/i, '').trim();
            else if (lower.startsWith('price:')) priceRange = line.replace(/^price:\s*/i, '').trim();
            else if (lower.startsWith('description:')) description = line.replace(/^description:\s*/i, '').trim();
            else if (!description && !lower.includes(':')) description += ' ' + line;
          }
        }
      }
      
      if (!address) address = destination;
      if (!cuisine) cuisine = 'Restaurant';
      
      if (name && name.length > 2) {
        restaurants.push({
          name,
          cuisine,
          description: description.trim() || 'A great dining experience.',
          priceRange,
          address,
          isAdded: false,
        });
      }
    }
    
    return restaurants;
  };

  // Auto-load restaurants on first mount
  useEffect(() => {
    if (destination && !hasSearched && !isLoading) {
      searchRestaurants();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddRestaurant = async (restaurant: RestaurantCard, index: number) => {
    if (!onAddRestaurant) return;

    setRestaurants(prev => prev.map((r, i) => 
      i === index ? { ...r, isAdding: true } : r
    ));

    try {
      let coordinates = restaurant.coordinates || hotelLocation || { lat: 0, lng: 0 };
      
      // Geocode if no coordinates
      if (!restaurant.coordinates && restaurant.address) {
        const geocodeResponse = await fetch('/api/geocode-place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            placeName: restaurant.name,
            city: restaurant.address,
          }),
        });
        
        if (geocodeResponse.ok) {
          const geoData = await geocodeResponse.json();
          if (geoData.coordinates) {
            coordinates = { lat: geoData.coordinates.lat, lng: geoData.coordinates.lng };
          }
        }
      }

      // Call the callback to add the restaurant as an attraction
      onAddRestaurant({
        name: restaurant.name,
        description: `${restaurant.cuisine} · ${restaurant.priceRange}${restaurant.rating ? ` · ${restaurant.rating}★` : ''}\n${restaurant.description || ''}`,
        coordinates,
        day: null,
      });

      setRestaurants(prev => prev.map((r, i) => 
        i === index ? { ...r, isAdded: true, isAdding: false } : r
      ));
    } catch (error) {
      console.error('Error adding restaurant:', error);
      setRestaurants(prev => prev.map((r, i) => 
        i === index ? { ...r, isAdding: false } : r
      ));
    }
  };

  return (
    <motion.div 
      className="space-y-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Dietary filters - editorial style */}
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted mb-5 font-body">
          Dietary Preferences
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {DIETARY_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => toggleDietaryFilter(filter.id)}
              className="group relative py-1"
            >
              <span className={`text-sm tracking-wide transition-colors duration-200 font-body ${
                dietaryFilters.includes(filter.id)
                  ? 'text-foreground'
                  : 'text-muted hover:text-foreground/70'
              }`}>
                {filter.label}
              </span>
              <span 
                className={`absolute bottom-0 left-0 h-[1px] transition-all duration-300 ease-out ${
                  dietaryFilters.includes(filter.id)
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                }`} 
                style={{ backgroundColor: dietaryFilters.includes(filter.id) ? '#5C6B4A' : '#8B9082' }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Cuisine filter - editorial style */}
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted mb-5 font-body">
          Cuisine Type
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {CUISINE_FILTERS.map((cuisine) => (
            <button
              key={cuisine.id}
              onClick={() => toggleCuisineFilter(cuisine.id)}
              className="group relative py-1"
            >
              <span className={`text-sm tracking-wide transition-colors duration-200 font-body ${
                cuisineFilters.includes(cuisine.id)
                  ? 'text-foreground'
                  : 'text-muted hover:text-foreground/70'
              }`}>
                {cuisine.label}
              </span>
              <span 
                className={`absolute bottom-0 left-0 h-[1px] transition-all duration-300 ease-out ${
                  cuisineFilters.includes(cuisine.id)
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                }`} 
                style={{ backgroundColor: cuisineFilters.includes(cuisine.id) ? '#5C6B4A' : '#8B9082' }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Search button - compact */}
      <div>
        <motion.button
          onClick={searchRestaurants}
          disabled={isLoading}
          className="px-8 py-3 text-white text-xs tracking-[0.15em] uppercase disabled:opacity-50 transition-colors duration-200 font-body"
          style={{ backgroundColor: '#5C6B4A' }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? 'Searching...' : 'Find Restaurants'}
        </motion.button>
      </div>

      {/* Results as Cards */}
      {hasSearched && !isLoading && (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted font-body">
            Recommendations
            {restaurants.length > 0 && <span className="normal-case tracking-normal ml-2">({restaurants.length})</span>}
          </p>
          
          {restaurants.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {restaurants.map((restaurant, index) => (
                  <RestaurantCardComponent
                    key={restaurant.id || `${restaurant.name}-${index}`}
                    restaurant={restaurant}
                    index={index}
                    onAdd={() => handleAddRestaurant(restaurant, index)}
                  />
                ))}
              </div>
              
              {/* Show More button */}
              <div className="text-center pt-4">
                <button
                  onClick={searchRestaurants}
                  className="group relative py-1 px-4"
                >
                  <span className="text-sm tracking-wide text-muted hover:text-foreground transition-colors duration-200 font-body">
                    Show different options
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-300 ease-out group-hover:w-full" style={{ backgroundColor: '#5C6B4A' }} />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted font-body font-light">No restaurants found. Try different filters.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Loading state on initial load */}
      {!hasSearched && isLoading && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 size={24} className="animate-spin mx-auto mb-3" style={{ color: '#5C6B4A' }} />
          <p className="text-sm text-muted font-body font-light">Loading restaurant recommendations...</p>
        </motion.div>
      )}
    </motion.div>
  );
}
