import fs from 'fs';
import path from 'path';
import { cacheGet, cacheSet } from './cache';

let ALL_GENRES: string[] | null = null;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function loadGenres(): string[] {
  const cached = cacheGet<string[]>('all_genres');
  if (cached) return cached;

  if (ALL_GENRES) return ALL_GENRES;

  const genresPath = path.join(process.cwd(), 'data', 'GENRES.md');
  try {
    const content = fs.readFileSync(genresPath, 'utf-8');
    ALL_GENRES = content
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map(decodeEntities);
    cacheSet('all_genres', ALL_GENRES);
    return ALL_GENRES;
  } catch {
    return [];
  }
}

export function getAllGenres(): string[] {
  return loadGenres();
}
