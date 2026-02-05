'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';
import { GeocodingResult, Coordinates } from '@/types';

interface Destination {
  name: string;
  country: string;
  image: string;
  featured: boolean;
  description: string;
  coordinates: Coordinates;
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<{
    name: string;
    fullName: string;
    coordinates: Coordinates;
  } | null>(null);
  const [modalDestination, setModalDestination] = useState<Destination | null>(null);

  const handleDestinationSelect = (result: GeocodingResult) => {
    const parts = result.display_name.split(',').map(s => s.trim());
    const cityName = parts[0];
    // Get country (usually the last part)
    const countryName = parts.length > 1 ? parts[parts.length - 1] : '';
    
    setSelectedDestination({
      name: cityName,
      fullName: countryName ? `${cityName}, ${countryName}` : cityName,
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      },
    });
  };
  
  const handleClearSelection = () => {
    setSelectedDestination(null);
  };

  const handleGoToDestination = (destination: Destination) => {
    setSelectedDestination({
      name: destination.name,
      fullName: `${destination.name}, ${destination.country}`,
      coordinates: destination.coordinates,
    });
    setModalDestination(null);
    // Scroll to top to show the search bar with selected destination
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          name: null,
          destination: selectedDestination.fullName,
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

  const trendingDestinations: Destination[] = [
    { 
      name: 'Santorini', 
      country: 'Greece', 
      image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80', 
      featured: true,
      description: 'A stunning volcanic island in the Aegean Sea, famous for its whitewashed buildings with blue domes, breathtaking sunsets over the caldera, and beautiful black sand beaches. Explore ancient ruins, taste exceptional wines, and wander through charming villages perched on clifftops.',
      coordinates: { lat: 36.3932, lng: 25.4615 }
    },
    { 
      name: 'Kyoto', 
      country: 'Japan', 
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80', 
      featured: false,
      description: 'Japan\'s ancient capital is a treasure trove of traditional temples, serene zen gardens, and historic geisha districts. Experience the magic of bamboo groves, participate in authentic tea ceremonies, and witness the beauty of cherry blossoms or autumn foliage.',
      coordinates: { lat: 35.0116, lng: 135.7681 }
    },
    { 
      name: 'Marrakech', 
      country: 'Morocco', 
      image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80', 
      featured: false,
      description: 'A vibrant city where ancient traditions meet modern culture. Lose yourself in the maze-like souks, admire intricate tilework in historic palaces, and experience the sensory overload of Jemaa el-Fnaa square. Discover hidden riads, taste aromatic tagines, and explore stunning gardens.',
      coordinates: { lat: 31.6295, lng: -7.9811 }
    },
    { 
      name: 'Lisbon', 
      country: 'Portugal', 
      image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600&q=80', 
      featured: false,
      description: 'Built on seven hills overlooking the Tagus River, Lisbon charms with its colorful azulejo tiles, vintage trams, and melancholic fado music. Explore historic neighborhoods like Alfama, indulge in pastéis de nata, and enjoy stunning viewpoints and a thriving food scene.',
      coordinates: { lat: 38.7223, lng: -9.1393 }
    },
    { 
      name: 'Bali', 
      country: 'Indonesia', 
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', 
      featured: true,
      description: 'The Island of the Gods offers a perfect blend of spiritual culture, lush landscapes, and pristine beaches. Discover ancient temples, emerald rice terraces, and world-class surf breaks. Experience traditional ceremonies, rejuvenating spa treatments, and unforgettable sunsets.',
      coordinates: { lat: -8.4095, lng: 115.1889 }
    },
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
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
        </div>

        {/* Hero Content - Large typography */}
        <div className="relative h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-[73px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl"
          >
            {/* Large headline */}
            <h1 className="text-white/50 leading-[1.4] font-body text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-8 md:mb-12" style={{ fontWeight: 400, letterSpacing: '0.25em' }}>
              <span className="block">YOUR</span>
              <span className="block">JOURNEY</span>
              <span className="block">BEGINS</span>
            </h1>

            {/* Search bar - below headline, in same container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full md:w-[500px] lg:w-[580px]"
            >
            {/* Show search bar only when no destination selected */}
            {!selectedDestination && (
              <SearchBar
                onSelect={handleDestinationSelect}
                placeholder="Search any destination..."
                disabled={isLoading}
                variant="hero"
              />
            )}

            {/* Selected destination - ready to plan */}
            {selectedDestination && (
              <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Destination display with plan button */}
                <div 
                  className="relative w-full pl-6 pr-16 py-5 rounded-full backdrop-blur-md font-light tracking-wide flex items-center justify-between"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.14)' }}
                >
                  <span className="text-white text-base">{selectedDestination.fullName}</span>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      onClick={handleClearSelection}
                      disabled={isLoading}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="#FFFFFF" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <button 
                      onClick={handlePlanTrip}
                      disabled={isLoading}
                      className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
                      style={{ backgroundColor: '#E4B84A' }}
                    >
                      {isLoading ? (
                        <Loader2 size={20} className="animate-spin" style={{ color: '#4A4F45' }} />
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="#4A4F45" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Loading message - absolute positioned to not affect layout */}
                {isLoading && (
                  <p className="absolute left-0 right-0 top-full mt-4 text-xs text-white/60 text-center font-light tracking-wide">
                    Generating top attractions... This may take 15-30 seconds
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
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
                  sizes="(max-width: 1024px) 100vw, 58vw"
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
                  {['Bryggen Wharf', 'Fløibanen Funicular', 'Fish Market'].map((place, i) => (
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
            onClick={() => setModalDestination(trendingDestinations[0])}
          >
            <div className="aspect-square md:aspect-auto md:h-full relative">
              <Image
                src={trendingDestinations[0].image}
                alt={trendingDestinations[0].name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
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
            onClick={() => setModalDestination(trendingDestinations[1])}
          >
            <div className="aspect-[4/5] relative">
              <Image
                src={trendingDestinations[1].image}
                alt={trendingDestinations[1].name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
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
            onClick={() => setModalDestination(trendingDestinations[2])}
          >
            <div className="aspect-[4/5] relative">
              <Image
                src={trendingDestinations[2].image}
                alt={trendingDestinations[2].name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
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
            onClick={() => setModalDestination(trendingDestinations[3])}
          >
            <div className="aspect-[4/5] relative">
              <Image
                src={trendingDestinations[3].image}
                alt={trendingDestinations[3].name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
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
            onClick={() => setModalDestination(trendingDestinations[4])}
          >
            <div className="aspect-[4/5] relative">
              <Image
                src={trendingDestinations[4].image}
                alt={trendingDestinations[4].name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
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
      <section className="py-20 px-6 md:px-8" style={{ backgroundColor: '#FAFAF8' }}>
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Accent line */}
          <div className="w-12 h-[2px] mx-auto mb-8" style={{ backgroundColor: '#E4B84A' }} />
          
          {/* Headline */}
          <h2 
            className="font-heading text-4xl font-light mb-4"
            style={{ color: '#2C2C2A' }}
          >
            Ready to explore?
          </h2>
          
          {/* Subtext */}
          <p className="mb-10 max-w-md mx-auto" style={{ color: '#9A9A94' }}>
            Join thousands of travelers planning their perfect trips.
          </p>
          
          {/* Green button */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-8 py-3.5 rounded-full text-sm font-medium text-white transition-all hover:scale-105 hover:opacity-90"
            style={{ backgroundColor: '#5C6B4A' }}
          >
            Start your journey
          </button>
        </motion.div>
      </section>

      {/* Destination Modal */}
      <AnimatePresence>
        {modalDestination && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(107, 114, 99, 0.85)' }}
              onClick={() => setModalDestination(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            {/* Modal Content */}
            <motion.div 
              className="relative bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Close button */}
              <button
                onClick={() => setModalDestination(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Image */}
              <div className="relative aspect-[4/3]">
                <Image
                  src={modalDestination.image}
                  alt={modalDestination.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 512px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="text-xs tracking-[0.2em] uppercase text-white/70 mb-1">
                    {modalDestination.country}
                  </p>
                  <h3 className="font-heading text-3xl text-white">
                    {modalDestination.name}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed mb-6">
                  {modalDestination.description}
                </p>

                {/* Go there button */}
                <button
                  onClick={() => handleGoToDestination(modalDestination)}
                  className="w-full py-4 rounded-full text-white font-medium transition-all hover:opacity-90 hover:scale-[1.02] flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#5C6B4A' }}
                >
                  <span>Plan a trip to {modalDestination.name}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
