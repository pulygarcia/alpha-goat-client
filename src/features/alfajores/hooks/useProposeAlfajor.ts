'use client';

import { useMutation } from '@tanstack/react-query';
import { alfajoresApi } from '../api/alfajores.api';
import type { ProposeAlfajorInput } from '../types/alfajores.types';

/**
 * Propone un alfajor (`POST /alfajores`, queda PENDING). Mutación fina: no toca
 * caches (el alfajor nace PENDING y no entra al catálogo público) ni emite
 * toasts; el modal decide la UX (pantalla de éxito vs 409 inline) según el
 * resultado.
 */
export function useProposeAlfajor() {
  return useMutation({
    mutationFn: (input: ProposeAlfajorInput) => alfajoresApi.create(input),
  });
}
