'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/auth';

export default function NLPPage() {
  const [emotionDetail, setEmotionDetail] = useState('');
  const [mainEmotion, setMainEmotion] = useState('');
  const [refinedEmotion, setRefinedEmotion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleAnalyzeEmotion = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mainEmotion, emotionDetail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze emotion');
      }

      setRefinedEmotion(data.refinedEmotion || data.emotion);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = () => {
    const emotion = refinedEmotion || mainEmotion;
    router.push(`/recommendations?emotion=${encodeURIComponent(emotion)}`);
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
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-xs tracking-sanctuary text-stone mb-4 font-light">
              natural language processing
            </p>
            <h1 className="text-4xl md:text-5xl text-ink font-light">
              emotion analysis
            </h1>
          </div>

          {/* Input card */}
          <div className="card-glass rounded-lg p-8 md:p-12 mb-12">
            <p className="text-xs tracking-sanctuary text-stone mb-10 font-light">
              describe your state
            </p>

            <div className="mb-8">
              <label className="block text-xs tracking-airy text-stone mb-3 font-light">
                primary emotion
              </label>
              <input
                type="text"
                value={mainEmotion}
                onChange={(e) => setMainEmotion(e.target.value)}
                className="input-natural"
                placeholder="joy, sadness, anger, nostalgia..."
              />
            </div>

            <div className="mb-10">
              <label className="block text-xs tracking-airy text-stone mb-3 font-light">
                detailed description
              </label>
              <textarea
                value={emotionDetail}
                onChange={(e) => setEmotionDetail(e.target.value)}
                className="input-natural h-32 resize-none"
                placeholder="describe how you're feeling in your own words..."
              />
            </div>

            <div className="flex flex-col items-start gap-6">
              <button
                onClick={handleAnalyzeEmotion}
                disabled={isLoading}
                className="btn-accent-natural disabled:opacity-40 disabled:pointer-events-none"
              >
                {isLoading ? 'analyzing...' : 'analyze emotion'}
              </button>

              {error && (
                <div className="w-full p-4 bg-red-100/60 text-red-700/80 text-sm tracking-wide rounded-lg">
                  {error}
                </div>
              )}

              {refinedEmotion && (
                <div className="w-full widget-glass rounded-lg p-6 border-l-2 border-l-sage-500/50">
                  <p className="text-xs tracking-airy text-stone mb-2 font-light">
                    refined emotion
                  </p>
                  <p className="text-xl text-ink font-light mb-6">
                    {refinedEmotion}
                  </p>
                  <button onClick={handleCreatePlaylist} className="btn-accent-natural">
                    create playlist
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-glass rounded-lg p-8">
              <h3 className="text-xl text-ink font-light mb-4">
                how it works
              </h3>
              <ul className="text-stone text-sm space-y-3 leading-relaxed font-light">
                <li>advanced nlp processes your emotional description</li>
                <li>identifies specific emotions from darwin&apos;s taxonomy</li>
                <li>matches emotions to appropriate music genres</li>
                <li>generates a personalized spotify playlist</li>
              </ul>
            </div>

            <div className="card-glass rounded-lg p-8">
              <h3 className="text-xl text-ink font-light mb-4">
                why darwin&apos;s taxonomy?
              </h3>
              <p className="text-stone text-sm leading-relaxed font-light">
                Freya AI uses Charles Darwin&apos;s foundational work on
                emotional expression to provide more nuanced emotion recognition
                than traditional valence-arousal models, resulting in more
                accurate and emotionally resonant music recommendations.
              </p>
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
