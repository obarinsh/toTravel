import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
console.log('Gemini API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');

const genAI = new GoogleGenerativeAI(apiKey);

// Use gemini-2.5-flash
export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
});

export async function generateAttractions(
  destination: string, 
  excludeNames?: string[],
  category?: string
): Promise<{
  attractions: Array<{
    name: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
    image_search_term: string;
  }>;
}> {
  const excludeSection = excludeNames && excludeNames.length > 0 
    ? `\n\nIMPORTANT: Do NOT include any of these places that the user already has: ${excludeNames.join(', ')}\nGenerate DIFFERENT attractions instead.`
    : '';

  // Category mapping for more natural prompts
  const categoryDescriptions: Record<string, string> = {
    museum: 'museums, galleries, and cultural institutions',
    park: 'parks, gardens, and green spaces',
    nature: 'natural attractions, scenic viewpoints, and outdoor destinations',
    religious: 'churches, temples, cathedrals, and places of worship',
    architecture: 'historic buildings, palaces, castles, and architectural landmarks',
    beach: 'beaches, coastal areas, and waterfront destinations',
    food: 'food markets, local food experiences, and culinary attractions',
    shopping: 'markets, shopping districts, and local shops',
    historic: 'historic sites, monuments, and memorials',
    landmark: 'famous landmarks and iconic attractions',
  };

  const categoryFilter = category && category.toLowerCase() !== 'all'
    ? `\n\nFOCUS: Generate attractions specifically in the "${category}" category (${categoryDescriptions[category.toLowerCase()] || category}). All attractions should match this type.`
    : '';

  const numAttractions = category && category.toLowerCase() !== 'all' ? 5 : 10;

  const prompt = `You are a travel expert with precise geographic knowledge. Generate ${numAttractions} must-see attractions for tourists visiting ${destination}.${categoryFilter}

For each attraction, provide:
- name: The official name of the attraction IN ENGLISH (use the common English name, not the local language)
- description: A brief 2-3 sentence description in English highlighting what makes it special
- category: One of: landmark, museum, nature, religious, entertainment, food, shopping
- latitude: The precise latitude coordinate of the attraction (decimal format, e.g., 32.0853)
- longitude: The precise longitude coordinate of the attraction (decimal format, e.g., 34.7818)
- image_search_term: A specific search term to find an image of this place (e.g., "Eiffel Tower Paris", "Louvre Museum exterior")

IMPORTANT: Provide accurate GPS coordinates for each attraction. These will be used to place markers on a map.${excludeSection}

Return ONLY a JSON object in this exact format:
{
  "attractions": [
    {
      "name": "Attraction Name in English",
      "description": "Brief description in English...",
      "category": "landmark",
      "latitude": 32.0853,
      "longitude": 34.7818,
      "image_search_term": "Attraction Name City"
    }
  ]
}`;

  const result = await geminiModel.generateContent(prompt);
  const response = result.response.text();
  
  try {
    // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response);
  } catch (e) {
    console.error('Failed to parse response:', response);
    throw new Error('Failed to parse Gemini response');
  }
}

export async function geocodeWithGemini(
  placeName: string,
  city: string
): Promise<{ lat: number; lng: number } | null> {
  const prompt = `You are a geographic expert. Find the precise GPS coordinates for "${placeName}" in ${city}.

Return ONLY a JSON object in this exact format (no other text):
{
  "latitude": 32.0853,
  "longitude": 34.7818,
  "found": true
}

If you cannot find this specific place, return:
{
  "found": false
}

Be as precise as possible - this will be used to place a marker on a map.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      if (data.found && data.latitude && data.longitude) {
        return { lat: data.latitude, lng: data.longitude };
      }
    }
    return null;
  } catch (e) {
    console.error('Gemini geocoding error:', e);
    return null;
  }
}

export async function answerTravelQuery(
  destination: string,
  query: string,
  hotelLocation?: { lat: number; lng: number }
): Promise<string> {
  const hotelContext = hotelLocation 
    ? `The user's hotel is located at coordinates: ${hotelLocation.lat}, ${hotelLocation.lng}.` 
    : '';

  const prompt = `You are a helpful travel assistant for someone visiting ${destination}. ${hotelContext}

User question: ${query}

Provide a helpful, concise response. If asked about locations (restaurants, shops, etc.), suggest specific places with brief descriptions. If the user mentions "near my hotel" or similar, consider the hotel location context.

Keep your response under 300 words and be practical and actionable.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('rate')) {
      throw new Error('API rate limit reached. Please wait a moment and try again.');
    }
    throw error;
  }
}
