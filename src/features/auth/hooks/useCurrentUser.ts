'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export const CURRENT_USER_KEY = ['auth', 'me'] as const;

export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);

  const query = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (query.isSuccess) setUser(query.data);
    else if (query.isError) setUser(null);
  }, [query.isSuccess, query.isError, query.data, setUser]);

  return query;
}
