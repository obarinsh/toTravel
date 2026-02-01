'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Attraction } from '@/types';
import { SortableAttractionCard } from './AttractionCard';

interface ItineraryListProps {
  attractions: Attraction[];
  selectedAttractionId?: string | null;
  onReorder: (attractions: Attraction[]) => void;
  onSelectAttraction: (id: string) => void;
  onRemoveAttraction?: (id: string) => void;
}

export default function ItineraryList({
  attractions,
  selectedAttractionId,
  onReorder,
  onSelectAttraction,
  onRemoveAttraction,
}: ItineraryListProps) {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = attractions.findIndex((a) => a.id === active.id);
      const newIndex = attractions.findIndex((a) => a.id === over.id);

      const newAttractions = arrayMove(attractions, oldIndex, newIndex).map(
        (attraction, index) => ({
          ...attraction,
          order: index + 1,
        })
      );

      onReorder(newAttractions);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={attractions.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {attractions
            .sort((a, b) => a.order - b.order)
            .map((attraction) => (
              <SortableAttractionCard
                key={attraction.id}
                attraction={attraction}
                isActive={selectedAttractionId === attraction.id}
                onClick={() => onSelectAttraction(attraction.id)}
                onRemove={onRemoveAttraction ? () => onRemoveAttraction(attraction.id) : undefined}
              />
            ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
