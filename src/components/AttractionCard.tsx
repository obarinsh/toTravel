'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GripVertical, X, ChevronDown, ChevronUp, ImageIcon } from 'lucide-react';
import { Attraction } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface AttractionCardProps {
  attraction: Attraction;
  isActive?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

function AttractionCardContent({
  attraction,
  isActive,
  onClick,
  onRemove,
  isDragging,
  dragHandleProps,
}: AttractionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Fetch image from Unsplash API
  useEffect(() => {
    setImageLoading(true);
    fetchAttractionImage(attraction.name).then((url) => {
      setImageUrl(url);
      setImageLoading(false);
    });
  }, [attraction.name]);

  return (
    <motion.div
      onClick={onClick}
      className={`
        relative rounded-[2rem] overflow-hidden cursor-pointer h-[300px]
        ${isActive ? 'ring-2 ring-secondary ring-offset-4 ring-offset-background' : ''}
        ${isDragging ? 'opacity-80 scale-[1.02]' : ''}
      `}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        boxShadow: isDragging 
          ? '0 25px 50px -12px rgba(26, 26, 26, 0.15)' 
          : '0 10px 40px -10px rgba(26, 26, 26, 0.08)'
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-foreground/10">
        {imageLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-primary/20 to-primary/40">
            <ImageIcon size={40} className="text-primary/40 animate-pulse" strokeWidth={1} />
          </div>
        ) : imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={attraction.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/60" />
        )}
        {/* Elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
      </div>

      {/* Top bar with drag handle and actions */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
        {/* Drag handle - Glassmorphism style */}
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing p-2.5 glass-dark rounded-2xl text-white/90 hover:bg-white/20 transition-all duration-300"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} strokeWidth={1.5} />
        </div>

        {/* Order badge - Premium style */}
        <div className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center font-heading font-semibold text-sm shadow-warm">
          {attraction.order}
        </div>

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-2.5 glass-dark rounded-2xl text-white/90 hover:bg-red-500/60 transition-all duration-300"
            title="Remove attraction"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="font-heading font-semibold text-white text-xl leading-tight mb-2 tracking-tight">
          {attraction.name}
        </h3>
        <p className={`text-white/70 text-sm font-body font-light leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
          {attraction.description}
        </p>
        {attraction.description && attraction.description.length > 80 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mt-3 flex items-center gap-2 px-4 py-2 glass-dark rounded-full text-white/90 text-xs font-body font-medium hover:bg-white/20 transition-all duration-300"
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <ChevronUp size={14} strokeWidth={1.5} />
              </>
            ) : (
              <>
                <span>Read more</span>
                <ChevronDown size={14} strokeWidth={1.5} />
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function SortableAttractionCard({
  attraction,
  isActive,
  onClick,
  onRemove,
}: {
  attraction: Attraction;
  isActive?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: attraction.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <AttractionCardContent
        attraction={attraction}
        isActive={isActive}
        onClick={onClick}
        onRemove={onRemove}
        isDragging={isDragging}
        dragHandleProps={listeners}
      />
    </div>
  );
}

export default AttractionCardContent;
