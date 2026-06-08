'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import type { User } from '../types/auth.types';

export const CURRENT_USER_KEY = ['auth', 'me'] as const;

/**
 * `initialUser` proviene del servidor (ver getCurrentUser.server.ts). Cuando se
 * pasa, siembra la cache como dato inicial fresco: el primer render ya conoce la
 * sesión y no se dispara el fetch a /auth/me (no hay parpadeo). Si se omite
 * (undefined), el hook resuelve la sesión en el cliente como antes.
 */
export function useCurrentUser(initialUser?: User | null) {
  const setUser = useAuthStore((s) => s.setUser);

  const query = useQuery<User | null>({
    queryKey: CURRENT_USER_KEY,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60_000,
    initialData: initialUser,
  });

  useEffect(() => {
    if (query.isSuccess) setUser(query.data);
  }, [query.isSuccess, query.data, setUser]);

  return query;
}
