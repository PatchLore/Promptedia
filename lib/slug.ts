const DIACRITIC_REGEX = /[\u0300-\u036f]/g;
const NON_ALNUM_REGEX = /[^a-z0-9]+/g;
const EDGE_HYPHEN_REGEX = /^-+|-+$/g;
const DUP_HYPHEN_REGEX = /-{2,}/g;

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyTitle(title: string): string {
  if (!title) {
    return '';
  }

  const normalized = title
    .toString()
    .normalize('NFKD')
    .replace(DIACRITIC_REGEX, '')
    .toLowerCase()
    .replace(NON_ALNUM_REGEX, '-')
    .replace(DUP_HYPHEN_REGEX, '-')
    .replace(EDGE_HYPHEN_REGEX, '')
    .trim();

  return normalized;
}

export function isValidSlug(value?: string | null): value is string {
  return typeof value === 'string' && value.length > 0 && SLUG_REGEX.test(value);
}

export function buildPromptPath(prompt: { id: string; slug?: string | null }): string {
  const candidate = prompt?.slug;
  return `/prompts/${isValidSlug(candidate) ? candidate : prompt.id}`;
}

export function buildPromptUrl(baseUrl: string, prompt: { id: string; slug?: string | null }): string {
  return `${baseUrl.replace(/\/$/, '')}${buildPromptPath(prompt)}`;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

