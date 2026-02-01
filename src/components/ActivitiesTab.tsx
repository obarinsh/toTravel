'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2, TreePine, Theater, Moon, ShoppingBag, Heart, Compass, Users, Gem, Home, Car, Gift } from 'lucide-react';
import { Attraction, Coordinates } from '@/types';

interface ActivitiesTabProps {
  destination: string;
  hotelLocation?: Coordinates;
  existingAttractions: Attraction[];
  onAddAttraction: (attraction: Omit<Attraction, 'id' | 'order'>) => void;
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

interface SuggestedActivity {
  name: string;
  description: string;
  category: string;
  duration: string;
  isAdded: boolean;
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
  { title: 'Hidden Gems', desc: 'Off-the-beaten-path spots', icon: Gem },
  { title: 'Local Experiences', desc: 'Authentic local activities', icon: Home },
  { title: 'Day Trips', desc: 'Nearby excursions', icon: Car },
  { title: 'Free Activities', desc: 'Budget-friendly options', icon: Gift },
];

export default function ActivitiesTab({ 
  destination, 
  hotelLocation, 
  existingAttractions,
}: ActivitiesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activities, setActivities] = useState<SuggestedActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchActivities = async () => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const categoryFilter = selectedCategory !== 'all' ? ` in the ${selectedCategory} category` : '';
      const existingNames = existingAttractions.map(a => a.name).join(', ');

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          query: `Suggest 6 unique activities or experiences${categoryFilter} in ${destination} that tourists might enjoy. ${existingNames ? `Exclude these places I already have: ${existingNames}.` : ''} For each activity provide: name, brief description (2 sentences), category, and estimated duration. Format each as a clear item.`,
          hotelLocation,
        }),
      });

      const data = await response.json();
      
      if (data.response) {
        setActivities([{
          name: 'Suggested Activities',
          description: data.response,
          category: selectedCategory,
          duration: '',
          isAdded: false,
        }]);
      }
    } catch (error) {
      console.error('Error searching activities:', error);
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
      {/* Category filter */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-foreground">Activity Type</h3>
        <div className="flex flex-wrap gap-3">
          {ACTIVITY_CATEGORIES.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-5 py-3 rounded-[2rem] text-sm flex items-center gap-2 transition-all duration-300 font-body ${
                selectedCategory === category.id
                  ? 'bg-primary text-white shadow-warm'
                  : 'bg-card border border-border/50 text-foreground hover:border-primary hover:scale-[1.02]'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <category.icon size={16} strokeWidth={1.5} />
              {category.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Search button */}
      <motion.button
        onClick={searchActivities}
        disabled={isLoading}
        className="w-full py-4 bg-primary text-white rounded-[2rem] font-body font-medium hover:bg-primary-dark hover:scale-[1.01] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-3 shadow-warm"
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" strokeWidth={1.5} />
            <span>Finding Activities...</span>
          </>
        ) : (
          <>
            <Sparkles size={20} strokeWidth={1.5} />
            <span>Discover Activities</span>
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
          <h3 className="font-heading font-semibold text-lg text-foreground">Suggestions for You</h3>
          {activities.length > 0 ? (
            <div className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-warm">
              <div className="text-sm text-muted font-body font-light leading-relaxed">
                {formatResponse(activities[0].description)}
              </div>
            </div>
          ) : (
            <p className="text-muted text-center py-12 font-body font-light">No activities found. Try a different category.</p>
          )}
        </motion.div>
      )}

      {/* Quick suggestions */}
      {!hasSearched && (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-heading font-semibold text-foreground">Quick Ideas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUICK_IDEAS.map((idea, index) => (
              <motion.button
                key={idea.title}
                onClick={() => {
                  setSelectedCategory('all');
                  searchActivities();
                }}
                className="p-6 bg-card border border-border/50 rounded-[2rem] text-left hover:border-primary hover:shadow-warm transition-all duration-500 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-[1.05] transition-transform duration-300">
                  <idea.icon size={22} className="text-secondary" strokeWidth={1.5} />
                </div>
                <div className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  {idea.title}
                </div>
                <div className="text-sm text-muted font-body font-light mt-1">{idea.desc}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state decoration */}
      {!hasSearched && (
        <motion.div 
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} className="text-primary" strokeWidth={1} />
          </div>
          <p className="font-heading text-xl font-semibold mb-2 text-foreground">Discover new experiences</p>
          <p className="text-muted font-body font-light">Find unique activities to add to your trip</p>
        </motion.div>
      )}
    </motion.div>
  );
}
