'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ChevronDown, ChevronUp, Navigation, Car } from 'lucide-react';
import { Attraction, Trip } from '@/types';
import { clusterAttractions, sortByDistanceFrom, Cluster } from '@/lib/clustering';
import { formatDistance, formatDriveTime, estimateDriveTime } from '@/lib/distance';
import MapWrapper from './MapWrapper';

interface NearbyTabProps {
  trip: Trip;
  onSelectAttraction: (id: string) => void;
  selectedAttractionId?: string | null;
}

interface ClusterCardProps {
  cluster: Cluster;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectAttraction: (id: string) => void;
  onShowDistances: (attraction: Attraction) => void;
  selectedAttractionId?: string | null;
}

function ClusterCard({
  cluster,
  isExpanded,
  onToggle,
  onSelectAttraction,
  onShowDistances,
  selectedAttractionId,
}: ClusterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border/50 overflow-hidden"
    >
      {/* Cluster Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-background/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: '#5C6B4A' }}
          >
            {cluster.attractions.length}
          </div>
          <div className="text-left">
            <h3 className="font-heading font-semibold text-foreground text-sm">
              {cluster.name}
            </h3>
            <p className="text-xs text-muted">
              {cluster.attractions.length} {cluster.attractions.length === 1 ? 'place' : 'places'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={18} className="text-muted" />
        ) : (
          <ChevronDown size={18} className="text-muted" />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/30"
          >
            <div className="p-2 space-y-1">
              {cluster.attractions.map((attraction) => (
                <div
                  key={attraction.id}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    selectedAttractionId === attraction.id
                      ? 'bg-primary/10'
                      : 'hover:bg-background'
                  }`}
                >
                  <button
                    onClick={() => onSelectAttraction(attraction.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="text-sm font-medium text-foreground truncate">
                      {attraction.name}
                    </p>
                    {attraction.day && (
                      <p className="text-xs text-muted">Day {attraction.day}</p>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowDistances(attraction);
                    }}
                    className="p-1.5 rounded-full hover:bg-secondary/20 transition-colors flex-shrink-0"
                    title="Show distances from this place"
                  >
                    <MapPin size={16} style={{ color: '#5C6B4A' }} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface DistanceListProps {
  fromAttraction: Attraction;
  allAttractions: Attraction[];
  onSelectAttraction: (id: string) => void;
  onClose: () => void;
  selectedAttractionId?: string | null;
}

function DistanceList({
  fromAttraction,
  allAttractions,
  onSelectAttraction,
  onClose,
  selectedAttractionId,
}: DistanceListProps) {
  const sortedAttractions = useMemo(() => {
    const others = allAttractions.filter((a) => a.id !== fromAttraction.id);
    return sortByDistanceFrom(others, fromAttraction.coordinates);
  }, [fromAttraction, allAttractions]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-card rounded-xl border border-border/50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation size={16} style={{ color: '#5C6B4A' }} />
          <div>
            <p className="text-xs text-muted">Distances from</p>
            <p className="font-heading font-semibold text-foreground text-sm truncate max-w-[200px]">
              {fromAttraction.name}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-muted hover:text-foreground px-2 py-1 rounded-lg hover:bg-background transition-colors"
        >
          Close
        </button>
      </div>

      {/* Distance List */}
      <div className="max-h-[300px] overflow-y-auto">
        {sortedAttractions.map((attraction) => {
          const driveTime = estimateDriveTime(attraction.distanceKm);
          return (
            <button
              key={attraction.id}
              onClick={() => onSelectAttraction(attraction.id)}
              className={`w-full px-4 py-3 flex items-center gap-3 border-b border-border/20 last:border-b-0 transition-colors ${
                selectedAttractionId === attraction.id
                  ? 'bg-primary/10'
                  : 'hover:bg-background'
              }`}
            >
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {attraction.name}
                </p>
                {attraction.day && (
                  <p className="text-xs text-muted">Day {attraction.day}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted flex-shrink-0">
                <Car size={12} strokeWidth={1.5} />
                <span className="font-medium" style={{ color: '#5C6B4A' }}>
                  {formatDistance(attraction.distanceKm)}
                </span>
                <span className="text-muted/60">·</span>
                <span>{formatDriveTime(driveTime)}</span>
              </div>
            </button>
          );
        })}
        {sortedAttractions.length === 0 && (
          <div className="px-4 py-8 text-center text-muted text-sm">
            No other places to compare
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function NearbyTab({
  trip,
  onSelectAttraction,
  selectedAttractionId,
}: NearbyTabProps) {
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  const [distanceFromAttraction, setDistanceFromAttraction] = useState<Attraction | null>(null);
  const [highlightedCluster, setHighlightedCluster] = useState<Cluster | null>(null);

  const clusters = useMemo(() => {
    return clusterAttractions(trip.attractions, 5);
  }, [trip.attractions]);

  // Auto-expand first cluster if only one exists
  const effectiveExpandedId = expandedClusterId ?? (clusters.length === 1 ? clusters[0]?.id : null);

  // Get attractions to highlight on map
  const mapAttractions = useMemo(() => {
    if (distanceFromAttraction) {
      return trip.attractions;
    }
    if (highlightedCluster) {
      return highlightedCluster.attractions;
    }
    return trip.attractions;
  }, [trip.attractions, distanceFromAttraction, highlightedCluster]);

  // Find the attraction being viewed for distance
  const highlightedAttractionId = distanceFromAttraction?.id ?? selectedAttractionId;

  const handleToggleCluster = (cluster: Cluster) => {
    if (effectiveExpandedId === cluster.id) {
      setExpandedClusterId(null);
      setHighlightedCluster(null);
    } else {
      setExpandedClusterId(cluster.id);
      setHighlightedCluster(cluster);
    }
    setDistanceFromAttraction(null);
  };

  const handleShowDistances = (attraction: Attraction) => {
    setDistanceFromAttraction(attraction);
    setHighlightedCluster(null);
  };

  return (
    <div className="space-y-4">
      {/* Mini Map */}
      <div className="h-[180px] rounded-2xl overflow-hidden border border-border/50">
        <MapWrapper
          attractions={mapAttractions}
          hotelLocation={trip.hotel_location}
          center={trip.destination_coordinates}
          selectedAttractionId={highlightedAttractionId}
          onMarkerClick={onSelectAttraction}
        />
      </div>

      {/* Distance View or Cluster View */}
      <AnimatePresence mode="wait">
        {distanceFromAttraction ? (
          <DistanceList
            key="distance-list"
            fromAttraction={distanceFromAttraction}
            allAttractions={trip.attractions}
            onSelectAttraction={onSelectAttraction}
            onClose={() => setDistanceFromAttraction(null)}
            selectedAttractionId={selectedAttractionId}
          />
        ) : (
          <motion.div
            key="cluster-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Cluster info header */}
            <div className="flex items-center gap-2 px-1">
              <MapPin size={14} style={{ color: '#5C6B4A' }} />
              <p className="text-xs text-muted">
                {clusters.length} {clusters.length === 1 ? 'area' : 'areas'} · Tap{' '}
                <MapPin size={10} className="inline" /> to see distances
              </p>
            </div>

            {/* Cluster Cards */}
            {clusters.map((cluster) => (
              <ClusterCard
                key={cluster.id}
                cluster={cluster}
                isExpanded={effectiveExpandedId === cluster.id}
                onToggle={() => handleToggleCluster(cluster)}
                onSelectAttraction={onSelectAttraction}
                onShowDistances={handleShowDistances}
                selectedAttractionId={selectedAttractionId}
              />
            ))}

            {clusters.length === 0 && (
              <div className="text-center py-8 text-muted text-sm">
                <MapPin size={32} className="mx-auto mb-3 opacity-40" />
                <p>No places added yet</p>
                <p className="text-xs mt-1">Add places from the Activities tab</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
