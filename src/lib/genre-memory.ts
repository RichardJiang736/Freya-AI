import { cacheGet, cacheSet } from './cache';

export interface GenreMemory {
  used: string[];
  unused: string[];
}

const TTL = 30 * 60 * 1000; // 30 minutes

function key(userId: string, emotion: string): string {
  return `genre_memory:${userId}:${emotion}`;
}

export function loadGenreMemory(userId: string, emotion: string): GenreMemory {
  const stored = cacheGet<GenreMemory>(key(userId, emotion));
  return stored ?? { used: [], unused: [] };
}

export function saveGenreMemory(
  userId: string,
  emotion: string,
  memory: GenreMemory
): void {
  cacheSet(key(userId, emotion), memory, TTL);
}
