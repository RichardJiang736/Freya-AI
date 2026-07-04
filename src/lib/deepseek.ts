import OpenAI from 'openai';
import { refineEmotion, POSITIVE_EMOTIONS_DESC, NEGATIVE_EMOTIONS_ASC } from './emotions';

function getClient(): OpenAI | null {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ baseURL: 'https://api.deepseek.com', apiKey });
}

export async function suggestGenresForEmotion(
  emotion: string,
  excludeGenres: string[] = []
): Promise<string[]> {
  const client = getClient();
  if (!client) return [];

  let excludeClause = '';
  if (excludeGenres.length > 0) {
    excludeClause = ` Do NOT include these genres: ${excludeGenres.join(', ')}. Suggest alternatives instead.`;
  }

  try {
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a music recommendation expert. Given an emotion, suggest 10 Spotify-recognized music genres that best match that emotional state. Return ONLY a JSON array of genre names (e.g., ["Pop", "Indie Folk", "Ambient"]). Do not include any other text or explanation.${excludeClause}`,
        },
        {
          role: 'user',
          content: `Suggest genres for the emotion: "${emotion}"`,
        },
      ],
      model: 'deepseek-v4-flash',
      temperature: 0.7,
      stream: false,
    } as any);

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return [];

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return [];

    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((g): g is string => typeof g === 'string');
  } catch {
    return [];
  }
}

export async function analyzeEmotion(
  mainEmotion: string,
  emotionDetail: string
): Promise<string> {
  const client = getClient();
  if (!client) return refineEmotion(mainEmotion, emotionDetail);

  const taxonomy = [
    ...POSITIVE_EMOTIONS_DESC,
    ...NEGATIVE_EMOTIONS_ASC,
    'Negation', 'Shyness', 'Blushing',
  ].join(', ');

  try {
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an emotion classification assistant. Given a user's description of their emotional state, classify it into exactly one emotion from this taxonomy: ${taxonomy}. Return ONLY the emotion name, nothing else.`,
        },
        {
          role: 'user',
          content: `Main emotion: ${mainEmotion}. Details: ${emotionDetail}`,
        },
      ],
      // DeepSeek-specific params: thinking + reasoning_effort
      ...({
        model: 'deepseek-v4-flash',
        thinking: { type: 'enabled' },
        reasoning_effort: 'high',
        stream: false,
      } as any),
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return refineEmotion(mainEmotion, emotionDetail);

    const all = [
      ...POSITIVE_EMOTIONS_DESC,
      ...NEGATIVE_EMOTIONS_ASC,
      'Negation', 'Shyness', 'Blushing',
    ];

    for (const emotion of all) {
      if (raw.toLowerCase().includes(emotion.toLowerCase())) {
        return emotion;
      }
    }

    return raw;
  } catch {
    return refineEmotion(mainEmotion, emotionDetail);
  }
}
