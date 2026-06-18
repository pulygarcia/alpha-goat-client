'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * Toaster compartido ("El Diario"): posición top-center, estilos atados a los
 * tokens cream del design system vía CSS vars de Sonner.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      toastOptions={{
        style: {
          background: 'var(--color-bg)',
          color: 'var(--color-curry)',
          border: '1px solid var(--color-cinnamon)',
        },
      }}
    />
  );
}
