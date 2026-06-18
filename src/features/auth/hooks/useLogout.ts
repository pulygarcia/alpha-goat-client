'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { notifyError } from '@/shared/lib/toast';
import { CURRENT_USER_KEY } from './useCurrentUser';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clear = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clear();
      // Sin removeQueries: el observer de AuthProvider recrearía la query y
      // initialData volvería a sembrar el usuario stale del server render.
      queryClient.setQueryData(CURRENT_USER_KEY, null);
      router.push('/login');
    },
    onError: () => {
      notifyError('No pudimos cerrar sesión');
    },
  });
}
