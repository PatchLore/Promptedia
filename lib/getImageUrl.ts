/**
 * Get image URL with fallback placeholder
 * @param url - Image URL from Supabase Storage or external source
 * @returns Image URL or fallback placeholder
 */
export function getImageUrl(url?: string | null): string {
  if (url && url.trim().length > 0) {
    return url.trim();
  }
  return 'https://placehold.co/600x400?text=Image';
}

