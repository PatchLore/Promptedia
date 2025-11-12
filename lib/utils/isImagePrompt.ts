/**
 * Determines if a prompt is for images/art based on model, category, or tags.
 * Case-insensitive check for image-related keywords.
 * Only shows if *clearly* an art/image category or model.
 */
export function isImagePrompt(model?: string | null, category?: string | null, tags?: string[] | null): boolean {
  const text = [model, category, ...(tags || [])].filter(Boolean).join(' ').toLowerCase();
  // Only show if *clearly* an art/image category or model
  return /(image|art|illustration|visual|graphics|design|photo|painting|t2i|render)/.test(text);
}

