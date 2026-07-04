import { getAllGenres } from './genres';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[^a-z0-9&\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchGenre(llmGenre: string, allGenres: string[]): string | null {
  const needle = normalize(llmGenre);
  if (!needle) return null;

  // Tier 1: exact match after normalization
  for (const g of allGenres) {
    if (normalize(g) === needle) return g;
  }

  // Tier 2: bidirectional contains
  for (const g of allGenres) {
    const gn = normalize(g);
    if (gn.includes(needle) || needle.includes(gn)) return g;
  }

  // Tier 3: word-overlap (Jaccard >= 0.5)
  const needleWords = new Set(needle.split(' ').filter(Boolean));
  let bestMatch: string | null = null;
  let bestScore = 0;
  for (const g of allGenres) {
    const gn = normalize(g);
    const genreWords = new Set(gn.split(' ').filter(Boolean));
    const intersection = [...needleWords].filter((w) => genreWords.has(w)).length;
    const union = new Set([...needleWords, ...genreWords]).size;
    const score = union > 0 ? intersection / union : 0;
    if (score >= 0.5 && score > bestScore) {
      bestScore = score;
      bestMatch = g;
    }
  }
  return bestMatch;
}

export function matchGenres(
  llmGenres: string[],
  count: number,
  exclude: string[] = []
): string[] {
  const allGenres = getAllGenres();
  const excludeSet = new Set(exclude.map((g) => normalize(g)));
  const result: string[] = [];

  for (const llmGenre of llmGenres) {
    const matched = matchGenre(llmGenre, allGenres);
    if (!matched) continue;
    if (excludeSet.has(normalize(matched))) continue;
    if (result.some((r) => normalize(r) === normalize(matched))) continue;
    result.push(matched);
    if (result.length >= count) break;
  }

  return result;
}

const SAFE_FALLBACK_GENRES = [
  'Pop', 'Rock', 'Folk', 'Indie Pop', 'Indie Rock', 'Alternative Rock',
  'Soul', 'R&B', 'Jazz', 'Blues', 'Classical', 'Ambient', 'Electronic',
  'Dance Pop', 'Acoustic', 'Singer-Songwriter', 'Indie Folk', 'Hip Hop',
  'Country', 'Reggae', 'Latin', 'World', 'New Age', 'Funk', 'Disco',
  'Post-Rock', 'Dream Pop', 'Chillwave', 'Lo-Fi', 'Synthpop',
];

export function getSafeFallbackGenres(): string[] {
  return [...SAFE_FALLBACK_GENRES];
}
