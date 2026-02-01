// Free image sources for attractions

// Use Unsplash Source for free images (no API key needed)
export function getUnsplashImage(searchTerm: string, width = 400, height = 300): string {
  const query = encodeURIComponent(searchTerm);
  return `https://source.unsplash.com/${width}x${height}/?${query}`;
}

// Alternative: Use a placeholder with the attraction name
export function getPlaceholderImage(name: string, width = 400, height = 300): string {
  const encodedName = encodeURIComponent(name);
  return `https://placehold.co/${width}x${height}/3b82f6/white?text=${encodedName}`;
}

// Get image URL for an attraction
export function getAttractionImageUrl(
  imageSearchTerm?: string,
  attractionName?: string
): string {
  if (imageSearchTerm) {
    return getUnsplashImage(imageSearchTerm);
  }
  if (attractionName) {
    return getUnsplashImage(attractionName);
  }
  return getPlaceholderImage('Attraction');
}
