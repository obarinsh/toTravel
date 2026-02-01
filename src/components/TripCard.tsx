'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Trash2, ImageIcon } from 'lucide-react';
import { Trip } from '@/types';

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
}

// Fetch image for the destination
async function fetchDestinationImage(destination: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/image?query=${encodeURIComponent(destination + ' travel landscape')}`);
    if (response.ok) {
      const data = await response.json();
      return data.imageUrl || null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function TripCard({ trip, onDelete }: TripCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    fetchDestinationImage(trip.destination).then((url) => {
      setImageUrl(url);
      setImageLoading(false);
    });
  }, [trip.destination]);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the trip to ${trip.destination}?`)) {
      onDelete(trip.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get trip duration info
  const hasDateRange = trip.start_date && trip.end_date;

  return (
    <Link href={`/trip/${trip.id}`}>
      <motion.div 
        className="bg-card border border-border/30 rounded-[1.5rem] overflow-hidden cursor-pointer group h-[380px] flex flex-col shadow-warm"
        whileHover={{ scale: 1.02, y: -6 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Top Content Section - Editorial Typography */}
        <div className="p-6 pt-10 h-[160px]">
          {/* Header row with title and delete */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="font-heading text-[1.75rem] font-semibold text-foreground tracking-tight leading-tight">
                {trip.destination}
              </h2>
              <p className="font-heading text-base text-muted font-light mt-2">
                {hasDateRange ? `${formatDate(trip.start_date!)} - ${formatDate(trip.end_date!)}` : 'Explore'}
              </p>
            </div>
            
            {/* Decorative lines like in the reference */}
            <div className="flex flex-col gap-1 mt-2">
              <div className="w-5 h-0.5 bg-foreground/60" />
              <div className="w-3 h-0.5 bg-foreground/40" />
            </div>
          </div>
        </div>

        {/* Bottom Image Section - fixed height, always at bottom */}
        <div className="h-[220px] relative mt-auto">
          <div className="absolute inset-0 overflow-hidden">
            {imageLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-primary/10 to-primary/30">
                <ImageIcon size={40} className="text-primary/30 animate-pulse" strokeWidth={1} />
              </div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={trip.destination}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-primary/20 to-primary/50" />
            )}
          </div>
          
          {/* Gradient overlay at top of image for smooth blend */}
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-card to-transparent z-10" />
          
          {/* Delete button - appears on hover */}
          <button
            onClick={handleDelete}
            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 p-3 bg-white/90 backdrop-blur-sm hover:bg-red-500 hover:text-white text-foreground rounded-full transition-all duration-300 shadow-warm"
            title="Delete trip"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </div>
      </motion.div>
    </Link>
  );
}
