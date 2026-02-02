'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Plus, Globe, Loader2 } from 'lucide-react';
import { Trip } from '@/types';
import TripCard from '@/components/TripCard';

type FilterStatus = 'all' | 'upcoming' | 'past' | 'draft';

// Determine trip status based on dates
function getTripStatus(trip: Trip): 'upcoming' | 'past' | 'draft' {
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

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch('/api/trips');
        const data = await response.json();
        setTrips(data.trips || []);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/trips?id=${id}`, { method: 'DELETE' });
      setTrips(trips.filter((trip) => trip.id !== id));
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  // Filter trips based on selected filter
  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true;
    return getTripStatus(trip) === filter;
  });

  // Count trips by status
  const counts = {
    all: trips.length,
    upcoming: trips.filter(t => getTripStatus(t) === 'upcoming').length,
    past: trips.filter(t => getTripStatus(t) === 'past').length,
    draft: trips.filter(t => getTripStatus(t) === 'draft').length,
  };

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past' },
    { value: 'draft', label: 'Drafts' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] pt-24">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: '#5C6B4A' }} strokeWidth={1.5} />
          <p className="text-muted font-body font-light">Loading your trips...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="pt-24 px-6 md:px-8 max-w-6xl mx-auto pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <p className="label-premium text-muted mb-2">Your Collection</p>
          <h1 className="font-heading text-4xl font-semibold text-foreground tracking-tight">My Trips</h1>
        </div>
        <Link
          href="/"
          className="group flex items-center gap-2 px-6 py-3 text-white rounded-[2rem] hover:scale-[1.02] transition-all duration-300"
          style={{ backgroundColor: '#5C6B4A' }}
        >
          <Plus size={18} strokeWidth={2} />
          <span className="label-premium">New Trip</span>
        </Link>
      </div>

      {/* Filter Bar */}
      {trips.length > 0 && (
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {filterOptions.map((option) => {
            const isActive = filter === option.value;
            const count = counts[option.value];
            
            return (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-300 whitespace-nowrap
                  ${isActive 
                    ? 'text-white' 
                    : 'bg-white/80 text-foreground/70 hover:bg-white hover:text-foreground border border-border'
                  }
                `}
                style={isActive ? { backgroundColor: '#5C6B4A' } : undefined}
              >
                {option.label}
                <span 
                  className={`
                    text-xs px-1.5 py-0.5 rounded-full
                    ${isActive ? 'bg-white/20 text-white' : 'bg-foreground/10 text-foreground/60'}
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {trips.length === 0 ? (
        <motion.div 
          className="text-center py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(92, 107, 74, 0.1)' }}>
            <Globe size={36} style={{ color: '#5C6B4A' }} strokeWidth={1} />
          </div>
          <h2 className="font-heading text-2xl font-semibold mb-3 text-foreground">No trips yet</h2>
          <p className="text-muted font-body font-light mb-8 max-w-md mx-auto">
            Start planning your first adventure and discover amazing destinations
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 text-white rounded-[2rem] hover:scale-[1.02] transition-all duration-300"
            style={{ backgroundColor: '#5C6B4A' }}
          >
            <Plus size={18} strokeWidth={2} />
            <span className="font-body font-medium">Plan a Trip</span>
          </Link>
        </motion.div>
      ) : filteredTrips.length === 0 ? (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-muted font-body font-light">
            No {filter === 'draft' ? 'draft' : filter} trips found
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <TripCard trip={trip} onDelete={handleDelete} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
