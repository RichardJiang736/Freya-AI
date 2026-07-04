'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-alabaster/70 backdrop-blur-xl">
      <div className="container mx-auto flex justify-between items-center py-5 px-6">
        <Link
          href="/"
          className="text-lg tracking-sanctuary text-ink font-light hover:text-sage-500 transition-colors duration-400"
        >
          freya
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10">
          <Link
            href="/nlp"
            className="text-sm tracking-airy text-charcoal font-light hover:text-ink transition-colors duration-400"
          >
            emotions
          </Link>
          <Link
            href="/genres"
            className="text-sm tracking-airy text-charcoal font-light hover:text-ink transition-colors duration-400"
          >
            genres
          </Link>
        </nav>

        {/* Auth button */}
        <div className="hidden md:flex items-center">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="btn-ghost-natural !px-4 !py-2 !text-xs !tracking-wide"
            >
              logout
            </button>
          ) : (
            <Link
              href="/login"
              className="btn-ghost-natural !px-4 !py-2 !text-xs !tracking-wide"
            >
              login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-charcoal hover:text-sage-500 transition-colors duration-400 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-sand/90 backdrop-blur-xl">
          <div className="flex flex-col space-y-1 px-6 py-4">
            <Link
              href="/nlp"
              className="text-sm tracking-airy text-charcoal font-light hover:text-ink transition-colors duration-400 py-3"
              onClick={() => setIsMenuOpen(false)}
            >
              emotions
            </Link>
            <Link
              href="/genres"
              className="text-sm tracking-airy text-charcoal font-light hover:text-ink transition-colors duration-400 py-3"
              onClick={() => setIsMenuOpen(false)}
            >
              genres
            </Link>

            <div className="pt-4 mt-2">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="btn-ghost-natural w-full !text-xs !tracking-wide"
                >
                  logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="btn-ghost-natural w-full !text-xs !tracking-wide inline-flex items-center justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
