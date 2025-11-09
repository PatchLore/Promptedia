import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase/client';
import { buildPromptUrl } from '@/lib/slug';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';

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
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/browse?category=${encodeURIComponent(c)}`,
    changeFrequency: 'weekly',
    priority: 0.6,
    lastModified: new Date(),
  }));

  const { data: prompts } = await supabase
    .from('prompts')
        .select('id, slug, created_at')
    .eq('is_public', true)
    .eq('is_pro', false)
    .order('created_at', { ascending: false })
    .limit(5000);

      const promptRoutes: MetadataRoute.Sitemap = (prompts || []).map((p: any) => ({
        url: buildPromptUrl(baseUrl, p),
    changeFrequency: 'weekly',
    priority: 0.7,
    lastModified: new Date(p.updated_at || p.created_at || Date.now()),
  }));

  return [...staticRoutes, ...categoryRoutes, ...promptRoutes];
}


