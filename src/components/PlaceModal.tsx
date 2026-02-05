'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, ImageIcon, ExternalLink, Search } from 'lucide-react';
import { Attraction } from '@/types';

// Fetch image from our API (which uses Unsplash)
async function fetchAttractionImage(name: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/image?query=${encodeURIComponent(name)}`);
    if (response.ok) {
      const data = await response.json();
      return data.imageUrl || null;
    }
    return null;
  } catch {
    return null;
  }
}

// Reverse geocode to get address from coordinates
async function getAddressFromCoordinates(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      if (data.address) {
        // Build a readable address
        const parts = [];
        if (data.address.road) parts.push(data.address.road);
        if (data.address.house_number) parts[0] = `${data.address.house_number} ${parts[0] || ''}`;
        if (data.address.suburb || data.address.neighbourhood) {
          parts.push(data.address.suburb || data.address.neighbourhood);
        }
        if (data.address.city || data.address.town || data.address.village) {
          parts.push(data.address.city || data.address.town || data.address.village);
        }
        return parts.filter(Boolean).join(', ') || data.display_name?.split(',').slice(0, 3).join(',') || null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Get place type from description
function getPlaceType(attraction: Attraction): string {
  const text = `${attraction.name} ${attraction.description}`.toLowerCase();
  
  if (text.includes('museum') || text.includes('gallery')) return 'Museum';
  if (text.includes('park') || text.includes('garden')) return 'Park';
  if (text.includes('church') || text.includes('cathedral') || text.includes('basilica') || text.includes('temple')) return 'Religious';
  if (text.includes('palace') || text.includes('castle') || text.includes('tower')) return 'Architecture';
  if (text.includes('beach') || text.includes('coast')) return 'Beach';
  if (text.includes('restaurant') || text.includes('food') || text.includes('cafe')) return 'Food';
  if (text.includes('market') || text.includes('shop')) return 'Shopping';
  if (text.includes('mountain') || text.includes('lake') || text.includes('river') || text.includes('nature') || text.includes('forest')) return 'Nature';
  if (text.includes('historic') || text.includes('monument') || text.includes('memorial')) return 'Historic';
  
  return 'Landmark';
}

interface PlaceModalProps {
  attraction: Attraction;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlaceModal({ attraction, isOpen, onClose }: PlaceModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const type = getPlaceType(attraction);

  // Fetch image from Unsplash
  useEffect(() => {
    if (isOpen) {
      setImageLoading(true);
      setImageError(false);
      fetchAttractionImage(attraction.name).then((url) => {
        setImageUrl(url);
        setImageLoading(false);
      });
    }
  }, [attraction.name, isOpen]);

  // Fetch address from coordinates
  useEffect(() => {
    if (isOpen && attraction.coordinates) {
      setAddress(null);
      getAddressFromCoordinates(attraction.coordinates.lat, attraction.coordinates.lng).then((addr) => {
        setAddress(addr);
      });
    }
  }, [attraction.coordinates, isOpen]);

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
              <div className="relative h-64 flex-shrink-0">
                {imageLoading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                    <ImageIcon size={48} className="animate-pulse" style={{ color: 'rgba(92, 107, 74, 0.4)' }} strokeWidth={1} />
                  </div>
                ) : imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={attraction.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
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

                {/* Type badge */}
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1.5 glass-dark rounded-full text-white text-xs font-body font-medium">
                    {type}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex-1 overflow-y-auto">
                {/* Title */}
                <h2 className="font-heading text-2xl font-semibold text-foreground tracking-tight mb-3">
                  {attraction.name}
                </h2>

                {/* Address */}
                {address && (
                  <div className="flex items-center gap-2 mb-4" style={{ color: '#5C6B4A' }}>
                    <MapPin size={16} strokeWidth={1.5} className="flex-shrink-0" />
                    <span className="text-sm font-body font-medium">{address}</span>
                  </div>
                )}

                {/* Links */}
                <div className="flex items-center gap-4 mb-5">
                  {attraction.coordinates && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${attraction.coordinates.lat},${attraction.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-foreground font-body flex items-center gap-1.5 transition-colors"
                      style={{ color: '#5C6B4A' }}
                    >
                      <ExternalLink size={14} strokeWidth={1.5} />
                      Open in Maps
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(attraction.name + ' ' + (address || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-foreground font-body flex items-center gap-1.5 transition-colors"
                  >
                    <Search size={14} strokeWidth={1.5} />
                    Search Online
                  </a>
                </div>

                {/* Description */}
                <p className="text-foreground/80 font-body font-light leading-relaxed">
                  {attraction.description}
                </p>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border/30 bg-background/50">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-primary text-white rounded-2xl font-body font-medium hover:bg-primary/90 transition-all duration-300 shadow-warm"
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
