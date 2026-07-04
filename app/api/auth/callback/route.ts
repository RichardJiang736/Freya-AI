import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { setSessionCookie } from '@/src/lib/auth';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/login?error=' + error, req.url));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get('spotify_auth_state')?.value;

  if (!state || state !== savedState) {
    return NextResponse.json({ error: 'State mismatch' }, { status: 403 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code' }, { status: 400 });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:8888/api/auth/callback';

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Spotify credentials not configured' }, { status: 500 });
  }

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

    let response = NextResponse.redirect(new URL('/?auth=success', req.url));
    response.cookies.set('spotify_auth_state', '', { maxAge: 0, path: '/' });
    response = await setSessionCookie(response, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Math.floor(Date.now() / 1000) + tokenData.expires_in,
      userId: userProfile.id,
      displayName: userProfile.display_name || 'Unknown User',
    });
    return response;
  } catch (e) {
    return NextResponse.json({ error: `Auth error: ${e}` }, { status: 500 });
  }
}
