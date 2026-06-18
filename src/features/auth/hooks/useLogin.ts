'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { notifyError } from '@/shared/lib/toast';
import type { AuthResponse, LoginInput } from '../types/auth.types';
import { CURRENT_USER_KEY } from './useCurrentUser';

function safeNext(raw: string | null): string {
  if (!raw) return '/feed';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/feed';
  return raw;
}

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<AuthResponse, unknown, LoginInput>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(CURRENT_USER_KEY, data.user);
      router.push(safeNext(searchParams?.get('next') ?? null));
    },
    onError: () => {
      notifyError('No pudimos iniciar sesión');
    },
  });
}
