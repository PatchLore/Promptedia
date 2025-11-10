import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

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

  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('prompt_id')
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const promptIds =
    data?.map((favorite) => favorite.prompt_id).filter((id): id is string => Boolean(id)) ?? [];

  return NextResponse.json(
    { promptIds },
    {
      headers: {
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    }
  );
}

