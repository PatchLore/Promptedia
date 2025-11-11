import Fuse from 'fuse.js';

export type PromptDocument = {
  id?: string;
  slug?: string;
  title?: string | null;
  description?: string | null;
  prompt?: string | null;
  tags?: string[] | null;
  category?: string | null;
  favorite_count?: number | null;
  saves_count?: number | null;
  views?: number | null;
  audio_play_count?: number | null;
};

type RankOptions = {
  limit?: number;
  threshold?: number;
  trendingBoost?: boolean;
};

const DEFAULT_OPTIONS: Required<RankOptions> = {
  limit: 20,
  threshold: 0.55,
  trendingBoost: true,
};

function sanitizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function computeTrendingScore(prompt: PromptDocument): number {
  const saves = Number(prompt.saves_count) || 0;
  const views = Number(prompt.views) || 0;
  const audio = Number(prompt.audio_play_count) || 0;

  return saves * 3 + views * 0.5 + audio * 2;
}

export function sortByTrending<T extends PromptDocument>(prompts: T[]): T[] {
  return [...prompts].sort((a, b) => computeTrendingScore(b) - computeTrendingScore(a));
}

function buildFuse(prompts: PromptDocument[]) {
  return new Fuse(prompts, {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'description', weight: 0.3 },
      { name: 'tags', weight: 0.15 },
      { name: 'category', weight: 0.05 },
    ],
    includeScore: true,
    minMatchCharLength: 2,
    threshold: 0.4,
    ignoreLocation: true,
    useExtendedSearch: false,
    shouldSort: false,
  });
}

function applyTrendingBoost(score: number, doc: PromptDocument) {
  if (!doc || typeof doc.favorite_count !== 'number') {
    return score;
  }

  const boost = Math.log10(Math.max(1, doc.favorite_count + 1)) * 0.08;
  return score + boost;
}

export function rankPrompts<T extends PromptDocument>(
  prompts: T[],
  rawQuery: string,
  options: RankOptions = {},
): T[] {
  const query = sanitizeQuery(rawQuery);
  if (query.length < 2) {
    return [];
  }

  const { limit, threshold, trendingBoost } = { ...DEFAULT_OPTIONS, ...options };

  const fuse = buildFuse(prompts);
  const results = fuse.search(query, { limit });

  const ranked = results
    .filter((result) => typeof result.score === 'number')
    .map((result) => {
      const doc = result.item;
      const baseScore = 1 - (result.score ?? 1);
      const adjustedScore = trendingBoost ? applyTrendingBoost(baseScore, doc) : baseScore;
      return { item: doc, score: adjustedScore, rawScore: result.score ?? 1 };
    })
    .filter((result) => 1 - (result.rawScore ?? 1) >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked.map((entry) => entry.item as T);
}


