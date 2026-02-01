import { NextRequest, NextResponse } from 'next/server';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  // If no Unsplash key, fall back to Wikipedia
  if (!UNSPLASH_ACCESS_KEY) {
    return await getWikipediaImage(query);
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      // Fall back to Wikipedia if Unsplash fails
      return await getWikipediaImage(query);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Use the small size for faster loading
      const imageUrl = data.results[0].urls.small;
      return NextResponse.json({ imageUrl });
    }

    // No results from Unsplash, try Wikipedia
    return await getWikipediaImage(query);
  } catch (error) {
    console.error('Unsplash API error:', error);
    return await getWikipediaImage(query);
  }
}

async function getWikipediaImage(query: string): Promise<NextResponse> {
  try {
    // First try direct title match
    const directUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=400&origin=*`;
    const directResponse = await fetch(directUrl);
    const directData = await directResponse.json();
    const directPages = directData.query?.pages;

    if (directPages) {
      const page = Object.values(directPages)[0] as { thumbnail?: { source: string } };
      if (page?.thumbnail?.source) {
        return NextResponse.json({ imageUrl: page.thumbnail.source });
      }
    }

    // Try search
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    const searchResults = searchData.query?.search;

    if (searchResults && searchResults.length > 0) {
      const firstResult = searchResults[0];
      const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${firstResult.pageid}&prop=pageimages&format=json&pithumbsize=400&origin=*`;
      const pageResponse = await fetch(pageUrl);
      const pageData = await pageResponse.json();
      const pages = pageData.query?.pages;

      if (pages) {
        const page = Object.values(pages)[0] as { thumbnail?: { source: string } };
        if (page?.thumbnail?.source) {
          return NextResponse.json({ imageUrl: page.thumbnail.source });
        }
      }
    }

    return NextResponse.json({ imageUrl: null });
  } catch {
    return NextResponse.json({ imageUrl: null });
  }
}
