'use client';

import dynamic from 'next/dynamic';
import { Attraction, Coordinates } from '@/types';

// Dynamically import the map component with no SSR
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-background rounded-xl flex items-center justify-center">
      <div className="text-secondary">Loading map...</div>
    </div>
  ),
});

interface MapWrapperProps {
  attractions: Attraction[];
  hotelLocation?: Coordinates;
  center?: Coordinates;
  selectedAttractionId?: string | null;
  onMarkerClick?: (attractionId: string) => void;
  onMapClick?: (coordinates: Coordinates) => void;
  isSelectingHotel?: boolean;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <LeafletMap {...props} />;
}
