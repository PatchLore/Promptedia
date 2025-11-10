import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

function createUrlElement(loc: string, lastmod?: string) {
  return `
    <url>
      <loc>${loc}</loc>
      ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `;
}

export async function GET() {
  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (error) {
    const body = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      createUrlElement(`${BASE_URL}/`),
      '</urlset>',
    ].join('');

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=300',
      },
    });
  }

  const staticPaths = [
    `${BASE_URL}/`,
    `${BASE_URL}/browse`,
    `${BASE_URL}/prompts`,
    `${BASE_URL}/packs`,
    `${BASE_URL}/profile`,
    `${BASE_URL}/create`,
  ];

  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('slug, updated_at')
    .eq('is_public', true)
    .eq('is_pro', false)
    .order('updated_at', { ascending: false })
    .limit(5000);

  if (error && process.env.NODE_ENV === 'development') {
    console.error('[API][sitemap] Failed to load prompts', error);
  }

  const promptEntries =
    prompts?.map((prompt) =>
      createUrlElement(
        `${BASE_URL}/prompts/${prompt.slug}`,
        prompt.updated_at ? new Date(prompt.updated_at).toISOString() : undefined
      )
    ) ?? [];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticPaths.map((path) => createUrlElement(path)),
    ...promptEntries,
    '</urlset>',
  ].join('');

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=300, stale-while-revalidate=300',
    },
  });
}

