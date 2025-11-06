export type PromptPack = {
  slug: string;
  title: string;
  summary: string;
  price: string;
  url: string; // Gumroad/Payhip
};

const envOrDefault = (key: string, fallback: string) =>
  process.env[key] && process.env[key] !== '' ? (process.env[key] as string) : fallback;

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


