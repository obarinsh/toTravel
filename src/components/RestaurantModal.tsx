'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Star, Globe, ExternalLink, Search, ImageIcon } from 'lucide-react';

interface RestaurantModalProps {
  restaurant: {
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
  };
  isOpen: boolean;
  onClose: () => void;
}

// Fetch image from our API (fallback)
async function fetchRestaurantImage(name: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/image?query=${encodeURIComponent(name + ' restaurant interior food')}`);
    if (response.ok) {
      const data = await response.json();
      return data.imageUrl || null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function RestaurantModal({ restaurant, isOpen, onClose }: RestaurantModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(restaurant.photoUrl || null);
  const [imageLoading, setImageLoading] = useState(!restaurant.photoUrl);
  const [imageError, setImageError] = useState(false);

  // Fetch image
  useEffect(() => {
    if (isOpen && !restaurant.photoUrl) {
      setImageLoading(true);
      setImageError(false);
      fetchRestaurantImage(restaurant.name).then((url) => {
        setImageUrl(url);
        setImageLoading(false);
      });
    } else if (restaurant.photoUrl) {
      setImageUrl(restaurant.photoUrl);
      setImageLoading(false);
    }
  }, [restaurant.name, restaurant.photoUrl, isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Generate Google search URL
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(restaurant.name + ' ' + restaurant.address + ' menu')}`;
  
  // Generate Google Maps URL if not provided
  const mapsUrl = restaurant.googleMapsUrl || 
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.address)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 1000 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
            style={{ zIndex: 1001 }}
          >
            <div 
              className="bg-card rounded-[2rem] overflow-hidden shadow-warm-lg max-w-lg w-full max-h-[85vh] flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Section */}
              <div className="relative h-56 flex-shrink-0">
                {imageLoading ? (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, rgba(92, 107, 74, 0.2), rgba(92, 107, 74, 0.4))' }}>
                    <ImageIcon size={48} className="animate-pulse" style={{ color: 'rgba(92, 107, 74, 0.4)' }} strokeWidth={1} />
                  </div>
                ) : imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, rgba(92, 107, 74, 0.3), rgba(228, 184, 74, 0.3))' }}>
                    <MapPin size={48} className="text-white/60" strokeWidth={1} />
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2.5 glass-dark rounded-2xl text-white/90 hover:bg-white/20 transition-all duration-300"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>

                {/* Cuisine badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1.5 glass-dark rounded-full text-white text-xs font-body font-medium">
                    {restaurant.cuisine}
                  </span>
                  {restaurant.priceRange && (
                    <span className="px-3 py-1.5 glass-dark rounded-full text-white text-xs font-body font-medium">
                      {restaurant.priceRange}
                    </span>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex-1 overflow-y-auto">
                {/* Title */}
                <h2 className="font-heading text-2xl font-semibold text-foreground tracking-tight mb-2">
                  {restaurant.name}
                </h2>

                {/* Rating */}
                {restaurant.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1" style={{ color: '#5C6B4A' }}>
                      <Star size={16} strokeWidth={2} fill="currentColor" />
                      <span className="font-body font-medium">{restaurant.rating.toFixed(1)}</span>
                    </div>
                    {restaurant.reviewCount && (
                      <span className="text-sm text-muted font-body font-light">
                        ({restaurant.reviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}

                {/* Address */}
                {restaurant.address && (
                  <div className="flex items-start gap-2 mb-4" style={{ color: '#5C6B4A' }}>
                    <MapPin size={16} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-body font-medium">{restaurant.address}</span>
                  </div>
                )}

                {/* Description */}
                {restaurant.description && (
                  <p className="text-foreground/80 font-body font-light leading-relaxed mb-6">
                    {restaurant.description}
                  </p>
                )}

                {/* Action Links */}
                <div className="flex flex-wrap gap-3">
                  {restaurant.website && (
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-body font-medium transition-colors"
                      style={{ backgroundColor: '#5C6B4A' }}
                    >
                      <Globe size={16} strokeWidth={1.5} />
                      Visit Website
                    </a>
                  )}
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-medium transition-colors"
                    style={{ backgroundColor: '#E8EBE3', color: '#5C6B4A' }}
                  >
                    <ExternalLink size={16} strokeWidth={1.5} />
                    Open in Maps
                  </a>
                  <a
                    href={googleSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-medium transition-colors"
                    style={{ backgroundColor: '#E8EBE3', color: '#5C6B4A' }}
                  >
                    <Search size={16} strokeWidth={1.5} />
                    Find Menu
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border/30 bg-background/50">
                <button
                  onClick={onClose}
                  className="w-full py-3 text-white rounded-2xl font-body font-medium transition-all duration-300"
                  style={{ backgroundColor: '#5C6B4A' }}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
