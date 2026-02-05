'use client';

import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'motion/react';
import { GripVertical, ImageIcon, X } from 'lucide-react';
import { Attraction } from '@/types';
import PlaceModal from './PlaceModal';

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


interface PlaceCardProps {
  attraction: Attraction;
  isActive?: boolean;
  onClick?: () => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

// Compact card for the suggestions sidebar with real photos
export function PlaceCardContent({
  attraction,
  isActive,
  isDragging,
  dragHandleProps,
}: PlaceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Fetch image from Unsplash
  useEffect(() => {
    setImageLoading(true);
    fetchAttractionImage(attraction.name).then((url) => {
      setImageUrl(url);
      setImageLoading(false);
    });
  }, [attraction.name]);

  const type = getPlaceType(attraction);

  return (
    <>
      <motion.div
        className={`
          bg-background rounded-xl overflow-hidden
          hover:bg-moss-light/50 transition-all duration-300 
          border group
          ${isActive ? 'border-secondary ring-2 ring-secondary/20' : 'border-transparent hover:border-border/50'}
          ${isDragging ? 'shadow-warm-lg scale-105 opacity-90' : ''}
        `}
        whileHover={{ scale: isDragging ? 1.05 : 1.01 }}
      >
        <div className="flex items-start gap-3 p-3">
          {/* Drag handle - only this part is draggable */}
          <div
            {...dragHandleProps}
            className="flex-shrink-0 p-1 text-muted/30 hover:text-muted cursor-grab active:cursor-grabbing rounded transition-colors"
          >
            <GripVertical size={16} strokeWidth={1.5} />
          </div>

          {/* Order number badge - matches map marker */}
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-heading font-semibold flex-shrink-0 text-white"
            style={{ backgroundColor: '#4A4F45' }}
          >
            {attraction.order}
          </div>

          {/* Clickable content area - opens modal */}
          <button 
            type="button"
            className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer text-left"
            onClick={() => setIsModalOpen(true)}
          >
            {/* Photo thumbnail */}
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-moss-light">
              {imageLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={20} className="animate-pulse" style={{ color: 'rgba(92, 107, 74, 0.4)' }} strokeWidth={1.5} />
                </div>
              ) : imageUrl && !imageError ? (
                <img
                  src={imageUrl}
                  alt={attraction.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-secondary/30 to-secondary/50 flex items-center justify-center">
                  <ImageIcon size={20} className="text-white/60" strokeWidth={1.5} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-medium text-foreground text-sm truncate">
                {attraction.name}
              </h3>
              <span className="text-xs text-muted font-body font-light mt-0.5">{type}</span>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Modal */}
      <PlaceModal
        attraction={attraction}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

// Sortable wrapper for drag and drop
export function SortablePlaceCard(props: Omit<PlaceCardProps, 'dragHandleProps'>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.attraction.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <PlaceCardContent {...props} isDragging={isDragging} dragHandleProps={listeners} />
    </div>
  );
}

// Card shown inside day (more compact, with photo and order number)
interface DayPlaceCardProps {
  attraction: Attraction;
  index: number;
  onRemove?: () => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function DayPlaceCardContent({
  attraction,
  index,
  onRemove,
  isDragging,
  dragHandleProps,
}: DayPlaceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Fetch image from Unsplash
  useEffect(() => {
    setImageLoading(true);
    fetchAttractionImage(attraction.name).then((url) => {
      setImageUrl(url);
      setImageLoading(false);
    });
  }, [attraction.name]);

  return (
    <>
      <div
        className={`
          flex items-center gap-3 bg-background rounded-xl p-3 
          group hover:bg-moss-light/50 transition-all duration-300
          ${isDragging ? 'shadow-warm-lg scale-105 opacity-90' : ''}
        `}
      >
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="flex-shrink-0 p-1 text-muted/30 hover:text-muted cursor-grab active:cursor-grabbing rounded transition-colors"
        >
          <GripVertical size={14} strokeWidth={1.5} />
        </div>

        {/* Clickable content */}
        <button 
          type="button"
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer text-left"
          onClick={() => setIsModalOpen(true)}
        >
          {/* Order number */}
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-heading font-medium flex-shrink-0" style={{ backgroundColor: 'rgba(92, 107, 74, 0.1)', color: '#5C6B4A' }}>
            {index + 1}
          </div>

          {/* Photo thumbnail */}
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-moss-light">
            {imageLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={16} className="animate-pulse" style={{ color: 'rgba(92, 107, 74, 0.4)' }} strokeWidth={1.5} />
              </div>
            ) : imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={attraction.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-secondary/30 to-secondary/50" />
            )}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-medium text-foreground text-sm truncate">
              {attraction.name}
            </h4>
          </div>
        </button>

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 text-muted/40 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Modal */}
      <PlaceModal
        attraction={attraction}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export function SortableDayPlaceCard(props: Omit<DayPlaceCardProps, 'isDragging' | 'dragHandleProps'>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.attraction.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <DayPlaceCardContent {...props} isDragging={isDragging} dragHandleProps={listeners} />
    </div>
  );
}
