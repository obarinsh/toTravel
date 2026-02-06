// Image sources for attractions

// Use our API endpoint which handles Unsplash API + Wikipedia fallback
export function getApiImageUrl(searchTerm: string): string {
  return `/api/image?query=${encodeURIComponent(searchTerm)}`;
}

// Alternative: Use a placeholder with the attraction name
export function getPlaceholderImage(name: string, width = 400, height = 300): string {
  const encodedName = encodeURIComponent(name);
  return `https://placehold.co/${width}x${height}/5C6B4A/white?text=${encodedName}`;
}

// Get image URL for an attraction - returns API route URL
export function getAttractionImageUrl(
  imageSearchTerm?: string,
  attractionName?: string
): string {
  if (imageSearchTerm) {
    return getApiImageUrl(imageSearchTerm);
  }
  if (attractionName) {
    return getApiImageUrl(attractionName);
  }
  return getPlaceholderImage('Attraction');
}

// Check if a URL is a broken Unsplash source URL
export function isBrokenUnsplashUrl(url: string): boolean {
  return url.includes('source.unsplash.com');
}

// Get a fixed URL for an attraction photo
export function getFixedImageUrl(url: string | undefined, fallbackSearchTerm: string): string {
  if (!url || isBrokenUnsplashUrl(url)) {
    return getApiImageUrl(fallbackSearchTerm);
  }
  return url;
}
