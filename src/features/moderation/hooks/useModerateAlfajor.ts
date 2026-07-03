'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { notifyError, notifySuccess } from '@/shared/lib/toast';
import { moderationApi } from '../api/moderation.api';
import { MODERATION_QUEUE_PREFIX } from './useModerationQueue';

export type ModerateInput =
  | { id: string; action: 'approve' }
  | { id: string; action: 'reject'; rejectionReason: string };

/**
 * Aprueba o rechaza un alfajor PENDING. Sin update optimista: la cola es de un
 * solo operador, así que basta invalidar y refetchear. Un 400 significa que el
 * alfajor ya no está PENDING (moderado en otra pestaña/sesión): se avisa con un
 * toast específico y se invalida igual para que el card viejo desaparezca.
 */
export function useModerateAlfajor() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: ModerateInput) =>
      input.action === 'approve'
        ? moderationApi.approve(input.id)
        : moderationApi.reject(input.id, input.rejectionReason),
    onSuccess: (_data, input) => {
      notifySuccess(
        input.action === 'approve' ? 'Alfajor aprobado' : 'Alfajor rechazado',
      );
      qc.invalidateQueries({ queryKey: MODERATION_QUEUE_PREFIX });
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        notifyError('Ese alfajor ya fue moderado');
        qc.invalidateQueries({ queryKey: MODERATION_QUEUE_PREFIX });
        return;
      }
      notifyError('No pudimos moderar el alfajor. Probá de nuevo.');
    },
  });
}
