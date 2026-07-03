'use client';

import { useMutation } from '@tanstack/react-query';
import { alfajoresApi } from '../api/alfajores.api';
import type { Alfajor, ProposeAlfajorInput } from '../types/alfajores.types';

export interface ProposeAlfajorPayload {
  input: ProposeAlfajorInput;
  /** Foto opcional: se sube tras el create con el id (el back autoriza al creador mientras está PENDING). */
  foto?: File;
}

export interface ProposeAlfajorResult {
  alfajor: Alfajor;
  /** false si la propuesta quedó pero la subida de la foto falló (no aborta el flujo). */
  fotoUploaded: boolean;
}

/**
 * Propone un alfajor (`POST /alfajores`, queda PENDING) y, si vino foto, la sube
 * con el id creado. Un fallo del upload NO falla la mutación: la propuesta ya
 * existe y el admin puede moderarla sin foto — se reporta en `fotoUploaded` para
 * que el modal lo avise. Mutación sin toasts ni caches (el alfajor nace PENDING
 * y no entra al catálogo público); el modal decide la UX según el resultado.
 */
export function useProposeAlfajor() {
  return useMutation({
    mutationFn: async ({
      input,
      foto,
    }: ProposeAlfajorPayload): Promise<ProposeAlfajorResult> => {
      const alfajor = await alfajoresApi.create(input);
      if (!foto) return { alfajor, fotoUploaded: true };
      try {
        await alfajoresApi.uploadImage(alfajor.id, foto);
        return { alfajor, fotoUploaded: true };
      } catch {
        return { alfajor, fotoUploaded: false };
      }
    },
  });
}
