export type AffiliateTool = {
  name: string;
  url: string;
  logo?: string; // url or emoji string like "🎨"
  description: string;
  categories?: string[];
};

export type PromptPack = {
  slug: string;
  title: string;
  summary: string;
  price: string;
  url: string; // Gumroad/Payhip
};

const envOrDefault = (key: string, fallback: string) =>
  process.env[key] && process.env[key] !== '' ? (process.env[key] as string) : fallback;

export const affiliateTools: AffiliateTool[] = [
  {
    name: 'Mixo AI',
    url: envOrDefault('AFFILIATE_MIXO_URL', 'https://partner.mixo.io/?ref=promptopedia'),
    logo: '🚀',
    description: 'Launch pages for AI projects',
    categories: ['business', 'coding'],
  },
  {
    name: 'Notion AI',
    url: envOrDefault('AFFILIATE_NOTION_URL', 'https://notion.ai?via=promptopedia'),
    logo: '🧠',
    description: 'Workspace & AI writing',
    categories: ['writing', 'business'],
  },
  {
    name: 'Midjourney',
    url: envOrDefault('AFFILIATE_MIDJOURNEY_URL', 'https://www.midjourney.com'),
    logo: '🎨',
    description: 'AI image generator',
    categories: ['art'],
  },
  {
    name: 'Soundswoop',
    url: envOrDefault('AFFILIATE_SOUNDSWOOP_URL', 'https://soundswoop.ai/?ref=promptopedia'),
    logo: '🎵',
    description: 'Music prompt engine',
    categories: ['music'],
  },
];

export const promptPacks: PromptPack[] = [
  {
    slug: 'creators-100',
    title: '100 ChatGPT Prompts for Creators',
    summary: 'Turbocharge content ideas, scripts, hooks, and outlines.',
    price: '$12',
    url: envOrDefault('PACK_CREATORS_URL', 'https://gumroad.com/l/creators-100'),
  },
  {
    slug: 'music-50',
    title: '50 Music Prompts for AI Musicians',
    summary: 'Genres, moods, and structures for generative audio.',
    price: '$9',
    url: envOrDefault('PACK_MUSIC_URL', 'https://gumroad.com/l/music-50'),
  },
  {
    slug: 'image-80',
    title: '80 Image Prompts for Midjourney',
    summary: 'Curated styles and scenes for striking visuals.',
    price: '$10',
    url: envOrDefault('PACK_IMAGE_URL', 'https://gumroad.com/l/image-80'),
  },
];

export function pickAffiliateForCategory(category?: string) {
  const key = (category || '').toLowerCase();
  const targeted = affiliateTools.find((t) => t.categories?.some((c) => key.includes(c)));
  return targeted || affiliateTools[0];
}


