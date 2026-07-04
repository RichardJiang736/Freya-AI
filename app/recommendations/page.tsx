'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/auth';

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const playlistId = searchParams.get('playlistId');
  const emotion = searchParams.get('emotion') || '';
  const excludeGenresParam = searchParams.get('excludeGenres') || '';

  const [playlistEmbed, setPlaylistEmbed] = useState('');
  const [topTracks, setTopTracks] = useState<string[]>([]);
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

          setPlaylistEmbed(
            `<iframe src="https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator" width="100%" height="808" frameborder="0" allowtransparency="true" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`
          );

          setTopTracks(
            data.top_tracks?.map(
              (t: { embedded_track_code: string }) => t.embedded_track_code
            ) || []
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

          setPlaylistEmbed(
            `<iframe src="https://open.spotify.com/embed/playlist/${data.playlistId}?utm_source=generator" width="100%" height="808" frameborder="0" allowtransparency="true" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`
          );

          setTopTracks(data.top_tracks_embedded || []);
          setUsedGenres(data.genres || []);

          router.replace(
            `/recommendations?playlistId=${data.playlistId}&emotion=${encodeURIComponent(emotion)}`
          );
        }
        hasLoaded.current = true;
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

      setPlaylistEmbed(
        `<iframe src="https://open.spotify.com/embed/playlist/${data.playlistId}?utm_source=generator" width="100%" height="808" frameborder="0" allowtransparency="true" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`
      );
      setTopTracks(data.top_tracks_embedded || []);
      setUsedGenres(data.genres || []);

      router.replace(
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

  return (
    <div className="min-h-screen bg-alabaster text-stone">
      <Navigation />

      <div className="pt-24 pb-16 px-6 ambient-light">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
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

          {/* Spotify embed */}
          {playlistEmbed && (
            <div className="mb-16">
              <h2 className="text-2xl text-ink font-light mb-6">
                full playlist
              </h2>
              <div className="card-glass rounded-lg p-4 md:p-6">
                <div dangerouslySetInnerHTML={{ __html: playlistEmbed }} />
              </div>
            </div>
          )}

          {/* Top tracks */}
          {topTracks.length > 0 && (
            <div>
              <h2 className="text-2xl text-ink font-light mb-6">
                top tracks
              </h2>
              <div className="space-y-4">
                {topTracks.map((track, index) => (
                  <div
                    key={index}
                    className="widget-glass rounded-lg p-4"
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: track
                          .replace('height="380"', 'height="152"')
                          .replace('width="300"', 'width="100%"'),
                      }}
                    />
                  </div>
                ))}
              </div>
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
