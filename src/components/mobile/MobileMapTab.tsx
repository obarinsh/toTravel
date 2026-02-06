'use client';

import { useState, useMemo } from 'react';
import { Trip } from '@/types';
import MapWrapper from '@/components/MapWrapper';

interface MobileMapTabProps {
  trip: Trip;
  numDays: number;
}

export default function MobileMapTab({ trip, numDays }: MobileMapTabProps) {
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');

  const { attractions, hotel_location } = trip;

  // Filter attractions based on selected day
  const filteredAttractions = useMemo(() => {
    if (selectedDay === 'all') {
      return attractions;
    }
    return attractions.filter((a) => a.day === selectedDay);
  }, [attractions, selectedDay]);

  // Count attractions per day for the filter badges
  const countsPerDay = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let i = 1; i <= numDays; i++) {
      counts[i] = attractions.filter((a) => a.day === i).length;
    }
    return counts;
  }, [attractions, numDays]);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
      {/* Day Filter */}
      <div className="px-4 py-3 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {/* All button */}
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedDay === 'all'
                ? 'bg-[#5C6B4A] text-white'
                : 'bg-gray-100 text-muted hover:bg-gray-200'
            }`}
          >
            All ({attractions.length})
          </button>
          
          {/* Day buttons */}
          {Array.from({ length: numDays }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedDay === day
                  ? 'bg-[#5C6B4A] text-white'
                  : 'bg-gray-100 text-muted hover:bg-gray-200'
              }`}
            >
              Day {day} ({countsPerDay[day] || 0})
            </button>
          ))}
          
          {/* Unassigned button */}
          <button
            onClick={() => setSelectedDay(0)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedDay === 0
                ? 'bg-[#E4B84A] text-white'
                : 'bg-gray-100 text-muted hover:bg-gray-200'
            }`}
          >
            Unassigned ({attractions.filter((a) => !a.day).length})
          </button>
        </div>
      </div>

      {/* Full Height Map */}
      <div className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden min-h-[300px]">
        <MapWrapper
          attractions={selectedDay === 0 
            ? attractions.filter((a) => !a.day) 
            : filteredAttractions
          }
          hotelLocation={hotel_location}
          center={trip.destination_coordinates}
        />
      </div>

      {/* Legend */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="flex items-center justify-center gap-4 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium text-white"
              style={{ backgroundColor: '#5C6B4A' }}
            >
              1
            </div>
            <span>Assigned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium text-white"
              style={{ backgroundColor: '#E4B84A' }}
            >
              ?
            </div>
            <span>Unassigned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium text-white"
              style={{ backgroundColor: '#EF4444' }}
            >
              H
            </div>
            <span>Hotel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
