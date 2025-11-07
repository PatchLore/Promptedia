import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
  const supabase = await createClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      changeFrequency: 'daily',
      priority: 1,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/browse`,
      changeFrequency: 'daily',
      priority: 0.9,
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
    .select('id, created_at')
    .eq('is_public', true)
    .eq('is_pro', false)
    .order('created_at', { ascending: false })
    .limit(5000);

  const promptRoutes: MetadataRoute.Sitemap = (prompts || []).map((p: any) => ({
    url: `${baseUrl}/prompt/${p.id}`,
    changeFrequency: 'weekly',
    priority: 0.7,
    lastModified: new Date(p.updated_at || p.created_at || Date.now()),
  }));

  return [...staticRoutes, ...categoryRoutes, ...promptRoutes];
}


