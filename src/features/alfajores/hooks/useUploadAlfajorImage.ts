'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifyError, notifySuccess } from '@/shared/lib/toast';
import { alfajoresApi } from '../api/alfajores.api';

/**
 * Sube la foto de un alfajor (multipart). Al éxito invalida todas las queries de
 * `alfajores` (cubre el detalle y el listado del catálogo, que comparten la
 * `imagenUrl`).
 */
export function useUploadAlfajorImage(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => alfajoresApi.uploadImage(id, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['alfajores'] });
      notifySuccess('Foto actualizada');
    },
    onError: () => notifyError('No pudimos actualizar la foto'),
  });
}
