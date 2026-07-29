'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * Toaster compartido: posición top-center, estilos atados a los tokens del
 * design system vía CSS vars de Sonner.
 *
 * Superficie invertida (oscura sobre la app clara) y no una card blanca más:
 * el toast tiene que despegarse de un fondo que ahora es casi blanco, y un
 * borde gris no alcanza para eso.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      toastOptions={{
        style: {
          background: 'var(--color-gris-600)',
          color: 'var(--color-blanco-tibio)',
          border: '1px solid var(--color-negro)',
          boxShadow: 'var(--shadow-toast)',
        },
      }}
    />
  );
}
