import { cacheGet, cacheSet } from './cache';

const AUDIO_FEATURES_URL = 'https://api.reccobeats.com/v1/audio-features';

export async function fetchAudioFeaturesBatch(
  trackIds: string[]
): Promise<Record<string, Record<string, number>>> {
  const result: Record<string, Record<string, number>> = {};
  const uncached: string[] = [];

  for (const id of trackIds) {
    const cached = cacheGet<Record<string, number>>(`audio_${id}`);
    if (cached) {
      result[id] = cached;
    } else {
      uncached.push(id);
    }
  }

  if (uncached.length === 0) return result;

  const BATCH = 50;
  for (let i = 0; i < uncached.length; i += BATCH) {
    const batch = uncached.slice(i, i + BATCH);
    try {
      const params = new URLSearchParams({ ids: batch.join(',') });
      const res = await fetch(`${AUDIO_FEATURES_URL}?${params}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const features = data.content;
      if (!Array.isArray(features)) continue;

      for (const feature of features) {
        if (feature?.id) {
          result[feature.id] = feature;
          cacheSet(`audio_${feature.id}`, feature);
        }
      }
    } catch {
      for (const id of batch) {
        result[id] = {};
      }
    }
  }

  return result;
}
