'use client';

import { useEffect, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

/**
 * Anima un número desde 0 hasta `value` al montar. Respeta
 * `prefers-reduced-motion` (muestra el valor final sin animar). El texto del
 * DOM siempre termina en `value`, así que es accesible y testeable.
 * `decimals` controla los decimales mostrados (0 = entero).
 */
export function CountUp({
  value,
  durationMs = 800,
  decimals = 0,
}: {
  value: number;
  durationMs?: number;
  decimals?: number;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const controls = animate(0, value, {
      duration: durationMs / 1000,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, durationMs, reduce]);

  // Con reduced-motion mostramos el valor final sin animar.
  return <>{(reduce ? value : display).toFixed(decimals)}</>;
}
