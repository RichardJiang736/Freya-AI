'use client';

import Navigation from '../../components/Navigation';
import Link from 'next/link';

type GenreData = {
  [key: string]: {
    name: string;
    description: string;
  };
};

export default function GenreDetailPage({ params }: { params: { id: string } }) {
  const genreData: GenreData = {
    '1': { name: 'classical', description: 'timeless compositions for reflection and depth.' },
    '2': { name: 'jazz', description: 'smooth, improvisational rhythms for contemplation.' },
    '3': { name: 'rock', description: 'energetic, driving beats for catharsis and motivation.' },
    '4': { name: 'electronic', description: 'synthetic textures and pulses for focus and immersion.' },
    '5': { name: 'hip hop', description: 'rhythmic, lyrical flows for confidence and expression.' },
    '6': { name: 'pop', description: 'polished, melodic structures for uplift and connection.' },
  };

  const genre = genreData[params.id] || {
    name: 'unknown genre',
    description: 'no description available',
  };

  return (
    <div className="min-h-screen bg-alabaster text-stone">
      <Navigation />

      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/genres"
            className="inline-flex items-center gap-2 text-xs tracking-airy font-light link-natural mb-10"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            back to genres
          </Link>

          <div className="mb-12">
            <p className="text-xs tracking-sanctuary text-stone mb-4 font-light">
              genre
            </p>
            <h1 className="text-5xl md:text-6xl text-ink font-light mb-6">
              {genre.name}
            </h1>
            <p className="text-stone text-lg leading-relaxed max-w-2xl font-light">
              {genre.description}
            </p>
          </div>

          <div className="card-glass rounded-lg p-8 md:p-12">
            <h2 className="text-2xl text-ink font-light mb-8">
              featured tracks
            </h2>

            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((track) => (
                <div
                  key={track}
                  className="widget-glass rounded-lg p-4 flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-oak rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-sage-500/60"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-base text-ink font-light">
                      track title {track}
                    </h3>
                    <p className="text-xs tracking-wide text-stone mt-0.5 font-light">
                      artist name
                    </p>
                  </div>
                  <button className="btn-ghost-natural !px-3 !py-1.5 !text-xs">
                    play
                  </button>
                </div>
              ))}
            </div>
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
