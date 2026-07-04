'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/auth';

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const playlistId = searchParams.get('playlistId');
  const emotion = searchParams.get('emotion') || '';

  const [playlistEmbed, setPlaylistEmbed] = useState('');
  const [topTracks, setTopTracks] = useState<string[]>([]);
  const [usedGenres, setUsedGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !playlistId) return;

    const fetchData = async () => {
      try {
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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
        setIsRegenerating(false);
      }
    };

    fetchData();
  }, [isAuthenticated, playlistId, emotion]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setIsLoading(true);
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
      router.push(`/recommendations?playlistId=${data.playlistId}&emotion=${encodeURIComponent(emotion)}`);
    } catch (err: any) {
      setError(err.message);
      setIsRegenerating(false);
    }
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center bg-gradient-to-b from-fresh-green-50 to-sky-blue">
          <div className="text-2xl text-fresh-green-800">Loading your personalized playlist...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center bg-gradient-to-b from-fresh-green-50 to-sky-blue">
          <div className="text-2xl text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-grow py-16 px-6 bg-gradient-to-b from-fresh-green-50 to-sky-blue">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-4 text-center text-fresh-green-800">
            {emotion ? `Your ${emotion} Playlist` : 'Your Personalized Playlist'}
          </h1>

          <div className="text-center mb-8">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="bg-white border-2 border-fresh-purple-500 text-fresh-purple-600 hover:bg-fresh-purple-50 font-bold py-2 px-6 rounded-lg transition duration-300 disabled:opacity-50"
            >
              {isRegenerating ? 'Generating...' : 'Regenerate Playlist'}
            </button>
            {usedGenres.length > 0 && (
              <p className="text-sm text-fresh-green-600 mt-2">
                Current genres: {usedGenres.join(', ')}
              </p>
            )}
          </div>

          {playlistEmbed && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-fresh-green-800">Full Playlist</h2>
              <div className="bg-white rounded-xl shadow-lg p-4 border border-fresh-green-100">
                <div dangerouslySetInnerHTML={{ __html: playlistEmbed }} />
              </div>
            </div>
          )}

          {topTracks.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-fresh-green-800">Top Recommended Tracks</h2>
              <div className="space-y-4">
                {topTracks.map((track, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-4 border border-fresh-green-100">
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

      <footer className="bg-fresh-green-900 text-white py-8 px-6">
        <div className="container mx-auto text-center">
          <p className="text-fresh-green-200">&copy; 2025 FreyaAI, All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <div className="flex-grow flex items-center justify-center bg-gradient-to-b from-fresh-green-50 to-sky-blue">
            <div className="text-2xl text-fresh-green-800">Loading...</div>
          </div>
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}
