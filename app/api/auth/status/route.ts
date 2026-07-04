import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import { db } from '@/src/lib/db';
import { userGenres } from '@/src/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }

  let hasGenres = false;
  try {
    const rows = db
      .select({ genre: userGenres.genre })
      .from(userGenres)
      .where(eq(userGenres.userId, session.userId))
      .all();
    hasGenres = rows.length > 0;
  } catch { /* DB might be fresh */ }

  return NextResponse.json({
    isAuthenticated: true,
    hasGenres,
    user: {
      display_name: session.displayName,
      user_id: session.userId,
    },
  });
}
