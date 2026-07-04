import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { SignJWT } from 'jose';

function sign(data: string): string {
  const secret = process.env.SESSION_SECRET || 'dev-secret-change-me-32chars!!';
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'dev-secret-change-me-32chars!!'
);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const rawState = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/login?error=' + error, req.url));
  }

  if (!rawState || !rawState.includes('.')) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 403 });
  }

  const dotIndex = rawState.lastIndexOf('.');
  const encodedPayload = rawState.substring(0, dotIndex);
  const signature = rawState.substring(dotIndex + 1);

  let rawPayload: string;
  try {
    rawPayload = Buffer.from(encodedPayload, 'base64url').toString();
  } catch {
    return NextResponse.json({ error: 'Invalid state payload' }, { status: 403 });
  }

  if (sign(rawPayload) !== signature) {
    return NextResponse.json({ error: 'State mismatch' }, { status: 403 });
  }

  let originalHost = '127.0.0.1:8888';
  try {
    const parsed = JSON.parse(rawPayload);
    if (parsed.h) originalHost = parsed.h;
  } catch { /* fallback to default */ }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code' }, { status: 400 });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Spotify credentials not configured' }, { status: 500 });
  }

  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:8888/api/auth/callback';

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      return NextResponse.json({ error: `Token exchange failed: ${err}` }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();

    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    const userProfile = await userResponse.json();

    const sessionPayload = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Math.floor(Date.now() / 1000) + tokenData.expires_in,
      userId: userProfile.id,
      displayName: userProfile.display_name || 'Unknown User',
    };

    const transferToken = await new SignJWT({ ...sessionPayload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30s')
      .sign(SECRET);

    const protocol = originalHost.startsWith('localhost') || originalHost.startsWith('127.') ? 'http' : 'https';
    const finalizeUrl = `${protocol}://${originalHost}/api/auth/finalize?token=${encodeURIComponent(transferToken)}`;

    return NextResponse.redirect(finalizeUrl);
  } catch (e) {
    return NextResponse.json({ error: `Auth error: ${e}` }, { status: 500 });
  }
}
