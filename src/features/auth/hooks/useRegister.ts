'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { notifySuccess, notifyError } from '@/shared/lib/toast';
import type { AuthResponse, RegisterInput } from '../types/auth.types';
import { CURRENT_USER_KEY } from './useCurrentUser';

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<AuthResponse, unknown, RegisterInput>({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(CURRENT_USER_KEY, data.user);
      router.push('/feed');
      notifySuccess('Cuenta creada');
    },
    onError: () => {
      notifyError('No pudimos crear la cuenta');
    },
  });
}
