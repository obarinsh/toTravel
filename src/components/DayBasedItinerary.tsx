'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { motion } from 'motion/react';
import { CalendarDays } from 'lucide-react';
import { Attraction } from '@/types';
import DayColumn from './DayColumn';
import AttractionCardContent from './AttractionCard';
import { calculateDays } from './DateRangePicker';

interface DayBasedItineraryProps {
  attractions: Attraction[];
  startDate?: string | null;
  endDate?: string | null;
  selectedAttractionId?: string | null;
  onAttractionsChange: (attractions: Attraction[]) => void;
  onSelectAttraction: (id: string) => void;
  onRemoveAttraction?: (id: string) => void;
}

export default function DayBasedItinerary({
  attractions,
  startDate,
  endDate,
  selectedAttractionId,
  onAttractionsChange,
  onSelectAttraction,
  onRemoveAttraction,
}: DayBasedItineraryProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate number of days
  const numDays = startDate && endDate ? calculateDays(startDate, endDate) : 0;

  // Group attractions by day
  const unassigned = attractions.filter((a) => a.day === null || a.day === undefined);
  const dayGroups: Record<number, Attraction[]> = {};
  
  for (let i = 1; i <= numDays; i++) {
    dayGroups[i] = attractions.filter((a) => a.day === i);
  }

  const activeAttraction = activeId
    ? attractions.find((a) => a.id === activeId)
    : null;

  const findContainer = (id: string): string | null => {
    if (id === 'unassigned' || id.startsWith('day-')) {
      return id;
    }

    const attraction = attractions.find((a) => a.id === id);
    if (!attraction) return null;
    
    if (attraction.day === null || attraction.day === undefined) {
      return 'unassigned';
    }
    return `day-${attraction.day}`;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    const newAttractions = attractions.map((a) => {
      if (a.id === active.id) {
        const newDay = overContainer === 'unassigned' 
          ? null 
          : parseInt(overContainer.replace('day-', ''));
        return { ...a, day: newDay };
      }
      return a;
    });

    onAttractionsChange(newAttractions);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      const containerAttractions = activeContainer === 'unassigned'
        ? unassigned
        : dayGroups[parseInt(activeContainer.replace('day-', ''))];

      const oldIndex = containerAttractions.findIndex((a) => a.id === active.id);
      const overAttraction = attractions.find((a) => a.id === over.id);
      
      if (overAttraction) {
        const newIndex = containerAttractions.findIndex((a) => a.id === over.id);
        
        if (oldIndex !== newIndex) {
          const reordered = arrayMove(containerAttractions, oldIndex, newIndex);
          
          const updatedGroup = reordered.map((a, index) => ({
            ...a,
            order: index + 1,
          }));

          const newAttractions = attractions.map((a) => {
            const updated = updatedGroup.find((u) => u.id === a.id);
            return updated || a;
          });

          onAttractionsChange(newAttractions);
        }
      }
    } else {
      const targetDay = overContainer === 'unassigned'
        ? null
        : parseInt(overContainer.replace('day-', ''));
      
      const targetAttractions = attractions.filter((a) => 
        targetDay === null 
          ? (a.day === null || a.day === undefined)
          : a.day === targetDay
      );

      const newAttractions = attractions.map((a) => {
        const indexInTarget = targetAttractions.findIndex((t) => t.id === a.id);
        if (indexInTarget !== -1) {
          return { ...a, order: indexInTarget + 1 };
        }
        return a;
      });

      onAttractionsChange(newAttractions);
    }
  };

  // If no dates set, show simple grid
  if (!startDate || !endDate || numDays === 0) {
    return (
      <div className="space-y-6">
        <motion.div 
          className="flex items-center gap-3 text-muted font-body font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CalendarDays size={18} strokeWidth={1.5} />
          <span>Set trip dates to organize attractions by day</span>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions
            .sort((a, b) => a.order - b.order)
            .map((attraction, index) => (
              <motion.div 
                key={attraction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <AttractionCardContent
                  attraction={attraction}
                  isActive={selectedAttractionId === attraction.id}
                  onClick={() => onSelectAttraction(attraction.id)}
                  onRemove={onRemoveAttraction ? () => onRemoveAttraction(attraction.id) : undefined}
                />
              </motion.div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-10">
        {/* Unassigned attractions row */}
        <motion.div 
          className="rounded-[2rem] p-6"
          style={{ backgroundColor: 'rgba(92, 107, 74, 0.05)', border: '1px solid rgba(92, 107, 74, 0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DayColumn
            dayNumber={null}
            title="Unassigned"
            subtitle="Drag to a day below"
            attractions={unassigned}
            selectedAttractionId={selectedAttractionId}
            onSelectAttraction={onSelectAttraction}
            onRemoveAttraction={onRemoveAttraction}
            isHorizontal
          />
        </motion.div>

        {/* Day rows */}
        {Array.from({ length: numDays }, (_, i) => i + 1).map((dayNum) => (
          <motion.div 
            key={dayNum} 
            className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-warm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: dayNum * 0.1 }}
          >
            <DayColumn
              dayNumber={dayNum}
              title={`Day ${dayNum}`}
              attractions={dayGroups[dayNum] || []}
              selectedAttractionId={selectedAttractionId}
              onSelectAttraction={onSelectAttraction}
              onRemoveAttraction={onRemoveAttraction}
              startDate={startDate}
              isHorizontal
            />
          </motion.div>
        ))}
      </div>

      <DragOverlay>
        {activeAttraction && (
          <div className="opacity-90 w-[300px]">
            <AttractionCardContent
              attraction={activeAttraction}
              isDragging
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
