'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CURRENT_USER_KEY } from '@/features/auth/hooks/useCurrentUser';
import { notifyError, notifySuccess } from '@/shared/lib/toast';
import { profileApi } from '../api/profile.api';

/**
 * Sube el avatar propio (multipart). Al éxito invalida la sesión actual y las
 * queries de perfil (cambió `avatarUrl` → sidebar/header deben refrescar).
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CURRENT_USER_KEY });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      notifySuccess('Foto actualizada');
    },
    onError: () => notifyError('No pudimos actualizar la foto'),
  });
}
