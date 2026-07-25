'use client';

import { useSyncExternalStore } from 'react';

/**
 * Suscribe a una media query. Usa `useSyncExternalStore` en vez de
 * `useState` + `useEffect` para que el valor sea consistente desde el primer
 * render del cliente (sin un frame con el valor equivocado) y para declarar el
 * snapshot del servidor de forma explícita.
 *
 * En SSR devuelve `false`: no hay viewport que consultar, así que el árbol se
 * renderiza en su forma de escritorio y se corrige al hidratar.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () =>
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia(query).matches
        : false,
    () => false,
  );
}
