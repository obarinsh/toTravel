'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

interface AttractionImageProps {
  photoUrl?: string;
  name: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

// Check if a URL needs to be fetched via API (broken Unsplash or API route URLs)
function needsFetching(url: string): boolean {
  return url.includes('source.unsplash.com') || url.startsWith('/api/');
}

export default function AttractionImage({
  photoUrl,
  name,
  className = '',
  fill = true,
  width,
  height,
  priority = false,
}: AttractionImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      // If we have a valid URL that doesn't need fetching, use it directly
      if (photoUrl && !needsFetching(photoUrl)) {
        setImageUrl(photoUrl);
        setIsLoading(false);
        return;
      }

      // Otherwise, fetch from our API
      try {
        const searchTerm = name;
        const response = await fetch(`/api/image?query=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error('Error fetching image:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [photoUrl, name]);

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`bg-gray-100 animate-pulse flex items-center justify-center ${className}`}
        style={!fill ? { width, height } : undefined}
      >
        <MapPin size={16} className="text-gray-300" />
      </div>
    );
  }

  // Error state or no image
  if (hasError || !imageUrl) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ 
          backgroundColor: 'rgba(92, 107, 74, 0.1)',
          ...(!fill ? { width, height } : {})
        }}
      >
        <MapPin size={16} style={{ color: '#5C6B4A' }} />
      </div>
    );
  }

  // Success - show image
  if (fill) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        fill
        sizes="48px"
        className={`object-cover ${className}`}
        priority={priority}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={name}
      width={width || 48}
      height={height || 48}
      className={`object-cover ${className}`}
      priority={priority}
      onError={() => setHasError(true)}
    />
  );
}
