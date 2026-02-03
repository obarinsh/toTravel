'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2, TreePine, Theater, Moon, ShoppingBag, Heart, Compass, Users, Gem, Home, Car, Gift, Plus, Check, ImageIcon, MapPin } from 'lucide-react';
import { Attraction, Coordinates } from '@/types';
import ActivityModal from './ActivityModal';

interface ActivitiesTabProps {
  destination: string;
  hotelLocation?: Coordinates;
  existingAttractions: Attraction[];
  onAddAttraction: (attraction: Omit<Attraction, 'id' | 'order'>) => void;
}

interface ActivityCard {
  name: string;
  description: string;
  category: string;
  duration: string;
  address: string;
  isAdded: boolean;
  isAdding?: boolean;
  imageUrl?: string;
}

// Fetch image from our API - use activity name for specific images
async function fetchActivityImage(activityName: string): Promise<string | null> {
  try {
    // Use just the activity name for more relevant images
    const response = await fetch(`/api/image?query=${encodeURIComponent(activityName)}`);
    if (response.ok) {
      const data = await response.json();
      return data.imageUrl || null;
    }
    return null;
  } catch {
    return null;
  }
}

const ACTIVITY_CATEGORIES = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'outdoor', label: 'Outdoor', icon: TreePine },
  { id: 'culture', label: 'Culture', icon: Theater },
  { id: 'nightlife', label: 'Nightlife', icon: Moon },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'wellness', label: 'Wellness', icon: Heart },
  { id: 'adventure', label: 'Adventure', icon: Compass },
  { id: 'family', label: 'Family', icon: Users },
];

const QUICK_IDEAS = [
  { title: 'Hidden Gems', desc: 'Off-the-beaten-path spots', icon: Gem, query: 'hidden gems and secret spots' },
  { title: 'Local Experiences', desc: 'Authentic local activities', icon: Home, query: 'authentic local experiences and traditions' },
  { title: 'Day Trips', desc: 'Nearby excursions', icon: Car, query: 'best day trips and nearby excursions' },
  { title: 'Free Activities', desc: 'Budget-friendly options', icon: Gift, query: 'free activities and budget-friendly things to do' },
];

// Activity Card Component - matching PlaceCard style
function ActivityCardComponent({ 
  activity, 
  index,
  onAdd,
}: { 
  activity: ActivityCard; 
  index: number;
  onAdd: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
    fetchActivityImage(activity.name).then((url) => {
      setImageUrl(url);
      setImageLoading(false);
    });
  }, [activity.name]);

  const CategoryIcon = ACTIVITY_CATEGORIES.find(c => c.id === activity.category)?.icon || Sparkles;

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
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-moss-light relative">
            {imageLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={20} className="text-secondary/40 animate-pulse" strokeWidth={1.5} />
              </div>
            ) : imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={activity.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-secondary/30 to-secondary/50 flex items-center justify-center">
                <CategoryIcon size={20} className="text-white/60" strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-medium text-foreground text-sm leading-tight line-clamp-2">
              {activity.name}
            </h4>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted font-body font-light flex items-center gap-1">
                <CategoryIcon size={10} strokeWidth={1.5} />
                {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
              </span>
            </div>
            {/* Address */}
            {activity.address && (
              <p className="text-xs text-secondary font-body font-light mt-1 flex items-center gap-1 truncate">
                <MapPin size={10} strokeWidth={1.5} />
                <span className="truncate">{activity.address}</span>
              </p>
            )}
          </div>

          {/* Add button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            disabled={activity.isAdded || activity.isAdding}
            className={`flex-shrink-0 p-2 rounded-xl transition-all duration-300 text-white hover:scale-105 ${
              activity.isAdded ? 'bg-green-500' : ''
            }`}
            style={{ backgroundColor: activity.isAdded ? '#22c55e' : activity.isAdding ? 'rgba(92, 107, 74, 0.5)' : '#5C6B4A' }}
            whileTap={activity.isAdded || activity.isAdding ? {} : { scale: 0.95 }}
          >
            {activity.isAdded ? (
              <Check size={16} strokeWidth={2} />
            ) : activity.isAdding ? (
              <Loader2 size={16} strokeWidth={2} className="animate-spin" />
            ) : (
              <Plus size={16} strokeWidth={2} />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Modal */}
      <ActivityModal
        activity={activity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default function ActivitiesTab({ 
  destination, 
  hotelLocation, 
  existingAttractions,
  onAddAttraction,
}: ActivitiesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activities, setActivities] = useState<ActivityCard[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [hasSearched, setHasSearched] = useState(false);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);

  const parseActivitiesFromResponse = (response: string, category: string, dest: string): ActivityCard[] => {
    const activities: ActivityCard[] = [];
    
    // Split by numbered items (1. 2. 3. etc)
    const sections = response.split(/(?=\d+\.\s)/);
    
    for (const section of sections) {
      const trimmed = section.trim();
      if (!trimmed || trimmed.length < 10) continue;
      
      // Skip intro/generic lines that don't start with a number
      if (!trimmed.match(/^\d+\.\s/)) continue;
      
      // Skip lines that look like intro sentences
      const firstLine = trimmed.split('\n')[0].toLowerCase();
      if (firstLine.includes('here are') || 
          firstLine.includes('unique') && firstLine.includes('activities') ||
          firstLine.includes('suggest') ||
          firstLine.includes('recommend') ||
          firstLine.includes('experiences in')) continue;
      
      // Extract name from first line (e.g., "1. **Name**" or "1. Name")
      const nameMatch = trimmed.match(/^\d+\.\s*\*?\*?([^*\n]+)\*?\*?\s*$/m) || 
                        trimmed.match(/^\d+\.\s*\*\*([^*]+)\*\*/);
      
      // Extract address
      const addressMatch = trimmed.match(/ADDRESS:\s*([^\n]+)/i);
      
      // Extract description (use [\s\S] instead of . with s flag for compatibility)
      const descMatch = trimmed.match(/DESCRIPTION:\s*([\s\S]+)/i);
      
      let name = '';
      let address = '';
      let description = '';
      
      if (nameMatch) {
        name = nameMatch[1].replace(/\*\*/g, '').replace(/[-–:]\s*$/, '').trim();
      }
      
      if (addressMatch) {
        address = addressMatch[1].trim();
      }
      
      if (descMatch) {
        description = descMatch[1].replace(/\*\*/g, '').trim();
      }
      
      // Fallback parsing for different format
      if (!name) {
        const lines = trimmed.split('\n').filter(l => l.trim());
        if (lines.length > 0) {
          name = lines[0].replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').replace(/[-–:]\s*$/, '').trim();
          
          // Look for address and description in remaining lines
          for (const line of lines.slice(1)) {
            if (line.toLowerCase().startsWith('address:')) {
              address = line.replace(/^address:\s*/i, '').trim();
            } else if (line.toLowerCase().startsWith('description:')) {
              description = line.replace(/^description:\s*/i, '').trim();
            } else if (!address && !description) {
              // If no structured format, treat as description
              description += ' ' + line;
            }
          }
        }
      }
      
      // Default address if not found
      if (!address) {
        address = dest;
      }
      
      if (name && name.length > 2) {
        // Try to extract duration from text
        let duration = '2-3 hours';
        const durationMatch = (name + ' ' + description).match(/(\d+[-–]\d+\s*(?:hours?|hrs?)|half\s*day|full\s*day|\d+\s*(?:hours?|hrs?))/i);
        if (durationMatch) {
          duration = durationMatch[1].replace('hrs', 'hours').replace('hr', 'hour');
        }
        
        activities.push({
          name,
          description: description.trim() || 'A unique experience worth exploring.',
          category: category === 'all' ? detectCategory(name + ' ' + description) : category,
          duration,
          address,
          isAdded: false,
        });
      }
    }
    
    return activities;
  };

  // Detect category from text
  const detectCategory = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('spa') || lower.includes('wellness') || lower.includes('banya') || lower.includes('sauna') || lower.includes('massage')) return 'wellness';
    if (lower.includes('hike') || lower.includes('park') || lower.includes('garden') || lower.includes('nature') || lower.includes('outdoor')) return 'outdoor';
    if (lower.includes('museum') || lower.includes('theater') || lower.includes('art') || lower.includes('culture') || lower.includes('history')) return 'culture';
    if (lower.includes('night') || lower.includes('bar') || lower.includes('club') || lower.includes('pub')) return 'nightlife';
    if (lower.includes('shop') || lower.includes('market') || lower.includes('mall') || lower.includes('boutique')) return 'shopping';
    if (lower.includes('adventure') || lower.includes('extreme') || lower.includes('tour')) return 'adventure';
    if (lower.includes('family') || lower.includes('kid') || lower.includes('child')) return 'family';
    return 'culture';
  };

  const searchActivities = async (customQuery?: string) => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const categoryFilter = selectedCategory !== 'all' ? ` focusing on ${selectedCategory} activities` : '';
      const existingNames = existingAttractions.map(a => a.name).join(', ');
      const queryText = customQuery || `activities and experiences${categoryFilter}`;

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          query: `Suggest 6 unique ${queryText} in ${destination} that tourists would enjoy. ${existingNames ? `Exclude these places I already have: ${existingNames}.` : ''} 

For each activity, use this EXACT format (including the ADDRESS line):
1. **Full Activity Name**
ADDRESS: [Street address or specific location in ${destination}]
DESCRIPTION: A 2-3 sentence description explaining what makes this activity special.

Make sure each activity has a complete name, a real street address in ${destination}, and a detailed description.`,
          hotelLocation,
        }),
      });

      const data = await response.json();
      
      if (data.response) {
        const parsedActivities = parseActivitiesFromResponse(data.response, selectedCategory, destination);
        setActivities(parsedActivities.length > 0 ? parsedActivities : []);
      }
    } catch (error) {
      console.error('Error searching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load activities on first mount
  useEffect(() => {
    if (destination && !hasAutoLoaded) {
      setHasAutoLoaded(true);
      searchActivities();
    } else if (!destination) {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination]);

  const handleAddActivity = async (activity: ActivityCard, index: number) => {
    // Mark as adding (loading state)
    setActivities(prev => prev.map((a, i) => 
      i === index ? { ...a, isAdding: true } : a
    ));

    try {
      // Geocode the address to get proper coordinates
      let coordinates = hotelLocation || { lat: 0, lng: 0 };
      
      if (activity.address) {
        const geocodeResponse = await fetch('/api/geocode-place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            placeName: activity.name,
            city: activity.address,
          }),
        });
        
        if (geocodeResponse.ok) {
          const geoData = await geocodeResponse.json();
          if (geoData.coordinates) {
            coordinates = { lat: geoData.coordinates.lat, lng: geoData.coordinates.lng };
          }
        }
      }

      // Add to trip with geocoded coordinates
      onAddAttraction({
        name: activity.name,
        description: activity.description,
        coordinates,
        day: null,
      });

      // Mark as added
      setActivities(prev => prev.map((a, i) => 
        i === index ? { ...a, isAdded: true, isAdding: false } : a
      ));
    } catch (error) {
      console.error('Error adding activity:', error);
      // Reset adding state on error
      setActivities(prev => prev.map((a, i) => 
        i === index ? { ...a, isAdding: false } : a
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
      {/* Category filter - editorial style */}
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted mb-5 font-body">
          Activity Type
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {ACTIVITY_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="group relative py-1"
            >
              <span className={`text-sm tracking-wide transition-colors duration-200 font-body ${
                selectedCategory === category.id
                  ? 'text-foreground'
                  : 'text-muted hover:text-foreground/70'
              }`}>
                {category.label}
              </span>
              <span 
                className={`absolute bottom-0 left-0 h-[1px] transition-all duration-300 ease-out ${
                  selectedCategory === category.id
                    ? 'w-full'
                    : 'w-0 group-hover:w-full'
                }`} 
                style={{ backgroundColor: selectedCategory === category.id ? '#5C6B4A' : '#8B9082' }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Quick Ideas - editorial style - only show after initial load complete and no results yet */}
      {hasSearched && !isLoading && activities.length === 0 && (
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted mb-5 font-body">
            Quick Ideas
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {QUICK_IDEAS.map((idea) => (
              <button
                key={idea.title}
                onClick={() => searchActivities(idea.query)}
                className="group relative py-1"
              >
                <span className="text-sm tracking-wide transition-colors duration-200 font-body text-muted hover:text-foreground/70">
                  {idea.title}
                </span>
                <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-muted transition-all duration-300 ease-out group-hover:w-full" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search button - compact */}
      <div>
        <motion.button
          onClick={() => searchActivities()}
          disabled={isLoading}
          className="px-8 py-3 text-white text-xs tracking-[0.15em] uppercase disabled:opacity-50 transition-colors duration-200 font-body"
          style={{ backgroundColor: '#5C6B4A' }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? 'Searching...' : 'Discover Activities'}
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
            Suggested Activities
            {activities.length > 0 && <span className="normal-case tracking-normal ml-2">({activities.length})</span>}
          </p>
          
          {activities.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activities.map((activity, index) => (
                  <ActivityCardComponent
                    key={`${activity.name}-${index}`}
                    activity={activity}
                    index={index}
                    onAdd={() => handleAddActivity(activity, index)}
                  />
                ))}
              </div>
              
              {/* Show More button */}
              <div className="text-center pt-4">
                <button
                  onClick={() => searchActivities()}
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
              <p className="text-muted font-body font-light">No activities found. Try a different category.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Loading state on initial load */}
      {isLoading && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 size={24} className="animate-spin mx-auto mb-3" style={{ color: '#5C6B4A' }} />
          <p className="text-sm text-muted font-body font-light">Loading activity recommendations...</p>
        </motion.div>
      )}
    </motion.div>
  );
}
