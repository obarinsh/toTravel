'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Sparkles, Map, GripVertical, ArrowRight, Loader2 } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import { GeocodingResult, Coordinates } from '@/types';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<{
    name: string;
    coordinates: Coordinates;
  } | null>(null);

  const handleDestinationSelect = (result: GeocodingResult) => {
    setSelectedDestination({
      name: result.display_name.split(',')[0],
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      },
    });
  };

  const handlePlanTrip = async () => {
    if (!selectedDestination) return;

    setIsLoading(true);

    try {
      // Generate attractions
      const attractionsResponse = await fetch('/api/attractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: selectedDestination.name,
          destinationCoordinates: selectedDestination.coordinates,
        }),
      });

      const { attractions } = await attractionsResponse.json();

      if (!attractions || attractions.length === 0) {
        throw new Error('No attractions generated');
      }

      // Save trip to database
      const tripResponse = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: selectedDestination.name,
          destination_coordinates: selectedDestination.coordinates,
          attractions,
        }),
      });

      const { trip } = await tripResponse.json();

      // Navigate to trip page
      router.push(`/trip/${trip.id}`);
    } catch (error) {
      console.error('Error planning trip:', error);
      alert('Failed to plan trip. Please check your API keys and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-16">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <p className="label-premium text-muted mb-6">Your Journey Begins Here</p>
        <h1 className="font-heading text-5xl md:text-6xl font-semibold text-foreground mb-6 tracking-tight">
          Plan Your Perfect Trip
        </h1>
        <p className="text-lg text-muted max-w-xl mx-auto font-body font-light leading-relaxed">
          Enter a destination and let AI discover the top attractions.
          Create your perfect itinerary with intuitive drag and drop.
        </p>
      </motion.div>

      {/* Search Section */}
      <motion.div 
        className="w-full max-w-2xl space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        <SearchBar
          onSelect={handleDestinationSelect}
          placeholder="Where do you want to go?"
          disabled={isLoading}
        />

        {selectedDestination && (
          <motion.div 
            className="bg-card border border-border rounded-[2rem] p-6 shadow-warm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="label-premium text-muted mb-1">Selected Destination</p>
                <p className="font-heading text-2xl font-semibold text-foreground">
                  {selectedDestination.name}
                </p>
              </div>
              <button
                onClick={handlePlanTrip}
                disabled={isLoading}
                className="group flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[2rem] hover:bg-primary-dark hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span className="font-body font-medium">Planning...</span>
                  </>
                ) : (
                  <>
                    <span className="font-body font-medium">Start Planning</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {isLoading && (
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-muted font-body font-light">Generating top attractions and mapping coordinates...</p>
            <p className="text-sm text-muted/60 mt-2 font-body">This may take 15-30 seconds</p>
          </motion.div>
        )}
      </motion.div>

      {/* Feature Cards */}
      <motion.div 
        className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
      >
        {[
          {
            icon: Sparkles,
            title: "AI-Powered",
            description: "Get personalized recommendations for any destination worldwide"
          },
          {
            icon: Map,
            title: "Interactive Map",
            description: "See all attractions on a map and visualize your route"
          },
          {
            icon: GripVertical,
            title: "Drag & Drop",
            description: "Easily reorder your itinerary by dragging attractions"
          }
        ].map((feature, index) => (
          <motion.div 
            key={feature.title}
            className="group text-center p-8 rounded-[2rem] bg-card border border-border/50 hover:border-border hover:shadow-warm transition-all duration-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-[1.05] transition-transform duration-300">
              <feature.icon size={24} strokeWidth={1.5} />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-3 text-foreground">{feature.title}</h3>
            <p className="text-muted text-sm font-body font-light leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
