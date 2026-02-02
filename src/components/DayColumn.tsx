'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Package } from 'lucide-react';
import { Attraction } from '@/types';
import { SortableAttractionCard } from './AttractionCard';
import { getDayDate } from './DateRangePicker';

interface DayColumnProps {
  dayNumber: number | null; // null = unassigned
  title: string;
  subtitle?: string;
  attractions: Attraction[];
  selectedAttractionId?: string | null;
  onSelectAttraction: (id: string) => void;
  onRemoveAttraction?: (id: string) => void;
  startDate?: string | null;
  isHorizontal?: boolean; // Horizontal scrolling row
}

export default function DayColumn({
  dayNumber,
  title,
  subtitle,
  attractions,
  selectedAttractionId,
  onSelectAttraction,
  onRemoveAttraction,
  startDate,
}: DayColumnProps) {
  const droppableId = dayNumber === null ? 'unassigned' : `day-${dayNumber}`;
  
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });

  // Sort attractions by order within this day
  const sortedAttractions = [...attractions].sort((a, b) => a.order - b.order);

  // Calculate the date string for this day
  const dateString = dayNumber && startDate ? getDayDate(startDate, dayNumber) : undefined;

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-[2rem] transition-all duration-300
        ${isOver ? 'bg-[rgba(92,107,74,0.05)]' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        {dayNumber !== null ? (
          <span 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-heading font-semibold shadow-warm"
            style={{ backgroundColor: '#E4B84A', color: '#4A4F45' }}
          >
            {dayNumber}
          </span>
        ) : (
          <span 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-warm"
            style={{ backgroundColor: '#E4B84A', color: '#4A4F45' }}
          >
            <Package size={20} strokeWidth={1.5} />
          </span>
        )}
        <div>
          <h3 className="font-heading font-semibold text-foreground text-lg tracking-tight">
            {title || 'Unassigned'}
            <span className="text-sm font-body font-light text-muted ml-3">
              {attractions.length} {attractions.length === 1 ? 'place' : 'places'}
            </span>
          </h3>
          {(subtitle || dateString) && (
            <p className="text-sm text-muted font-body font-light">
              {dateString || subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Horizontal scrolling cards */}
      <SortableContext
        items={sortedAttractions.map((a) => a.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className={`
          flex gap-5 overflow-x-auto pb-4 px-1 snap-x snap-mandatory
          ${isOver ? 'ring-2 ring-secondary ring-offset-4 ring-offset-background rounded-[2rem]' : ''}
        `}
        style={{ scrollbarWidth: 'thin' }}
        >
          {sortedAttractions.length > 0 ? (
            sortedAttractions.map((attraction) => (
              <div key={attraction.id} className="flex-shrink-0 w-[300px] snap-start">
                <SortableAttractionCard
                  attraction={attraction}
                  isActive={selectedAttractionId === attraction.id}
                  onClick={() => onSelectAttraction(attraction.id)}
                  onRemove={onRemoveAttraction ? () => onRemoveAttraction(attraction.id) : undefined}
                />
              </div>
            ))
          ) : (
            <div className={`
              flex-shrink-0 w-full min-w-[300px] h-[220px] flex flex-col items-center justify-center
              border-2 border-dashed rounded-[2rem] text-sm font-body font-light
              ${dayNumber === null 
                ? 'border-secondary/30 text-secondary' 
                : 'border-border text-muted'
              }
            `}>
              <Package size={32} className="mb-3 opacity-40" strokeWidth={1} />
              {dayNumber === null ? 'All attractions assigned!' : 'Drop attractions here'}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
