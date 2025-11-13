import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const CACHE_CONTROL = 's-maxage=60, stale-while-revalidate=300';

// Synonym expansion map
const synonyms: Record<string, string[]> = {
  writing: ['story', 'plot', 'narrative', 'prose', 'text', 'essay'],
  art: ['image', 'picture', 'visual', 'render', 'illustration', 'graphics', 'design', 'painting'],
  horror: ['scary', 'fear', 'ghost', 'spooky', 'terrifying', 'frightening'],
  music: ['audio', 'sound', 'song', 'melody', 'beat', 'track'],
  coding: ['code', 'programming', 'script', 'development', 'software'],
  business: ['corporate', 'professional', 'enterprise', 'commercial'],
  comedy: ['funny', 'humor', 'humorous', 'joke', 'laugh'],
  romance: ['love', 'romantic', 'dating', 'relationship'],
  action: ['adventure', 'thriller', 'exciting', 'intense'],
  fantasy: ['magical', 'magic', 'mythical', 'enchanted'],
  sci: ['science', 'scientific', 'futuristic', 'technology', 'tech'],
};

/**
 * Expands query tokens with synonyms
 */
function expandQueryTokens(query: string): string[] {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.trim());

  const expanded = new Set<string>(tokens);

  // Add synonyms for each token
  for (const token of tokens) {
    const tokenSynonyms = synonyms[token] || [];
    tokenSynonyms.forEach((syn) => expanded.add(syn));
  }

  return Array.from(expanded);
}

/**
 * Builds a weighted search query using PostgreSQL ILIKE and array operations
 * Since pg_trgm requires extension setup, we use a combination of:
 * - ILIKE for fuzzy matching
 * - Array overlap for tags
 * - Weighted scoring based on match location
 */
function buildSearchQuery(supabase: ReturnType<typeof getSupabaseServerClient>, queryTokens: string[], limit: number) {
  // Build ILIKE patterns for each token
  const likePatterns = queryTokens.map((token) => `%${token}%`);

  // Base query
  let baseQuery = supabase
    .from('prompts')
    .select(
      'id, title, slug, prompt, description, category, tags, created_at, example_url, thumbnail_url, audio_preview_url, model, type'
    )
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit * 2); // Fetch more to allow for client-side ranking

  // Build OR conditions for fuzzy matching
  const orConditions: string[] = [];

  // Title matches (highest priority)
  for (const pattern of likePatterns) {
    orConditions.push(`title.ilike.${pattern}`);
  }

  // Description/prompt text matches
  for (const pattern of likePatterns) {
    orConditions.push(`description.ilike.${pattern}`);
    orConditions.push(`prompt.ilike.${pattern}`);
  }

  // Category matches
  for (const pattern of likePatterns) {
    orConditions.push(`category.ilike.${pattern}`);
  }

  // Tags: use array overlap (tags && array of query tokens)
  // Note: Supabase doesn't directly support array overlap in OR, so we'll filter client-side

  if (orConditions.length > 0) {
    baseQuery = baseQuery.or(orConditions.join(','));
  }

  return baseQuery;
}

/**
 * Calculates a weighted relevance score for a prompt
 */
function calculateScore(
  prompt: any,
  queryTokens: string[],
  queryLower: string
): number {
  let score = 0;
  const title = (prompt.title || '').toLowerCase();
  const description = (prompt.description || '').toLowerCase();
  const promptText = (prompt.prompt || '').toLowerCase();
  const category = (prompt.category || '').toLowerCase();
  const tags = Array.isArray(prompt.tags) ? prompt.tags.map((t: string) => t.toLowerCase()) : [];

  // Title matches: 3x weight
  for (const token of queryTokens) {
    if (title.includes(token)) {
      // Exact match gets bonus
      if (title === token || title.startsWith(token) || title.endsWith(token)) {
        score += 30;
      } else {
        score += 20;
      }
    }
  }

  // Tags matches: 2x weight
  for (const token of queryTokens) {
    if (tags.includes(token)) {
      score += 20;
    }
    // Partial tag match
    for (const tag of tags) {
      if (tag.includes(token)) {
        score += 10;
      }
    }
  }

  // Category matches: 1.5x weight
  for (const token of queryTokens) {
    if (category.includes(token)) {
      score += 15;
    }
  }

  // Description/prompt text matches: 1x weight
  const combinedText = `${description} ${promptText}`;
  for (const token of queryTokens) {
    const matches = (combinedText.match(new RegExp(token, 'gi')) || []).length;
    score += matches * 5;
  }

  // Exact phrase match bonus
  if (title.includes(queryLower) || description.includes(queryLower) || promptText.includes(queryLower)) {
    score += 50;
  }

  return score;
}

export async function GET(request: NextRequest) {
  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Supabase configuration error.' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || searchParams.get('query') || '';
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(Number.parseInt(limitParam, 10), 100) : 50;

  // Return empty if query is too short
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) {
    return NextResponse.json(
      { prompts: [] },
      {
        headers: {
          'Cache-Control': CACHE_CONTROL,
        },
      }
    );
  }

  try {
    // Expand query with synonyms
    const queryTokens = expandQueryTokens(trimmedQuery);
    const queryLower = trimmedQuery.toLowerCase();

    // Build and execute search query
    const searchQuery = buildSearchQuery(supabase, queryTokens, limit);
    const { data, error } = await searchQuery;

    if (error) {
      console.error('[Search API] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate weighted scores and rank results
    const scored = (data || []).map((prompt) => ({
      ...prompt,
      _score: calculateScore(prompt, queryTokens, queryLower),
    }));

    // Filter out zero-score results and sort by score
    const ranked = scored
      .filter((item) => item._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, limit)
      .map(({ _score, ...prompt }) => prompt); // Remove score from final output

    return NextResponse.json(
      { prompts: ranked },
      {
        headers: {
          'Cache-Control': CACHE_CONTROL,
        },
      }
    );
  } catch (error) {
    console.error('[Search API] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed.' },
      { status: 500 }
    );
  }
}

