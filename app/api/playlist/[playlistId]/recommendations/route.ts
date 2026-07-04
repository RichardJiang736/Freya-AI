import { NextRequest, NextResponse } from 'next/server';
import { getPlaylistTracks, getEmbeddedTrackCode } from '@/src/lib/spotify';
import { fetchAudioFeaturesBatch } from '@/src/lib/audio-features';
import { calculateCompositeScore, getSortDirection, getEmotionProfile } from '@/src/lib/emotions';
import { cacheGet } from '@/src/lib/cache';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  const { playlistId } = await params;
  const emotion = req.nextUrl.searchParams.get('emotion') || 'Joy';

  try {
    const data = await getPlaylistTracks(playlistId);
    const items = data?.items || [];

    const tracksData = items
      .map((item: any) => item?.track)
      .filter((t: any) => t?.id);

    const trackIds = tracksData.map((t: any) => t.id);
    const featuresDict = await fetchAudioFeaturesBatch(trackIds);

    const profile = getEmotionProfile(emotion);

    const tracks = tracksData.map((t: any) => ({
      id: t.id,
      title: t.name || '',
      artist: t.artists?.[0]?.name || '',
      album: t.album?.name || '',
      score: calculateCompositeScore(featuresDict[t.id] || {}, profile),
      embedded_track_code: getEmbeddedTrackCode(t.id),
    }));

    const sortDir = getSortDirection(emotion);
    if (sortDir === 'desc') {
      tracks.sort((a: any, b: any) => b.score - a.score);
    } else if (sortDir === 'asc') {
      tracks.sort((a: any, b: any) => a.score - b.score);
    }

    const genres = cacheGet<string[]>(`playlist_genres_${playlistId}`) || [];

    return NextResponse.json({ top_tracks: tracks.slice(0, 5), genres });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
