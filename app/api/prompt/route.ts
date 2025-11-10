import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const CACHE_CONTROL = 's-maxage=120, stale-while-revalidate=600';

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

  const id = searchParams.get('id');
  const slug = searchParams.get('slug');

  if (!id && !slug) {
    return NextResponse.json(
      { error: 'Provide either an id or slug parameter.' },
      { status: 400 }
    );
  }

  let query = supabase
    .from('prompts')
    .select(
      'id, title, slug, prompt, description, category, tags, created_at, updated_at, example_url, thumbnail_url, model, type'
    )
    .limit(1);

  if (id) {
    query = query.eq('id', id);
  } else if (slug) {
    query = query.eq('slug', slug);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(
    { prompt: data },
    {
      headers: {
        'Cache-Control': CACHE_CONTROL,
      },
    }
  );
}

