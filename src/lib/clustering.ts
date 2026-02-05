import { Attraction, Coordinates } from '@/types';
import { calculateDistance } from './distance';

export interface Cluster {
  id: string;
  name: string;
  center: Coordinates;
  attractions: Attraction[];
}

/**
 * Calculate the center point of a group of coordinates
 */
function calculateCenter(attractions: Attraction[]): Coordinates {
  if (attractions.length === 0) {
    return { lat: 0, lng: 0 };
  }
  
  const sumLat = attractions.reduce((sum, a) => sum + a.coordinates.lat, 0);
  const sumLng = attractions.reduce((sum, a) => sum + a.coordinates.lng, 0);
  
  return {
    lat: sumLat / attractions.length,
    lng: sumLng / attractions.length,
  };
}

/**
 * Generate a name for a cluster based on its position relative to others
 */
function generateClusterName(index: number, totalClusters: number): string {
  if (totalClusters === 1) {
    return 'Main Area';
  }
  return `Area ${index + 1}`;
}

/**
 * Cluster attractions by geographic proximity using distance-based grouping
 * @param attractions Array of attractions to cluster
 * @param thresholdKm Maximum distance in km for attractions to be in the same cluster (default: 5km)
 * @returns Array of clusters
 */
export function clusterAttractions(
  attractions: Attraction[],
  thresholdKm: number = 5
): Cluster[] {
  if (attractions.length === 0) {
    return [];
  }

  // Copy attractions to avoid mutating original
  const remaining = [...attractions];
  const clusters: Cluster[] = [];

  while (remaining.length > 0) {
    // Start a new cluster with the first remaining attraction
    const seed = remaining.shift()!;
    const clusterAttractions: Attraction[] = [seed];

    // Find all attractions within threshold distance of any attraction in the cluster
    let changed = true;
    while (changed) {
      changed = false;
      
      for (let i = remaining.length - 1; i >= 0; i--) {
        const candidate = remaining[i];
        
        // Check if candidate is within threshold of any attraction in current cluster
        const isNearby = clusterAttractions.some(
          (a) => calculateDistance(a.coordinates, candidate.coordinates) <= thresholdKm
        );
        
        if (isNearby) {
          clusterAttractions.push(candidate);
          remaining.splice(i, 1);
          changed = true;
        }
      }
    }

    clusters.push({
      id: `cluster-${clusters.length}`,
      name: '', // Will be set after all clusters are created
      center: calculateCenter(clusterAttractions),
      attractions: clusterAttractions,
    });
  }

  // Sort clusters by number of attractions (largest first)
  clusters.sort((a, b) => b.attractions.length - a.attractions.length);

  // Generate names
  clusters.forEach((cluster, index) => {
    cluster.name = generateClusterName(index, clusters.length);
  });

  return clusters;
}

/**
 * Get all attractions sorted by distance from a reference point
 */
export function sortByDistanceFrom(
  attractions: Attraction[],
  reference: Coordinates
): Array<Attraction & { distanceKm: number }> {
  return attractions
    .map((a) => ({
      ...a,
      distanceKm: calculateDistance(reference, a.coordinates),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
