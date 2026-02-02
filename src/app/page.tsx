'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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
      router.push(`/trip/${trip.id}`);
    } catch (error) {
      console.error('Error planning trip:', error);
      alert('Failed to plan trip. Please check your API keys and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const trendingDestinations = [
    { name: 'Santorini', country: 'Greece', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80', featured: true },
    { name: 'Kyoto', country: 'Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80', featured: false },
    { name: 'Marrakech', country: 'Morocco', image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80', featured: false },
    { name: 'Lisbon', country: 'Portugal', image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&q=80', featured: false },
    { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', featured: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Full viewport with image */}
      <section className="relative h-screen -mt-[73px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/img/landing.jpg"
            alt="Travel destination"
            fill
            className="object-cover"
            priority
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
        </div>

        {/* Hero Content - Large typography */}
        <div className="relative h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl"
          >
            {/* Large headline */}
            <h1 className="text-white/50 leading-[1.4] font-body text-4xl sm:text-5xl md:text-7xl lg:text-8xl" style={{ fontWeight: 400, letterSpacing: '0.25em' }}>
              <span className="block">YOUR</span>
              <span className="block">JOURNEY</span>
              <span className="block">BEGINS</span>
            </h1>
          </motion.div>
        </div>

        {/* Search bar - bottom left */}
        <div className="absolute bottom-12 md:bottom-16 left-8 md:left-16 lg:left-24 right-8 md:right-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full md:w-[500px] lg:w-[580px]"
          >
            <SearchBar
              onSelect={handleDestinationSelect}
              placeholder="Search any destination..."
              disabled={isLoading}
              variant="hero"
            />

            {/* Selected destination card */}
            {selectedDestination && (
              <motion.div 
                className="mt-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: '#8B9082' }}>Selected</p>
                    <p className="text-xl font-medium" style={{ color: '#4A4F45' }}>
                      {selectedDestination.name}
                    </p>
                  </div>
                  <button
                    onClick={handlePlanTrip}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-3 rounded-full hover:scale-[1.02] disabled:opacity-50 transition-all duration-300 font-medium text-sm"
                    style={{ backgroundColor: '#E4B84A', color: '#4A4F45' }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span className="hidden sm:inline">Planning...</span>
                      </>
                    ) : (
                      <>
                        <span>Start Planning</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
                {isLoading && (
                  <p className="text-xs mt-3" style={{ color: '#8B9082' }}>Generating top attractions... This may take 15-30 seconds</p>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 md:py-32 px-6 md:px-8" style={{ backgroundColor: '#E8EBE3' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left column */}
            <motion.div 
              className="lg:col-span-5 flex flex-col justify-center"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#8B9082' }}>
                How it works
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-light mb-6 leading-tight" style={{ color: '#4A4F45' }}>
                Plan beautifully,<br />travel freely
              </h2>
              <p className="leading-relaxed mb-8 max-w-sm" style={{ color: '#6B6B65' }}>
                Enter a destination. Get curated recommendations. Drag and drop to build your perfect day-by-day itinerary.
              </p>
              <Link 
                href="/trips"
                className="self-start px-6 py-3 rounded-full text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#5C6B4A' }}
              >
                View my trips
              </Link>
            </motion.div>

            {/* Right column */}
            <motion.div 
              className="lg:col-span-7 relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative">
                <Image
                  src="https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80"
                  alt="Travel destination"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-4 md:-bottom-8 md:-left-8 bg-white rounded-2xl p-4 md:p-5 shadow-xl w-60 md:w-72">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: '#E4B84A', color: '#4A4F45' }}
                  >
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#4A4F45' }}>Day 1</p>
                    <p className="text-xs" style={{ color: '#8B9082' }}>3 places</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {['Rothschild Boulevard', 'Carmel Market', 'Bauhaus Center'].map((place, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C5C7C0' }} />
                      <span className="text-sm" style={{ color: '#6B6B65' }}>{place}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trending Destinations Section */}
      <section className="py-16 md:py-24 px-6 md:px-8 max-w-6xl mx-auto">
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 md:mb-16 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <p className="text-xs tracking-[0.3em] uppercase mb-3 text-mist">Wanderlust</p>
            <h2 className="font-heading text-2xl md:text-4xl font-light text-stone">
              Where dreams take flight
            </h2>
          </div>
          <Link href="/trips" className="text-sm transition-colors text-mist hover:text-stone group flex items-center gap-2">
            Explore all 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </motion.div>

        {/* Creative masonry-style grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Featured large - Santorini */}
          <motion.div 
            className="col-span-2 row-span-2 group cursor-pointer relative rounded-3xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="aspect-square md:aspect-auto md:h-full relative">
              <Image
                src={trendingDestinations[0].image}
                alt={trendingDestinations[0].name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
              <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <p className="text-xs tracking-[0.2em] uppercase text-white/60 mb-1">{trendingDestinations[0].country}</p>
                <h3 className="font-heading text-2xl md:text-3xl text-white">{trendingDestinations[0].name}</h3>
              </div>
            </div>
          </motion.div>

          {/* Kyoto */}
          <motion.div 
            className="group cursor-pointer relative rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="aspect-[4/5] relative">
              <Image
                src={trendingDestinations[1].image}
                alt={trendingDestinations[1].name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/60">{trendingDestinations[1].country}</p>
                <h3 className="font-heading text-lg text-white">{trendingDestinations[1].name}</h3>
              </div>
            </div>
          </motion.div>

          {/* Marrakech */}
          <motion.div 
            className="group cursor-pointer relative rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="aspect-[4/5] relative">
              <Image
                src={trendingDestinations[2].image}
                alt={trendingDestinations[2].name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/60">{trendingDestinations[2].country}</p>
                <h3 className="font-heading text-lg text-white">{trendingDestinations[2].name}</h3>
              </div>
            </div>
          </motion.div>

          {/* Lisbon */}
          <motion.div 
            className="group cursor-pointer relative rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="aspect-[4/5] relative">
              <Image
                src={trendingDestinations[3].image}
                alt={trendingDestinations[3].name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/60">{trendingDestinations[3].country}</p>
                <h3 className="font-heading text-lg text-white">{trendingDestinations[3].name}</h3>
              </div>
            </div>
          </motion.div>

          {/* Bali - wider */}
          <motion.div 
            className="group cursor-pointer relative rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="aspect-[4/5] relative">
              <Image
                src={trendingDestinations[4].image}
                alt={trendingDestinations[4].name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/60">{trendingDestinations[4].country}</p>
                <h3 className="font-heading text-lg text-white">{trendingDestinations[4].name}</h3>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 px-6 md:px-8">
        <motion.div 
          className="max-w-4xl mx-auto text-center rounded-3xl py-16 md:py-20 px-6 md:px-8"
          style={{ backgroundColor: '#5C6B4A' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl md:text-4xl font-light text-white mb-4">
            Ready to explore?
          </h2>
          <p className="text-white/70 mb-8 max-w-md mx-auto">
            Join thousands of travelers planning their perfect trips.
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-8 py-4 rounded-full text-sm font-medium transition-all hover:scale-105"
            style={{ backgroundColor: '#E4B84A', color: '#4A4F45' }}
          >
            Start your journey
          </button>
        </motion.div>
      </section>
    </div>
  );
}
