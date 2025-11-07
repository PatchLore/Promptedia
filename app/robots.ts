import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.onpointprompt.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/sign-in', '/api/', '/admin/', '/auth/'],
      },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`],
  };
}


