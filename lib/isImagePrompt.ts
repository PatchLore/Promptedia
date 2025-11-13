export function isImagePrompt(model?: string | null, category?: string | null, tags?: string[] | null) {
  // Don't check model value itself - we're trying to conditionally hide it
  // Prioritize category as the primary indicator, tags as secondary
  const txt = [category, ...(tags || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /(image|art|illustration|visual|render|t2i|photo|picture|graphics|design)/.test(txt);
}

