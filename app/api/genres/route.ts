import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { userGenres } from '@/src/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const rows = db
      .select({ genre: userGenres.genre })
      .from(userGenres)
      .where(eq(userGenres.userId, session.userId))
      .all();

    return NextResponse.json({ genres: rows.map((r) => r.genre) });
  } catch {
    return NextResponse.json({ genres: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { genres } = await req.json();

    db.delete(userGenres)
      .where(eq(userGenres.userId, session.userId))
      .run();

    if (Array.isArray(genres)) {
      for (const genre of genres) {
        db.insert(userGenres).values({ userId: session.userId, genre }).run();
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save genres' }, { status: 500 });
  }
}
