type PromptLike = {
  title?: string | null;
  description?: string | null;
  prompt?: string | null;
  tags?: string[] | null;
  category?: string | null;
};

function normalize(value: string | null | undefined) {
  return (value ?? '').toLowerCase();
}

export function filterPrompts<T extends PromptLike>(prompts: T[], query: string): T[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return prompts;
  }

  return prompts.filter((prompt) => {
    const title = normalize(prompt.title);
    const description = normalize(prompt.description ?? prompt.prompt);
    const category = normalize(prompt.category);
    const tags = Array.isArray(prompt.tags) ? prompt.tags : [];

    if (title.includes(trimmed)) return true;
    if (description.includes(trimmed)) return true;
    if (category.includes(trimmed)) return true;
    return tags.some((tag) => normalize(tag).includes(trimmed));
  });
}


