'use client';

import { useEffect, useRef, useState } from 'react';

type Options = {
  /** Margen del root para anticipar la entrada (igual que IntersectionObserver). */
  rootMargin?: string;
  /** Fracción visible para considerar "en vista". */
  threshold?: number;
};

type Reveal<T extends Element> = {
  /** Ref a colgar del contenedor a observar. */
  ref: React.RefObject<T | null>;
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
 * Sin soporte de `IntersectionObserver` (SSR, jsdom) revela de inmediato para no
 * ocultar nunca el contenido. Con `prefers-reduced-motion` revela sin animar.
 */
export function useRevealOnScroll<T extends Element = HTMLDivElement>({
  rootMargin = '0px 0px -10% 0px',
  threshold = 0.25,
}: Options = {}): Reveal<T> {
  const ref = useRef<T>(null);
  const reduced = prefersReducedMotion();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

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

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, revealed, animate: revealed && !reduced };
}
