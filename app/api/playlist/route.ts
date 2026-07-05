import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';
import {
  searchPlaylists,
  getPlaylistTracks,
  createPlaylist,
  addTracksToPlaylist,
  getCurrentUser,
} from '@/src/lib/spotify';
import { fetchAudioFeaturesBatch } from '@/src/lib/audio-features';
import { cacheSet } from '@/src/lib/cache';
import {
  calculateCompositeScore,
  getSortDirection,
  getEmotionProfile,
} from '@/src/lib/emotions';
import { getAllGenres } from '@/src/lib/genres';
import { matchAllGenres, getSafeFallbackGenres } from '@/src/lib/genre-matcher';
import { loadGenreMemory, saveGenreMemory } from '@/src/lib/genre-memory';
import { suggestGenresForEmotion } from '@/src/lib/deepseek';
import { db } from '@/src/lib/db';
import { userGenres } from '@/src/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { TrackDTO } from '@/src/types';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let emotion: string;
  let excludeGenres: string[] = [];
  try {
    const body = await req.json();
    emotion = body.emotion;
    excludeGenres = body.excludeGenres || [];
  } catch {
    return NextResponse.json({ error: 'emotion required' }, { status: 400 });
  }

  if (!emotion) {
    return NextResponse.json({ error: 'emotion required' }, { status: 400 });
  }

  emotion = emotion.charAt(0).toUpperCase() + emotion.slice(1);

  try {
    const allGenres = getAllGenres();
    if (!allGenres.length) {
      return NextResponse.json({ error: 'No genres found' }, { status: 500 });
    }

    let userGenreList: string[] = [];
    try {
      const rows = db.select({ genre: userGenres.genre }).from(userGenres).where(eq(userGenres.userId, session.userId)).all();
      userGenreList = rows.map((r) => r.genre);
    } catch { /* DB might be fresh */ }

    if (userGenreList.length > 2) {
      userGenreList = shuffle(userGenreList).slice(0, 2);
    }

    // Load genre memory for this user + emotion
    const memory = loadGenreMemory(session.userId, emotion);
    const accumulatedExclude = [...new Set([...memory.used, ...excludeGenres])];

    // Step A: Pull from memory.unused first — genres DeepSeek previously
    // approved but we didn't have room for in earlier runs
    const fromMemory: string[] = [];
    const availableUnused = memory.unused.filter(
      (g) => !userGenreList.includes(g) && !excludeGenres.includes(g)
    );
    const memoryTake = Math.min(5 - userGenreList.length, availableUnused.length);
    for (let i = 0; i < memoryTake; i++) {
      fromMemory.push(availableUnused[i]);
    }
    memory.unused = memory.unused.filter((g) => !fromMemory.includes(g));

    // Step B: If still short, call DeepSeek for fresh suggestions
    let matchedLLM: string[] = [];
    const remainingNeed = 5 - userGenreList.length - fromMemory.length;
    if (remainingNeed > 0) {
      const llmSuggested = await suggestGenresForEmotion(emotion, accumulatedExclude);
      const allMatched = matchAllGenres(llmSuggested, [
        ...accumulatedExclude,
        ...userGenreList,
        ...fromMemory,
      ]);

      matchedLLM = allMatched.slice(0, remainingNeed);

      // Save matched-but-unselected to memory.unused for future regenerations
      const unselected = allMatched.slice(remainingNeed);
      for (const g of unselected) {
        if (!memory.unused.includes(g)) {
          memory.unused.push(g);
        }
      }
    }

    // Step C: Safe fallbacks
    const need = 5 - userGenreList.length - fromMemory.length - matchedLLM.length;
    let safeFill: string[] = [];
    if (need > 0) {
      const safePool = getSafeFallbackGenres().filter(
        (g) =>
          !userGenreList.includes(g) &&
          !fromMemory.includes(g) &&
          !matchedLLM.includes(g) &&
          !excludeGenres.includes(g)
      );
      safeFill = shuffle(safePool).slice(0, need);
    }

    // Accumulate used genres into memory so DeepSeek avoids them next time.
    // Keep only the most recent 15 to prevent the exclude list from growing
    // unbounded, which would starve the pipeline of viable genres.
    for (const g of [...fromMemory, ...matchedLLM]) {
      if (!memory.used.includes(g)) {
        memory.used.push(g);
      }
    }
    if (memory.used.length > 15) {
      memory.used = memory.used.slice(memory.used.length - 15);
    }
    saveGenreMemory(session.userId, emotion, memory);

    const combinedGenres = [
      ...new Set([...userGenreList, ...fromMemory, ...matchedLLM, ...safeFill]),
    ];

    const perGenre = Math.ceil(20 / combinedGenres.length);
    let allTracksData: any[] = [];

    for (const genre of combinedGenres) {
      try {
        const query = `${emotion} ${genre}`;
        const results = await searchPlaylists(query, 5);
        const items = results?.playlists?.items;
        if (!items?.length) continue;

        const playlistId = items[0].id;
        const tracksRes = await getPlaylistTracks(playlistId);
        const allTracks = tracksRes?.items || [];

        let selected: any[];
        const sortDir = getSortDirection(emotion);
        if (sortDir === 'desc') {
          selected = allTracks
            .sort((a: any, b: any) => (b.track?.popularity || 0) - (a.track?.popularity || 0))
            .slice(0, perGenre);
        } else if (sortDir === 'asc') {
          selected = allTracks
            .sort((a: any, b: any) => (a.track?.popularity || 0) - (b.track?.popularity || 0))
            .slice(0, perGenre);
        } else {
          selected = shuffle([...allTracks]).slice(0, perGenre);
        }

        for (const item of selected) {
          const track = item.track;
          if (track?.id) allTracksData.push(track);
        }
      } catch { /* skip failed genres */ }
    }

    // Deduplicate by track ID — different genre searches may surface overlapping playlists
    const seen = new Set<string>();
    allTracksData = allTracksData.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    const trackIds = allTracksData.map((t) => t.id);
    const featuresDict = await fetchAudioFeaturesBatch(trackIds);

    const trackObjects: TrackDTO[] = [];
    for (const trackData of allTracksData) {
      const features = featuresDict[trackData.id] || {};
      const profile = getEmotionProfile(emotion);
      const score = features ? calculateCompositeScore(features, profile) : 0;

      trackObjects.push({
        spotifyId: trackData.id,
        title: trackData.name || '',
        artist: trackData.artists?.[0]?.name || '',
        album: trackData.album?.name || '',
        albumArtUrl: trackData.album?.images?.[0]?.url || '',
        score,
        emotion,
      });
    }

    const sortDir = getSortDirection(emotion);
    if (sortDir === 'desc') {
      trackObjects.sort((a, b) => b.score - a.score);
    } else if (sortDir === 'asc') {
      trackObjects.sort((a, b) => a.score - b.score);
    } else {
      shuffle(trackObjects);
    }

    const trackList = trackObjects.slice(0, 20);

    if (!trackList.length) {
      return NextResponse.json({ error: `No tracks found for emotion: ${emotion}` }, { status: 404 });
    }

    const user = await getCurrentUser();
    const playlist = await createPlaylist(user.id, `Your ${emotion} Playlist`);
    const trackUris = trackList.map((t) => `spotify:track:${t.spotifyId}`);
    await addTracksToPlaylist(playlist.id, trackUris);

    cacheSet(`playlist_genres_${playlist.id}`, combinedGenres, 600_000);

    return NextResponse.json({
      playlistId: playlist.id,
      tracks: trackList.map((t) => ({
        spotifyId: t.spotifyId,
        title: t.title,
        artist: t.artist,
        album: t.album,
        albumArtUrl: t.albumArtUrl || '',
        score: t.score,
      })),
      genres: combinedGenres,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 });
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
