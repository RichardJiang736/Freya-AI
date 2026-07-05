'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/auth';

interface Track {
  spotifyId: string;
  title: string;
  artist: string;
  album: string;
  albumArtUrl: string;
  score: number;
}

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const playlistId = searchParams.get('playlistId');
  const emotion = searchParams.get('emotion') || '';
  const excludeGenresParam = searchParams.get('excludeGenres') || '';

  const [currentPlaylistId, setCurrentPlaylistId] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [usedGenres, setUsedGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!playlistId && !emotion) return;
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const excludedGenres = excludeGenresParam
      ? excludeGenresParam.split(',').filter(Boolean)
      : [];

    const fetchData = async () => {
      try {
        if (playlistId) {
          const res = await fetch(
            `/api/playlist/${playlistId}/recommendations?emotion=${encodeURIComponent(emotion)}`,
            { credentials: 'include' }
          );

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to load recommendations');
          }

          const data = await res.json();

          setCurrentPlaylistId(playlistId);
          setTracks(
            (data.tracks || []).map((t: any) => ({
              spotifyId: t.id,
              title: t.title,
              artist: t.artist,
              album: t.album,
              albumArtUrl: t.albumArtUrl || '',
              score: t.score,
            }))
          );
          setUsedGenres(data.genres || []);
        } else {
          const res = await fetch('/api/playlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ emotion, excludeGenres: excludedGenres }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Failed to create playlist');
          }

          setCurrentPlaylistId(data.playlistId);
          setTracks(data.tracks || []);
          setUsedGenres(data.genres || []);

          window.history.replaceState(
            null,
            '',
            `/recommendations?playlistId=${data.playlistId}&emotion=${encodeURIComponent(emotion)}`
          );
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
        setIsRegenerating(false);
      }
    };

    fetchData();
  }, [isAuthenticated, playlistId, emotion, excludeGenresParam]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError('');
    try {
      const res = await fetch('/api/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ emotion, excludeGenres: usedGenres }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to regenerate');

      setCurrentPlaylistId(data.playlistId);
      setTracks(data.tracks || []);
      setUsedGenres(data.genres || []);

      window.history.replaceState(
        null,
        '',
        `/recommendations?playlistId=${data.playlistId}&emotion=${encodeURIComponent(emotion)}`
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-alabaster">
        <Navigation />
        <div className="pt-24 flex items-center justify-center ambient-light min-h-screen">
          <div className="text-center">
            <div className="skeleton-breathing h-px w-64 mx-auto mb-8" />
            <p className="text-stone text-sm tracking-sanctuary font-light">
              assembling your playlist...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-alabaster">
        <Navigation />
        <div className="pt-24 flex items-center justify-center ambient-light min-h-screen">
          <div className="widget-glass rounded-lg p-10 text-center max-w-lg mx-auto">
            <p className="text-red-700/80 text-sm tracking-wide font-light">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const spotifyPlaylistUrl = currentPlaylistId
    ? `https://open.spotify.com/playlist/${currentPlaylistId}`
    : '';

  return (
    <div className="min-h-screen bg-alabaster text-stone">
      <Navigation />

      <div className="pt-24 pb-16 px-6 ambient-light">
        <div className="container mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl text-ink font-light mb-6">
              {emotion ? `your ${emotion} curation` : 'your personalized curation'}
            </h1>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="btn-ghost-natural disabled:opacity-40"
              >
                {isRegenerating ? 'generating...' : 'regenerate playlist'}
              </button>

              {spotifyPlaylistUrl && (
                <a
                  href={spotifyPlaylistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-natural text-xs tracking-wide"
                >
                  listen on spotify &rarr;
                </a>
              )}

              {usedGenres.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {usedGenres.map((genre) => (
                    <span
                      key={genre}
                      className="widget-glass rounded-full px-3 py-1.5 text-xs tracking-wide text-stone font-light border-l-2 border-l-sage-500/40"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Track List */}
          {tracks.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-sage-500/25 to-transparent" />
                <h2 className="text-sm tracking-sanctuary text-stone font-light uppercase">
                  your playlist
                </h2>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-sage-500/25 to-transparent" />
              </div>

              <div className="space-y-2.5">
                {tracks.map((track, index) => (
                  <a
                    key={track.spotifyId}
                    href={`https://open.spotify.com/track/${track.spotifyId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="track-card block no-underline"
                  >
                    <span className="track-card-index">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>

                    {track.albumArtUrl ? (
                      <img
                        src={track.albumArtUrl}
                        alt={track.album}
                        className="track-card-art"
                        loading="lazy"
                      />
                    ) : (
                      <div className="track-card-art bg-oak flex items-center justify-center">
                        <span className="text-stone/30 text-xs">&#9834;</span>
                      </div>
                    )}

                    <div className="track-card-info">
                      <div className="track-card-title">{track.title}</div>
                      <div className="track-card-artist">{track.artist}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {tracks.length === 0 && (
            <div className="text-center py-20">
              <p className="text-stone text-sm tracking-wide font-light">
                no tracks found for this emotion
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-sand py-12 px-6">
        <div className="section-divider-natural mb-12" />
        <div className="container mx-auto text-center">
          <p className="text-xs tracking-wide text-stone font-light">
            &copy; {new Date().getFullYear()} freya
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-alabaster">
          <Navigation />
          <div className="pt-24 flex items-center justify-center ambient-light min-h-screen">
            <div className="text-center">
              <div className="skeleton-breathing h-px w-48 mx-auto mb-8" />
              <p className="text-stone text-sm tracking-sanctuary font-light">
                loading...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}
