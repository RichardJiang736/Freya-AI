import { getSession, updateSessionCookie } from './auth';
import type { TrackDTO } from '@/src/types';

async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;

  const now = Math.floor(Date.now() / 1000);
  const isExpired = session.expiresAt - now < 120;

  if (!isExpired) return session.accessToken;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: session.refreshToken,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newSession = {
      ...session,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
      refreshToken: data.refresh_token || session.refreshToken,
    };

    await updateSessionCookie(newSession);
    return newSession.accessToken;
  } catch {
    return null;
  }
}

async function spotifyFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify API error: ${res.status} — ${text}`);
  }

  return res.json();
}

export async function getCurrentUser() {
  return spotifyFetch('/me');
}

export async function searchPlaylists(query: string, limit = 5) {
  const params = new URLSearchParams({ q: query, type: 'playlist', limit: String(limit) });
  return spotifyFetch(`/search?${params}`);
}

export async function getPlaylistTracks(playlistId: string) {
  return spotifyFetch(`/playlists/${playlistId}/tracks`);
}

export async function createPlaylist(userId: string, name: string): Promise<{ id: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, public: true }),
  });

  if (!res.ok) throw new Error('Failed to create playlist');
  return res.json();
}

export async function addTracksToPlaylist(playlistId: string, trackUris: string[]) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: trackUris }),
  });

  if (!res.ok) throw new Error('Failed to add tracks');
  return res.json();
}

