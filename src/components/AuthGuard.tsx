'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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

  return <>{children}</>;
}
