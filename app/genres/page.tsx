'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/auth';

type Genre = {
  id: number;
  name: string;
  description: string;
};

export default function GenresPage() {
  const allGenres: Genre[] = [
    { id: 1, name: 'classical', description: 'timeless compositions for reflection and depth.' },
    { id: 2, name: 'jazz', description: 'smooth, improvisational rhythms for contemplation.' },
    { id: 3, name: 'rock', description: 'energetic, driving beats for catharsis and motivation.' },
    { id: 4, name: 'electronic', description: 'synthetic textures and pulses for focus and immersion.' },
    { id: 5, name: 'hip hop', description: 'rhythmic, lyrical flows for confidence and expression.' },
    { id: 6, name: 'pop', description: 'polished, melodic structures for uplift and connection.' },
    { id: 7, name: 'blues', description: 'soulful, raw melodies for introspection and release.' },
    { id: 8, name: 'country', description: 'narrative-driven songs for grounding and nostalgia.' },
    { id: 9, name: 'r&b', description: 'velvet vocals and groove for intimacy and warmth.' },
    { id: 10, name: 'folk', description: 'organic, acoustic storytelling for comfort and belonging.' },
  ];

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated, refreshAuth } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadUserGenres = async () => {
      try {
        const response = await fetch('/api/genres', { credentials: 'include' });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load genres');
        }

        setSelectedGenres(data.genres || []);
      } catch (err: any) {
        console.error('Error loading user genres:', err);
      }
    };

    loadUserGenres();
  }, [isAuthenticated]);

  const handleGenreToggle = (genreName: string) => {
    if (selectedGenres.includes(genreName)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genreName));
    } else {
      setSelectedGenres([...selectedGenres, genreName]);
    }
  };

  const handleSaveGenres = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/genres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ genres: selectedGenres }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save genres');
      }

      await refreshAuth();
      router.push('/nlp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-alabaster ambient-light">
        <div className="text-center">
          <div className="skeleton-breathing h-px w-48 mx-auto mb-8" />
          <p className="text-stone text-sm tracking-sanctuary font-light">
            preparing your sanctuary
          </p>
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
          <div className="text-center mb-16">
            <p className="text-xs tracking-sanctuary text-stone mb-4 font-light">
              curated palette
            </p>
            <h1 className="text-4xl md:text-5xl text-ink font-light mb-6">
              music genres
            </h1>
            <p className="text-stone max-w-2xl mx-auto leading-relaxed font-light">
              select your preferred genres. our intelligent randomization layer
              prevents taste cocooning by introducing measured diversity into
              every recommendation.
            </p>
          </div>

          {/* Selected genres bar */}
          <div className="card-glass rounded-lg p-6 md:p-8 mb-12">
            <p className="text-xs tracking-sanctuary text-stone mb-4 font-light">
              your palette
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedGenres.length > 0 ? (
                selectedGenres.map((genre) => (
                  <span
                    key={genre}
                    className="widget-glass rounded-full px-3 py-1.5 text-xs tracking-wide text-stone font-light border-l-2 border-l-sage-500/50"
                  >
                    {genre}
                  </span>
                ))
              ) : (
                <p className="text-stone text-sm font-light">no genres selected</p>
              )}
            </div>
            <button
              onClick={handleSaveGenres}
              disabled={isLoading}
              className="btn-accent-natural disabled:opacity-40"
            >
              {isLoading ? 'saving...' : 'save genres'}
            </button>
            {error && (
              <div className="mt-4 p-4 bg-red-100/60 text-red-700/80 text-sm tracking-wide rounded-lg font-light">
                {error}
              </div>
            )}
          </div>

          {/* Genre grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allGenres.map((genre) => {
              const isSelected = selectedGenres.includes(genre.name);
              return (
                <div key={genre.id} className="bg-woodslat rounded-lg">
                  <div
                    className={`card-glass rounded-lg p-8 transition-all duration-500 hover:scale-[1.02] ${
                      isSelected ? 'animate-sage-glow' : ''
                    }`}
                  >
                    <h3 className="text-2xl text-ink font-light mb-3">
                      {genre.name}
                    </h3>
                    <p className="text-stone text-sm leading-relaxed font-light mb-6">
                      {genre.description}
                    </p>
                    <button
                      onClick={() => handleGenreToggle(genre.name)}
                      className={
                        isSelected
                          ? 'btn-accent-natural !px-4 !py-2 !text-xs'
                          : 'btn-ghost-natural !px-4 !py-2 !text-xs'
                      }
                    >
                      {isSelected ? 'selected' : 'select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
