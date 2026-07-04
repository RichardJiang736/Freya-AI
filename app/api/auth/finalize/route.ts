import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { setSessionCookie } from '@/src/lib/auth';

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'dev-secret-change-me-32chars!!'
);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing transfer token' }, { status: 400 });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);

    let response = NextResponse.redirect(new URL('/?auth=success', req.url));
    response = await setSessionCookie(response, {
      accessToken: payload.accessToken as string,
      refreshToken: payload.refreshToken as string,
      expiresAt: payload.expiresAt as number,
      userId: payload.userId as string,
      displayName: payload.displayName as string,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid or expired transfer token' }, { status: 403 });
  }
}
