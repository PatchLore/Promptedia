import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const category = searchParams.get('category') || '';
  const topics = searchParams.get('topics') || '';
  const orientation = searchParams.get('orientation') || 'landscape';

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!unsplashKey) {
    return NextResponse.json(
      { error: 'UNSPLASH_ACCESS_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    // attempt up to 3 pages to find a unique image
    const perPage = 30;
    const maxTries = 3;
    const baseUrl = new URL('https://api.unsplash.com/search/photos');
    baseUrl.searchParams.set('query', query + (category ? ` ${category}` : ''));
    if (topics) baseUrl.searchParams.set('topics', topics);
    baseUrl.searchParams.set('orientation', orientation);
    baseUrl.searchParams.set('per_page', String(perPage));
    baseUrl.searchParams.set('client_id', unsplashKey);

    let chosen: any | null = null;
    let lastStatus = 0;

    for (let attempt = 0; attempt < maxTries && !chosen; attempt++) {
      const page = Math.floor(Math.random() * 10) + 1; // randomize 1..10
      baseUrl.searchParams.set('page', String(page));

      const response = await fetch(baseUrl.toString());
      lastStatus = response.status;
      if (!response.ok) continue;
      const data = await response.json();
      const results: any[] = data.results || [];
      if (results.length === 0) continue;

      // Get set of used photo IDs by scanning prompts.example_url for IDs
      // We check existence in DB to avoid duplicates across reloads
      const ids = results.map((p) => p.id);
      const likeClauses = ids.map((id) => `example_url.ilike.%${id}%`).join(',');
      let usedIds = new Set<string>();
      if (ids.length > 0 && likeClauses.length > 0) {
        try {
          const supabase = getSupabaseServerClient();
          const { data: usedPrompts, error: usedError } = await supabase
            .from('prompts')
            .select('example_url')
            .or(likeClauses);

          if (!usedError && usedPrompts) {
            usedPrompts.forEach((row: any) => {
              const url: string = row.example_url || '';
              ids.forEach((id) => {
                if (url.includes(id)) usedIds.add(id);
              });
            });
          }
        } catch (error) {
          console.error('Supabase check failed while deduplicating Unsplash results:', error);
        }
      }

      // Pick the first unused photo
      chosen = results.find((p) => !usedIds.has(p.id)) || null;
    }

    if (chosen) {
      const imageUrl = `${chosen.urls.raw}?w=1280&h=720&fit=crop&q=80`;
      return NextResponse.json({
        success: true,
        imageUrl,
        thumbUrl: chosen.urls.thumb,
        alt: chosen.alt_description || chosen.description || query,
        photographer: chosen.user.name,
        photographerUrl: chosen.user.links.html,
        id: chosen.id,
      });
    }

    return NextResponse.json({ success: false, message: 'No unique image found.', status: lastStatus || 404 });
  } catch (error) {
    console.error('Unsplash API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image from Unsplash', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}



