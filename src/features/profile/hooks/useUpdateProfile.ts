'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CURRENT_USER_KEY } from '@/features/auth/hooks/useCurrentUser';
import { notifyError, notifySuccess } from '@/shared/lib/toast';
import { profileApi } from '../api/profile.api';

/**
 * Edita el perfil propio (username). Al éxito invalida la sesión actual y las
 * queries de perfil (el username cambió → la card/header deben refrescar).
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { username: string }) => profileApi.updateMe(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CURRENT_USER_KEY });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      notifySuccess('Perfil actualizado');
    },
    onError: () => notifyError('No pudimos actualizar el perfil'),
  });
}
