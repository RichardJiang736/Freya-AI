import fs from 'fs';
import path from 'path';

export const POSITIVE_EMOTIONS_DESC = [
  'Joy', 'Love', 'Devotion', 'Tender feelings', 'High spirits', 'Pride',
  'Patience', 'Affirmation', 'Surprise', 'Self-attention', 'Modesty',
  'Reflection', 'Meditation', 'Determination',
];

export const NEGATIVE_EMOTIONS_ASC = [
  'Suffering', 'Weeping', 'Low spirits', 'Anxiety', 'Fear', 'Grief',
  'Dejection', 'Despair', 'Anger', 'Hatred', 'Disdain', 'Contempt',
  'Disgust', 'Guilt', 'Helplessness', 'Ill-temper', 'Sulkiness',
];

const RANDOM_EMOTIONS = ['Negation', 'Shyness', 'Blushing'];

export function isPositive(emotion: string): boolean {
  return POSITIVE_EMOTIONS_DESC.some(
    (e) => e.toLowerCase() === emotion.toLowerCase()
  );
}

export function isNegative(emotion: string): boolean {
  return NEGATIVE_EMOTIONS_ASC.some(
    (e) => e.toLowerCase() === emotion.toLowerCase()
  );
}

export function getSortDirection(emotion: string): 'asc' | 'desc' | 'random' {
  if (isPositive(emotion)) return 'desc';
  if (isNegative(emotion)) return 'asc';
  return 'random';
}

export function refineEmotion(mainEmotion: string, emotionDetail: string): string {
  const combined = `${mainEmotion} ${emotionDetail}`.toLowerCase();

  const allEmotions = [
    ...POSITIVE_EMOTIONS_DESC,
    ...NEGATIVE_EMOTIONS_ASC,
    ...RANDOM_EMOTIONS,
  ];

  for (const emotion of allEmotions) {
    if (combined.includes(emotion.toLowerCase())) {
      return emotion;
    }
  }

  if (mainEmotion) {
    return mainEmotion.charAt(0).toUpperCase() + mainEmotion.slice(1);
  }

  return 'Joy';
}

export interface AudioFeatureWeights {
  valence: number;
  energy: number;
  danceability: number;
  tempo: number;
  loudness: number;
  liveness: number;
  instrumentalness: number;
  speechiness: number;
}

const HIGH_ENERGY_POSITIVE: AudioFeatureWeights = {
  valence: 0.28, energy: 0.28, danceability: 0.22, tempo: 0.08,
  loudness: 0.05, liveness: 0.04, instrumentalness: 0.03, speechiness: 0.02,
};

const CALM_POSITIVE: AudioFeatureWeights = {
  valence: 0.32, energy: 0.12, danceability: 0.08, tempo: 0.04,
  loudness: 0.03, liveness: 0.06, instrumentalness: 0.20, speechiness: 0.15,
};

const HIGH_ENERGY_NEGATIVE: AudioFeatureWeights = {
  valence: 0.10, energy: 0.32, danceability: 0.12, tempo: 0.18,
  loudness: 0.14, liveness: 0.06, instrumentalness: 0.05, speechiness: 0.03,
};

const LOW_ENERGY_NEGATIVE: AudioFeatureWeights = {
  valence: 0.18, energy: 0.06, danceability: 0.05, tempo: 0.04,
  loudness: 0.03, liveness: 0.12, instrumentalness: 0.28, speechiness: 0.24,
};

const NEUTRAL: AudioFeatureWeights = {
  valence: 0.25, energy: 0.20, danceability: 0.15, tempo: 0.12,
  loudness: 0.08, liveness: 0.08, instrumentalness: 0.07, speechiness: 0.05,
};

const PROFILE_MAP: Record<string, AudioFeatureWeights> = {};

function register(names: string[], profile: AudioFeatureWeights) {
  for (const n of names) PROFILE_MAP[n.toLowerCase()] = profile;
}

register(['Joy', 'High spirits', 'Pride', 'Affirmation', 'Surprise', 'Determination'], HIGH_ENERGY_POSITIVE);
register(['Love', 'Devotion', 'Tender feelings', 'Patience', 'Modesty', 'Reflection', 'Meditation'], CALM_POSITIVE);
register(['Anger', 'Hatred', 'Disdain', 'Contempt', 'Disgust', 'Ill-temper', 'Fear', 'Anxiety'], HIGH_ENERGY_NEGATIVE);
register(['Suffering', 'Weeping', 'Low spirits', 'Grief', 'Dejection', 'Despair', 'Guilt', 'Helplessness', 'Sulkiness'], LOW_ENERGY_NEGATIVE);
register(['Self-attention', 'Negation', 'Shyness', 'Blushing'], NEUTRAL);

export function getEmotionProfile(emotion: string): AudioFeatureWeights {
  return PROFILE_MAP[emotion.toLowerCase()] || NEUTRAL;
}

function normTempo(tempo: number): number {
  return Math.min(Math.max(tempo || 0, 0), 250) / 250;
}

function normLoudness(loudness: number): number {
  return Math.min(Math.max((loudness || -60) + 60, 0), 60) / 60;
}

export function calculateCompositeScore(
  track: Record<string, number>,
  weights?: AudioFeatureWeights
): number {
  const w = weights || NEUTRAL;
  return (
    (track.valence || 0) * w.valence +
    (track.energy || 0) * w.energy +
    (track.danceability || 0) * w.danceability +
    normTempo(track.tempo) * w.tempo +
    normLoudness(track.loudness) * w.loudness +
    (track.liveness || 0) * w.liveness +
    (track.instrumentalness || 0) * w.instrumentalness +
    (track.speechiness || 0) * w.speechiness
  );
}
