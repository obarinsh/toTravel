'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Plus, Globe, Loader2 } from 'lucide-react';
import { Trip } from '@/types';
import TripCard from '@/components/TripCard';

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 size={40} className="text-primary animate-spin mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-muted font-body font-light">Loading your trips...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-12">
        <div>
          <p className="label-premium text-muted mb-2">Your Collection</p>
          <h1 className="font-heading text-4xl font-semibold text-foreground tracking-tight">My Trips</h1>
          <p className="text-muted font-body font-light mt-2">
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'} saved
          </p>
        </div>
        <Link
          href="/"
          className="group flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-[2rem] hover:bg-primary-dark hover:scale-[1.02] transition-all duration-300"
        >
          <Plus size={18} strokeWidth={2} />
          <span className="label-premium">New Trip</span>
        </Link>
      </div>

      {trips.length === 0 ? (
        <motion.div 
          className="text-center py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Globe size={36} className="text-primary" strokeWidth={1} />
          </div>
          <h2 className="font-heading text-2xl font-semibold mb-3 text-foreground">No trips yet</h2>
          <p className="text-muted font-body font-light mb-8 max-w-md mx-auto">
            Start planning your first adventure and discover amazing destinations
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[2rem] hover:bg-primary-dark hover:scale-[1.02] transition-all duration-300"
          >
            <Plus size={18} strokeWidth={2} />
            <span className="font-body font-medium">Plan a Trip</span>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trips.map((trip, index) => (
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
