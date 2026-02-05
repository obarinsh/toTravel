'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Plus, X, Car, MapPin } from 'lucide-react';
import { Trip, Attraction, Coordinates } from '@/types';
import { getDayDate } from '@/components/DateRangePicker';
import { getDistanceInfo } from '@/lib/distance';
import Image from 'next/image';

interface MobileItineraryTabProps {
  trip: Trip;
  numDays: number;
  onAddMore: (dayNumber: number) => void;
  onRemoveAttraction: (attractionId: string) => void;
}

interface DayCardProps {
  dayNumber: number;
  date: string;
  attractions: Attraction[];
  hotelLocation?: Coordinates;
  onAddMore: () => void;
  onRemoveAttraction: (attractionId: string) => void;
}

function DistanceBadge({ from, to }: { from: Coordinates; to: Coordinates }) {
  const info = getDistanceInfo(from, to);
  
  return (
    <div className="flex items-center justify-center py-1.5">
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-xs text-muted">
        <Car size={12} />
        <span>{info.distance} · {info.driveTime}</span>
      </div>
    </div>
  );
}

function MobileDayCard({
  dayNumber,
  date,
  attractions,
  hotelLocation,
  onAddMore,
  onRemoveAttraction,
}: DayCardProps) {
  const [isExpanded, setIsExpanded] = useState(dayNumber === 1);
  const sortedAttractions = [...attractions].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
            style={{ backgroundColor: 'rgba(92, 107, 74, 0.12)', color: '#5C6B4A' }}
          >
            {dayNumber}
          </div>
          <div className="text-left">
            <span className="font-medium text-foreground">Day {dayNumber}</span>
            <span className="text-muted text-sm ml-2">{date}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span 
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: attractions.length > 0 ? 'rgba(92, 107, 74, 0.12)' : 'rgba(139, 144, 130, 0.12)',
              color: attractions.length > 0 ? '#5C6B4A' : '#8B9082'
            }}
          >
            {attractions.length}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={18} className="text-muted" />
          </motion.div>
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4">
              {sortedAttractions.length === 0 ? (
                <div className="text-center py-6 text-muted text-sm">
                  <MapPin size={20} className="mx-auto mb-2 opacity-50" />
                  No places added yet
                </div>
              ) : (
                <div className="space-y-1">
                  {/* From hotel badge */}
                  {hotelLocation && sortedAttractions.length > 0 && (
                    <DistanceBadge 
                      from={hotelLocation} 
                      to={sortedAttractions[0].coordinates} 
                    />
                  )}
                  
                  {sortedAttractions.map((attraction, index) => (
                    <div key={attraction.id}>
                      <AttractionRow 
                        attraction={attraction} 
                        onRemove={() => onRemoveAttraction(attraction.id)}
                      />
                      {index < sortedAttractions.length - 1 && (
                        <DistanceBadge
                          from={attraction.coordinates}
                          to={sortedAttractions[index + 1].coordinates}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add More Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddMore();
                }}
                className="w-full mt-3 py-3 flex items-center justify-center gap-2 rounded-xl border border-dashed text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ borderColor: '#5C6B4A', color: '#5C6B4A' }}
              >
                <Plus size={16} />
                Add more
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AttractionRow({ 
  attraction, 
  onRemove 
}: { 
  attraction: Attraction; 
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
      {/* Order number */}
      <div 
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
        style={{ backgroundColor: '#5C6B4A', color: 'white' }}
      >
        {attraction.order}
      </div>
      
      {/* Image */}
      {attraction.photo_url ? (
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={attraction.photo_url}
            alt={attraction.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(92, 107, 74, 0.1)' }}
        >
          <MapPin size={16} style={{ color: '#5C6B4A' }} />
        </div>
      )}
      
      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">
          {attraction.name}
        </p>
        {attraction.description && (
          <p className="text-xs text-muted truncate">
            {attraction.description}
          </p>
        )}
      </div>
      
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="p-1.5 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
      >
        <X size={14} className="text-muted" />
      </button>
    </div>
  );
}

export default function MobileItineraryTab({
  trip,
  numDays,
  onAddMore,
  onRemoveAttraction,
}: MobileItineraryTabProps) {
  const { attractions, start_date, hotel_location } = trip;

  // Group attractions by day
  const attractionsByDay: Record<number, Attraction[]> = {};
  for (let i = 1; i <= numDays; i++) {
    attractionsByDay[i] = attractions.filter((a) => a.day === i);
  }

  if (numDays === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-12 text-muted">
          <p>Set trip dates to plan your itinerary</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: numDays }, (_, i) => i + 1).map((dayNumber) => (
        <MobileDayCard
          key={dayNumber}
          dayNumber={dayNumber}
          date={start_date ? getDayDate(start_date, dayNumber) : ''}
          attractions={attractionsByDay[dayNumber] || []}
          hotelLocation={hotel_location}
          onAddMore={() => onAddMore(dayNumber)}
          onRemoveAttraction={onRemoveAttraction}
        />
      ))}
    </div>
  );
}
