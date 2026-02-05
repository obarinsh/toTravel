import { Coordinates } from '@/types';

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  
  const lat1 = coord1.lat * Math.PI / 180;
  const lat2 = coord2.lat * Math.PI / 180;
  const deltaLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const deltaLng = (coord2.lng - coord1.lng) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Format distance for display
 * @param km Distance in kilometers
 * @returns Formatted string like "4.2km" or "850m"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Estimate drive time based on distance
 * Assumes average city driving speed of ~30km/h
 * @param km Distance in kilometers
 * @returns Estimated drive time in minutes
 */
export function estimateDriveTime(km: number): number {
  const averageSpeedKmh = 30; // Conservative estimate for city driving
  const hours = km / averageSpeedKmh;
  return Math.max(1, Math.round(hours * 60)); // Minimum 1 minute
}

/**
 * Format drive time for display
 * @param minutes Drive time in minutes
 * @returns Formatted string like "~4 min" or "~1h 20min"
 */
export function formatDriveTime(minutes: number): string {
  if (minutes < 60) {
    return `~${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `~${hours}h`;
  }
  return `~${hours}h ${mins}min`;
}

/**
 * Get formatted distance and drive time between two coordinates
 */
export function getDistanceInfo(coord1: Coordinates, coord2: Coordinates): {
  distance: string;
  driveTime: string;
  distanceKm: number;
  driveTimeMinutes: number;
} {
  const distanceKm = calculateDistance(coord1, coord2);
  const driveTimeMinutes = estimateDriveTime(distanceKm);
  
  return {
    distance: formatDistance(distanceKm),
    driveTime: formatDriveTime(driveTimeMinutes),
    distanceKm,
    driveTimeMinutes,
  };
}
