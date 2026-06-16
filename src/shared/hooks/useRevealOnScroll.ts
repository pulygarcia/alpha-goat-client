'use client';

import { useCallback, useEffect, useState } from 'react';

type Options = {
  /** Margen del root para anticipar la entrada (igual que IntersectionObserver). */
  rootMargin?: string;
  /** Fracción visible para considerar "en vista". */
  threshold?: number;
};

type Reveal<T extends Element> = {
  /** Callback ref a colgar del contenedor a observar. */
  ref: (node: T | null) => void;
  /** `true` una vez que el elemento entró en vista (no vuelve a `false`). */
  revealed: boolean;
  /** `true` si además corresponde animar (respeta `prefers-reduced-motion`). */
  animate: boolean;
};

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Revela contenido al entrar en el viewport. Pensado para microinteracciones
 * (p. ej. el fill-in de un radar): se monta/anima recién cuando el usuario lo ve.
 *
 * Usa un callback ref para empezar a observar en cuanto el nodo entra al DOM,
 * incluso si aparece después del montaje (p. ej. tras un estado de carga).
 *
 * Sin soporte de `IntersectionObserver` (SSR, jsdom) revela de inmediato para no
 * ocultar nunca el contenido. Con `prefers-reduced-motion` revela sin animar.
 */
export function useRevealOnScroll<T extends Element = HTMLDivElement>({
  rootMargin = '0px 0px -10% 0px',
  threshold = 0.25,
}: Options = {}): Reveal<T> {
  const [node, setNode] = useState<T | null>(null);
  const reduced = prefersReducedMotion();
  const [revealed, setRevealed] = useState(false);

  const ref = useCallback((el: T | null) => setNode(el), []);

  useEffect(() => {
    if (!node || revealed) return;

    if (typeof IntersectionObserver === 'undefined') {
      // Sin soporte (SSR/jsdom): revelar una sola vez para no ocultar contenido.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, revealed, rootMargin, threshold]);

  return { ref, revealed, animate: revealed && !reduced };
}
