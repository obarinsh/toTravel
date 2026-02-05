'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, MapPin, Navigation, Plus, Car } from 'lucide-react';
import { Trip, Attraction, Coordinates } from '@/types';
import { clusterAttractions, sortByDistanceFrom, Cluster } from '@/lib/clustering';
import { formatDistance, estimateDriveTime, formatDriveTime } from '@/lib/distance';
import MapWrapper from '@/components/MapWrapper';
import Image from 'next/image';

interface MobileNearbyTabProps {
  trip: Trip;
  onAssignToDay: (attractionId: string, dayNumber: number) => void;
}

interface ClusterCardProps {
  cluster: Cluster;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectAttraction: (attraction: Attraction) => void;
  selectedAttractionId?: string;
}

function ClusterCard({
  cluster,
  isExpanded,
  onToggle,
  onSelectAttraction,
  selectedAttractionId,
}: ClusterCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(92, 107, 74, 0.12)' }}
          >
            <MapPin size={18} style={{ color: '#5C6B4A' }} />
          </div>
          <div className="text-left">
            <p className="font-medium text-foreground">{cluster.name}</p>
            <p className="text-sm text-muted">
              {cluster.attractions.length} place{cluster.attractions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-muted" />
        </motion.div>
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
            <div className="px-4 pb-4 space-y-2">
              {cluster.attractions.map((attraction) => (
                <button
                  key={attraction.id}
                  onClick={() => onSelectAttraction(attraction)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    selectedAttractionId === attraction.id
                      ? 'bg-[#5C6B4A]/10 ring-1 ring-[#5C6B4A]'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
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
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-sm text-foreground truncate">
                      {attraction.name}
                    </p>
                    {attraction.day ? (
                      <p className="text-xs text-[#5C6B4A]">Day {attraction.day}</p>
                    ) : (
                      <p className="text-xs text-muted">Unassigned</p>
                    )}
                  </div>
                  
                  <ChevronRight size={16} className="text-muted flex-shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DistanceListProps {
  referenceAttraction: Attraction;
  allAttractions: Attraction[];
  onClose: () => void;
  onAssignToDay: (attractionId: string, dayNumber: number) => void;
  numDays: number;
}

function DistanceList({
  referenceAttraction,
  allAttractions,
  onClose,
  onAssignToDay,
  numDays,
}: DistanceListProps) {
  const sortedAttractions = useMemo(() => {
    const others = allAttractions.filter((a) => a.id !== referenceAttraction.id);
    return sortByDistanceFrom(others, referenceAttraction.coordinates);
  }, [allAttractions, referenceAttraction]);

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(228, 184, 74, 0.15)' }}
            >
              <Navigation size={18} style={{ color: '#E4B84A' }} />
            </div>
            <div>
              <p className="text-sm text-muted">Distances from</p>
              <p className="font-medium text-foreground truncate max-w-[200px]">
                {referenceAttraction.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-gray-100"
            style={{ color: '#8B9082' }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[300px] overflow-y-auto">
        {sortedAttractions.map((attraction) => {
          const driveMinutes = estimateDriveTime(attraction.distanceKm);
          
          return (
            <div
              key={attraction.id}
              className="flex items-center gap-3 p-4 border-b border-border last:border-0"
            >
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
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {attraction.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Car size={12} />
                  <span>{formatDistance(attraction.distanceKm)}</span>
                  <span>·</span>
                  <span>{formatDriveTime(driveMinutes)}</span>
                </div>
              </div>

              {/* Assign badge or day indicator */}
              {attraction.day ? (
                <span 
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: 'rgba(92, 107, 74, 0.12)', color: '#5C6B4A' }}
                >
                  Day {attraction.day}
                </span>
              ) : (
                <button
                  onClick={() => onAssignToDay(attraction.id, 1)}
                  className="p-2 rounded-full transition-colors hover:bg-gray-100"
                  style={{ color: '#5C6B4A' }}
                >
                  <Plus size={18} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MobileNearbyTab({
  trip,
  onAssignToDay,
}: MobileNearbyTabProps) {
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);

  const { attractions, start_date, end_date } = trip;
  const numDays = start_date && end_date ? 
    Math.ceil((new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;

  // Cluster attractions
  const clusters = useMemo(() => clusterAttractions(attractions), [attractions]);

  // Get attractions to show on map
  const mapAttractions = useMemo(() => {
    if (selectedAttraction) {
      return attractions;
    }
    if (expandedClusterId) {
      const cluster = clusters.find((c) => c.id === expandedClusterId);
      return cluster?.attractions || [];
    }
    return attractions;
  }, [attractions, clusters, expandedClusterId, selectedAttraction]);

  const handleToggleCluster = (clusterId: string) => {
    setExpandedClusterId(expandedClusterId === clusterId ? null : clusterId);
    setSelectedAttraction(null);
  };

  const handleSelectAttraction = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
  };

  if (attractions.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-12 text-muted">
          <MapPin size={32} className="mx-auto mb-3 opacity-50" />
          <p>No places added yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mini Map */}
      <div className="h-48 mx-4 mt-2 rounded-2xl overflow-hidden">
        <MapWrapper
          attractions={mapAttractions}
          hotelLocation={trip.hotel_location}
          selectedAttractionId={selectedAttraction?.id}
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {selectedAttraction ? (
          <DistanceList
            referenceAttraction={selectedAttraction}
            allAttractions={attractions}
            onClose={() => setSelectedAttraction(null)}
            onAssignToDay={onAssignToDay}
            numDays={numDays}
          />
        ) : (
          clusters.map((cluster) => (
            <ClusterCard
              key={cluster.id}
              cluster={cluster}
              isExpanded={expandedClusterId === cluster.id}
              onToggle={() => handleToggleCluster(cluster.id)}
              onSelectAttraction={handleSelectAttraction}
              selectedAttractionId={undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
