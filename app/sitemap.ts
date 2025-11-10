import type { MetadataRoute } from 'next';
import { buildPromptUrl } from '@/lib/slug';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
  const supabase = getSupabaseServerClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      changeFrequency: 'weekly',
      priority: 1.0,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/browse`,
      changeFrequency: 'weekly',
      priority: 0.9,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/packs`,
      changeFrequency: 'monthly',
      priority: 0.8,
      lastModified: new Date(),
    },
  ];

  const categories = ['art', 'music', 'writing', 'business', 'coding'];
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${baseUrl}/browse?category=${encodeURIComponent(slug)}`,
    changeFrequency: 'weekly',
    priority: 0.6,
    lastModified: new Date(),
  }));

  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('id, slug, created_at, updated_at')
    .eq('is_public', true)
    .eq('is_pro', false)
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error && process.env.NODE_ENV === 'development') {
    console.error('Failed to load prompts for sitemap', error);
  }

  const promptRoutes: MetadataRoute.Sitemap =
    prompts?.map((prompt) => ({
      url: buildPromptUrl(baseUrl, prompt),
      changeFrequency: 'weekly',
      priority: 0.7,
      lastModified: new Date(prompt.updated_at ?? prompt.created_at ?? Date.now()),
    })) ?? [];

  return [...staticRoutes, ...categoryRoutes, ...promptRoutes];
}
