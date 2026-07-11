'use client';

import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface AuthState {
  user: { id: string; email: string; name: string } | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('forge_token');
    if (!token) {
      setState({ user: null, isLoading: false, error: null });
      return;
    }
    api.setToken(token);
    api.user
      .me()
      .then((user) => setState({ user, isLoading: false, error: null }))
      .catch(() => setState({ user: null, isLoading: false, error: 'Session expired' }));
  }, []);

  return state;
}
