'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, hasGenres } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push(hasGenres ? '/nlp' : '/genres');
    }
  }, [isAuthenticated, hasGenres, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/api/auth/login';
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-alabaster ambient-light">
      <div className="text-center">
        <div className="skeleton-breathing h-px w-48 mx-auto mb-8" />
        <p className="text-stone text-sm tracking-sanctuary font-light">
          connecting to spotify...
        </p>
      </div>
    </div>
  );
}
