'use client';

import { useMutation } from '@tanstack/react-query';
import { notifyError, notifySuccess } from '@/shared/lib/toast';
import { profileApi } from '../api/profile.api';
import type { PasswordSchema } from '../schemas/editProfile.schema';

/** Cambia la contraseña propia. No toca cache (no hay estado que refrescar). */
export function useChangePassword() {
  return useMutation({
    mutationFn: (input: PasswordSchema) => profileApi.changePassword(input),
    onSuccess: () => notifySuccess('Contraseña actualizada'),
    onError: () => notifyError('No pudimos cambiar la contraseña'),
  });
}
