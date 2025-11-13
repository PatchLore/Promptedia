import { getImageUrl } from './getImageUrl';

/**
 * Default OpenGraph image URL
 * Should be uploaded to Supabase Storage branding bucket
 * Set via NEXT_PUBLIC_DEFAULT_OG_IMAGE environment variable
 */
export const DEFAULT_OG_IMAGE = process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE || getImageUrl();

