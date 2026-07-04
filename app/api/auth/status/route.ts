import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    isAuthenticated: true,
    user: {
      display_name: session.displayName,
      user_id: session.userId,
    },
  });
}
