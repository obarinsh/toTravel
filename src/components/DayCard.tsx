'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { motion } from 'motion/react';
import { Package } from 'lucide-react';
import { Attraction } from '@/types';
import { SortableDayPlaceCard } from './PlaceCard';
import { getDayDate } from './DateRangePicker';

interface DayCardProps {
  dayNumber: number;
  startDate: string;
  attractions: Attraction[];
  onRemoveAttraction?: (id: string) => void;
}

export default function DayCard({
  dayNumber,
  startDate,
  attractions,
  onRemoveAttraction,
}: DayCardProps) {
  const droppableId = `day-${dayNumber}`;
  
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });

  const sortedAttractions = [...attractions].sort((a, b) => a.order - b.order);
  const dateString = getDayDate(startDate, dayNumber);

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: dayNumber * 0.1 }}
      className={`
        bg-card rounded-2xl border overflow-hidden shadow-warm transition-all duration-300
        ${isOver ? 'border-secondary border-2 bg-secondary/5' : 'border-border/50'}
      `}
    >
      {/* Day Header */}
      <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Day number badge */}
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center font-heading font-semibold text-sm shadow-sm"
            style={{ backgroundColor: '#E4B84A', color: '#4A4F45' }}
          >
            {dayNumber}
          </div>
          <div>
            <h3 className="font-heading font-semibold text-foreground">Day {dayNumber}</h3>
            <p className="text-xs text-muted font-body font-light">{dateString}</p>
          </div>
        </div>
        <span className="text-xs text-muted bg-background px-2.5 py-1 rounded-full font-body font-light border border-border/30">
          {attractions.length} {attractions.length === 1 ? 'place' : 'places'}
        </span>
      </div>

      {/* Day Content */}
      <SortableContext
        items={sortedAttractions.map(a => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="p-4 min-h-[100px]">
          {sortedAttractions.length > 0 ? (
            <div className="space-y-2">
              {sortedAttractions.map((attraction, index) => (
                <SortableDayPlaceCard
                  key={attraction.id}
                  attraction={attraction}
                  index={index}
                  onRemove={onRemoveAttraction ? () => onRemoveAttraction(attraction.id) : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-xl h-20 flex items-center justify-center text-muted text-sm font-body font-light">
              <Package size={18} className="mr-2 opacity-40" strokeWidth={1.5} />
              Drag places here to plan your day
            </div>
          )}
        </div>
      </SortableContext>
    </motion.div>
  );
}
