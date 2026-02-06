'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Attraction, Coordinates } from '@/types';

// Fix for default marker icons in Next.js
const createNumberedIcon = (number: number, isHotel = false, isUnassigned = false) => {
  const bgColor = isHotel ? '#EF4444' : isUnassigned ? '#E4B84A' : '#5C6B4A';
  const label = isHotel ? 'H' : isUnassigned ? '?' : number;
  
  return L.divIcon({
    className: 'custom-marker-container',
    html: `<div style="
      background: ${bgColor};
      color: white;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 12px;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    ">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

interface MapBoundsUpdaterProps {
  attractions: Attraction[];
  hotelLocation?: Coordinates;
}

interface MapBoundsUpdaterFullProps extends MapBoundsUpdaterProps {
  center?: Coordinates;
}

function MapBoundsUpdater({ attractions, hotelLocation, center }: MapBoundsUpdaterFullProps) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = attractions.map((a) => [
      a.coordinates.lat,
      a.coordinates.lng,
    ]);

    if (hotelLocation) {
      points.push([hotelLocation.lat, hotelLocation.lng]);
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (center) {
      // If no attractions, center on the destination
      map.setView([center.lat, center.lng], 13);
    }
    
    // Invalidate size to ensure map renders correctly
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [attractions, hotelLocation, center, map]);

  return null;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick, isEnabled }: { onMapClick?: (coordinates: Coordinates) => void; isEnabled?: boolean }) {
  useMapEvents({
    click: (e) => {
      if (isEnabled && onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

interface LeafletMapProps {
  attractions: Attraction[];
  hotelLocation?: Coordinates;
  center?: Coordinates;
  selectedAttractionId?: string | null;
  onMarkerClick?: (attractionId: string) => void;
  onMapClick?: (coordinates: Coordinates) => void;
  isSelectingHotel?: boolean;
}

export default function LeafletMap({
  attractions,
  hotelLocation,
  center = { lat: 48.8566, lng: 2.3522 },
  onMarkerClick,
  onMapClick,
  isSelectingHotel = false,
}: LeafletMapProps) {
  // Sort attractions by order for the polyline
  const sortedAttractions = useMemo(
    () => [...attractions].sort((a, b) => a.order - b.order),
    [attractions]
  );

  // Create polyline coordinates
  const polylinePositions: [number, number][] = useMemo(() => {
    const positions: [number, number][] = [];
    
    if (hotelLocation) {
      positions.push([hotelLocation.lat, hotelLocation.lng]);
    }
    
    sortedAttractions.forEach((attraction) => {
      positions.push([attraction.coordinates.lat, attraction.coordinates.lng]);
    });
    
    return positions;
  }, [sortedAttractions, hotelLocation]);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      className="h-full w-full rounded-xl"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBoundsUpdater attractions={attractions} hotelLocation={hotelLocation} center={center} />
      <MapClickHandler onMapClick={onMapClick} isEnabled={isSelectingHotel} />

      {/* Hotel marker */}
      {hotelLocation && (
        <Marker
          position={[hotelLocation.lat, hotelLocation.lng]}
          icon={createNumberedIcon(0, true)}
        />
      )}

      {/* Attraction markers */}
      {sortedAttractions.map((attraction) => (
        <Marker
          key={attraction.id}
          position={[attraction.coordinates.lat, attraction.coordinates.lng]}
          icon={createNumberedIcon(attraction.order, false, !attraction.day)}
          eventHandlers={{
            click: () => onMarkerClick?.(attraction.id),
          }}
        />
      ))}

      {/* Route polyline */}
      {polylinePositions.length > 1 && (
        <Polyline
          positions={polylinePositions}
          color="#3b82f6"
          weight={3}
          opacity={0.7}
          dashArray="10, 10"
        />
      )}
    </MapContainer>
  );
}
