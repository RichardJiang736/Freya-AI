import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
  'user-top-read',
].join(' ');

function sign(data: string): string {
  const secret = process.env.SESSION_SECRET || 'dev-secret-change-me-32chars!!';
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export async function GET(req: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'SPOTIFY_CLIENT_ID not set' }, { status: 500 });
  }

  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:8888/api/auth/callback';
  const originalHost = req.headers.get('host') || '127.0.0.1:8888';

  const nonce = crypto.randomUUID();
  const payload = JSON.stringify({ n: nonce, h: originalHost });
  const state = `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: redirectUri,
    state,
  });

  return NextResponse.redirect(`${SPOTIFY_AUTH_URL}?${params.toString()}`);
}
