'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType } from '@/src/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasGenres, setHasGenres] = useState(false);
  const [loading, setLoading] = useState(true);

  const updateAuthState = (data: any) => {
    if (data) {
      setIsAuthenticated(data.isAuthenticated);
      setUser(data.user || null);
      setHasGenres(data.hasGenres || false);
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          updateAuthState(data);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setHasGenres(false);
        }
      } catch {
        setIsAuthenticated(false);
        setUser(null);
        setHasGenres(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      urlParams.delete('auth');
      const newUrl =
        window.location.pathname +
        (urlParams.toString() ? '?' + urlParams.toString() : '') +
        window.location.hash;
      window.history.replaceState({}, document.title, newUrl);

      fetch('/api/auth/status', { credentials: 'include' })
        .then((res) => {
          if (res.ok) return res.json();
        })
        .then((data) => {
          if (data) {
            updateAuthState(data);
          }
        })
        .catch(console.error);
    }
  }, []);

  const refreshAuth = async () => {
    try {
      const response = await fetch('/api/auth/status', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        updateAuthState(data);
      }
    } catch { /* ignore */ }
  };

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch { /* ignore */ }
    setIsAuthenticated(false);
    setUser(null);
    setHasGenres(false);
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-alabaster ambient-light">
        <div className="skeleton-breathing h-px w-48" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, hasGenres, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
