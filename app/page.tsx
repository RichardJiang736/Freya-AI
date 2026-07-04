'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from './components/Navigation';
import Link from 'next/link';
import { useAuth } from './context/auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, hasGenres } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || isLoading) {
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
    <div className="min-h-screen bg-alabaster text-charcoal">
      <Navigation />

      {/* ================================================================
          Hero Canvas
          ================================================================ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-alabaster">
        {/* Ambient wash */}
        <div className="absolute inset-0 ambient-light animate-breathe" />

        {/* Wood-slat texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-woodslat" />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-8xl tracking-sanctuary text-ink font-extralight mb-10 animate-emerge">
            freya
          </h1>
          <p className="text-sm tracking-sanctuary text-sage-600 font-light mb-16 animate-emerge">
            emotion-driven music curation
          </p>
          <button
            onClick={() => {
              if (isAuthenticated) {
                router.push(hasGenres ? '/nlp' : '/genres');
              } else {
                router.push('/login');
              }
            }}
            className="btn-accent-natural animate-emerge"
          >
            begin your journey
          </button>
        </div>

        {/* Scroll-down indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-float-up">
          <svg
            className="w-4 h-7 text-stone/30"
            viewBox="0 0 20 32"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
          >
            <rect x="1" y="1" width="18" height="30" rx="9" />
            <line x1="10" y1="8" x2="10" y2="14" strokeWidth={1.5} />
          </svg>
        </div>
      </section>

      {/* ================================================================
          The Engine
          ================================================================ */}
      <section className="relative py-32 px-6 ambient-light">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-20 text-center">
            <p className="text-xs tracking-sanctuary text-sage-600 mb-6 font-light">
              the engine
            </p>
            <h2 className="text-3xl md:text-4xl text-ink font-light mb-8">
              curated by emotion
            </h2>
            <p className="text-stone max-w-2xl mx-auto leading-relaxed font-light">
              Describe how you feel. Our AI analyzes your emotional state through
              Darwin&apos;s taxonomy of emotions and maps it to a personalized
              musical landscape — curated in real time from Spotify&apos;s
              catalog.
            </p>
          </div>

          {/* Quick-start card — wood-slat underneath glass */}
          <div className="bg-woodslat rounded-lg">
            <div className="card-glass rounded-lg p-12 md:p-16">
              <div className="text-center">
                <p className="text-sm tracking-sanctuary text-stone mb-8 font-light">
                  begin your session
                </p>
                <button
                  onClick={() => router.push('/nlp')}
                  className="btn-accent-natural"
                >
                  analyze your emotion
                </button>
                <p className="text-xs text-stone mt-10 tracking-airy font-light">
                  or explore{' '}
                  <Link href="/genres" className="link-natural">
                    genre preferences
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          Concept & Science
          ================================================================ */}
      <section className="py-32 px-6 bg-alabaster">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-20 text-center">
            <p className="text-xs tracking-sanctuary text-sage-600 mb-6 font-light">
              concept &amp; science
            </p>
            <h2 className="text-3xl md:text-4xl text-ink font-light">
              beyond simple moods
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Darwin's Taxonomy */}
            <div className="card-glass rounded-lg p-12 md:p-16">
              <p className="text-xs tracking-sanctuary text-stone mb-8 font-light">
                foundation
              </p>
              <h3 className="text-2xl text-ink font-light mb-8">
                Darwin&apos;s emotional taxonomy
              </h3>
              <p className="text-stone leading-relaxed font-light mb-8">
                Freya AI is built on Charles Darwin&apos;s foundational work
                on emotional expression — 33 discrete emotions spanning joy,
                melancholy, awe, and everything in between. Unlike simple
                valence-arousal models, this taxonomy captures the nuance
                of how humans actually experience feeling.
              </p>
              <p className="text-stone text-sm leading-relaxed font-light">
                Each emotional state maps to a unique audio feature profile —
                energy, valence, danceability, acousticness, and tempo —
                creating a multidimensional fingerprint that guides every
                recommendation.
              </p>
            </div>

            {/* The Algorithm */}
            <div className="card-glass rounded-lg p-12 md:p-16">
              <p className="text-xs tracking-sanctuary text-stone mb-8 font-light">
                methodology
              </p>
              <h3 className="text-2xl text-ink font-light mb-8">
                from psychology to sound
              </h3>
              <p className="text-stone leading-relaxed font-light mb-8">
                Natural language processing interprets your emotional description,
                identifying primary and secondary emotions. A neural language model
                then maps these to Spotify&apos;s genre taxonomy — over 4,000
                genres — while an intelligent randomization layer prevents taste
                cocooning.
              </p>
              <p className="text-stone text-sm leading-relaxed font-light">
                Tracks are scored against your emotional profile using composite
                audio feature weighting, and the top candidates are assembled into
                a real Spotify playlist — ready to play.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          Footer
          ================================================================ */}
      <footer className="bg-sand py-20 px-6">
        <div className="section-divider-natural mb-20" />
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-10 md:mb-0 text-center md:text-left">
              <Link
                href="/"
                className="text-xl tracking-sanctuary text-ink font-light hover:text-sage-500 transition-colors duration-500"
              >
                freya
              </Link>
              <p className="text-xs tracking-wide text-stone mt-6 font-light">
                &copy; {new Date().getFullYear()} freya
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end space-y-8">
              <div className="flex space-x-8">
                <a
                  href="https://x.com/rj12186"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-natural"
                  aria-label="X (Twitter)"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.105 4.105 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.108 4.108 0 001.27 5.477c-.21.052-.412.078-.606.078-.25 0-.479-.028-.696-.084a4.107 4.107 0 003.834 2.85 8.25 8.25 0 01-5.05.17 11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="https://github.com/RichardJiang736"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-natural"
                  aria-label="GitHub"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/richardjiang736/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-natural"
                  aria-label="LinkedIn"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>

              <div className="flex space-x-8">
                <Link href="/nlp" className="text-xs tracking-airy font-light link-natural">
                  emotions
                </Link>
                <Link href="/genres" className="text-xs tracking-airy font-light link-natural">
                  genres
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
