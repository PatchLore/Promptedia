import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const CACHE_CONTROL = 's-maxage=60, stale-while-revalidate=300';

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

  const idsParam = searchParams.get('ids');
  const category = searchParams.get('category');
  const search = searchParams.get('search') ?? searchParams.get('q');
  const limitParam = searchParams.get('limit');
  const includePrivate = searchParams.get('includePrivate') === 'true';
  const excludeSlug = searchParams.get('exclude');

  const ids = idsParam
    ? idsParam
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    : [];

  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

  let query = supabase
    .from('prompts')
    .select(
      'id, title, slug, prompt, description, category, tags, created_at, example_url, thumbnail_url, model, type'
    )
    .order('created_at', { ascending: false });

  if (!includePrivate) {
    query = query.eq('is_public', true);
  }

  if (ids.length > 0) {
    query = query.in('id', ids);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    const like = `%${search}%`;
    query = query.or(`title.ilike.${like},description.ilike.${like},prompt.ilike.${like}`);
  }

  if (limit && Number.isFinite(limit)) {
    query = query.limit(Math.max(1, limit));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const filtered = excludeSlug
    ? (data ?? []).filter((prompt) => prompt.slug !== excludeSlug)
    : data ?? [];

  return NextResponse.json(
    { prompts: filtered },
    {
      headers: {
        'Cache-Control': CACHE_CONTROL,
      },
    }
  );
}

