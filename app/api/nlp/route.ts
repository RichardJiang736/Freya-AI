import { NextRequest, NextResponse } from 'next/server';
import { analyzeEmotion } from '@/src/lib/deepseek';

export async function POST(req: NextRequest) {
  try {
    const { mainEmotion, emotionDetail } = await req.json();
    const refinedEmotion = await analyzeEmotion(mainEmotion || '', emotionDetail || '');
    return NextResponse.json({ refinedEmotion });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
