'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Trash2, ImageIcon, MapPin } from 'lucide-react';
import { Trip } from '@/types';

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
}

// Determine trip status based on dates
type TripStatus = 'upcoming' | 'past' | 'draft';

function getTripStatus(trip: Trip): TripStatus {
  if (!trip.start_date || !trip.end_date) {
    return 'draft';
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(trip.end_date);
  endDate.setHours(0, 0, 0, 0);
  
  if (endDate < today) {
    return 'past';
  }
  return 'upcoming';
}

// Status badge styles
const statusStyles: Record<TripStatus, { bg: string; text: string; label: string }> = {
  upcoming: {
    bg: 'rgba(228, 184, 74, 0.9)', // Lemon
    text: '#4A4F45',
    label: 'Upcoming'
  },
  past: {
    bg: 'rgba(0, 0, 0, 0.5)', // Dark semi-transparent
    text: '#FFFFFF',
    label: 'Past'
  },
  draft: {
    bg: 'rgba(255, 255, 255, 0.85)', // White/light
    text: '#4A4F45',
    label: 'Draft'
  }
};

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

  // Get trip status and styles
  const status = getTripStatus(trip);
  const statusStyle = statusStyles[status];
  const isPast = status === 'past';

  // Get trip duration info
  const hasDateRange = trip.start_date && trip.end_date;
  
  // Parse destination - could be "City" or "City, Country"
  const destinationParts = trip.destination.split(',').map(s => s.trim());
  const cityName = destinationParts[0];
  const countryName = destinationParts.length > 1 ? destinationParts[destinationParts.length - 1] : null;
  
  // Trip name - use custom name if set, otherwise use city name
  const tripName = trip.name || cityName;
  
  // Location line - show "City, Country" if we have country, otherwise just don't repeat city
  const locationLine = countryName ? `${cityName}, ${countryName}` : null;

  // Places count
  const placesCount = trip.attractions?.length || 0;

  return (
    <Link href={`/trip/${trip.id}`}>
      <motion.div 
        className="bg-card rounded-[1.5rem] overflow-hidden cursor-pointer group flex flex-col h-[340px]"
        style={{ border: '1px solid #E0E0E0' }}
        whileHover={{ scale: 1.02, y: -6 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Image Section - Top */}
        <div className="h-[200px] relative flex-shrink-0">
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ filter: isPast ? 'grayscale(30%)' : 'none' }}
          >
            {imageLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-moss-light to-secondary/20">
                <ImageIcon size={40} className="text-secondary/30 animate-pulse" strokeWidth={1} />
              </div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={trip.destination}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-moss-light to-secondary/30" />
            )}
          </div>
          
          {/* Status badge - top left */}
          <div 
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md z-10"
            style={{ 
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
            }}
          >
            {statusStyle.label}
          </div>
          
          {/* Places count - bottom right */}
          {placesCount > 0 && (
            <div 
              className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md flex items-center gap-1 z-10"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                color: '#4A4F45',
              }}
            >
              <MapPin size={12} strokeWidth={2} />
              {placesCount}
            </div>
          )}
          
          {/* Delete button - appears on hover */}
          <button
            onClick={handleDelete}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-2.5 bg-white/90 backdrop-blur-sm hover:bg-red-500 hover:text-white text-foreground rounded-full transition-all duration-300 shadow-warm z-10"
            title="Delete trip"
          >
            <Trash2 size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content Section - Below image */}
        <div className="p-5 flex flex-col flex-1">
          <h2 
            className="font-body text-xl text-foreground leading-tight group-hover:opacity-80 transition-opacity duration-300 line-clamp-2"
            style={{ fontWeight: 500, letterSpacing: '-0.01em' }}
          >
            {tripName}
          </h2>
          <p className="text-sm text-muted font-body font-light mt-1 min-h-[20px]">
            {locationLine || '\u00A0'}
          </p>
          <p className="font-body text-sm text-muted font-light mt-auto">
            {hasDateRange ? `${formatDate(trip.start_date!)} - ${formatDate(trip.end_date!)}` : 'No dates set'}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
