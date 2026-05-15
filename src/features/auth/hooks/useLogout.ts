'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { CURRENT_USER_KEY } from './useCurrentUser';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clear = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clear();
      queryClient.setQueryData(CURRENT_USER_KEY, null);
      queryClient.removeQueries({ queryKey: CURRENT_USER_KEY });
      router.push('/login');
    },
  });
}
