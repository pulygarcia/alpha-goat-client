'use client';

import { motion, useReducedMotion } from 'framer-motion';

const DIGITS = Array.from({ length: 10 }, (_, n) => n);

/**
 * Una rueda vertical 0–9 que se desplaza para mostrar `digit`. La altura del
 * carril es 1em y cada número ocupa 1em, así que basta con mover `y` en `-digit`
 * em. `delayMs` escalona las ruedas para que el número "caiga" de izq. a der.
 */
function Reel({
  digit,
  durationMs,
  delayMs,
}: {
  digit: number;
  durationMs: number;
  delayMs: number;
}) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        height: '1em',
        lineHeight: 1,
        overflow: 'hidden',
      }}
    >
      <motion.span
        style={{ display: 'flex', flexDirection: 'column' }}
        initial={{ y: 0 }}
        animate={{ y: `-${digit}em` }}
        transition={{
          duration: durationMs / 1000,
          delay: delayMs / 1000,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {DIGITS.map((n) => (
          <span key={n} style={{ height: '1em', lineHeight: 1 }}>
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/**
 * Número con efecto odómetro: cada dígito rueda verticalmente hasta su valor al
 * montar. Los caracteres no numéricos (coma decimal) quedan fijos. Respeta
 * `prefers-reduced-motion` (muestra el valor final sin animar) y siempre expone
 * el valor completo como texto accesible.
 */
export function Odometer({
  value,
  decimals = 0,
  durationMs = 1000,
}: {
  value: number;
  decimals?: number;
  durationMs?: number;
}) {
  const reduce = useReducedMotion();
  const text = value.toFixed(decimals);

  if (reduce) return <span>{text}</span>;

  // Precalculamos el índice de cada dígito (ignorando la coma) para escalonar
  // los delays sin mutar nada durante el render.
  const chars = text.split('');
  const digitOrder = chars.map((ch, i) =>
    /\d/.test(ch) ? chars.slice(0, i).filter((c) => /\d/.test(c)).length : -1,
  );

  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline' }}>
      <span className="sr-only">{text}</span>
      <span
        aria-hidden
        style={{ display: 'inline-flex', alignItems: 'baseline' }}
      >
        {chars.map((ch, i) =>
          digitOrder[i] === -1 ? (
            <span key={i}>{ch}</span>
          ) : (
            <Reel
              key={i}
              digit={Number(ch)}
              durationMs={durationMs}
              delayMs={digitOrder[i] * 70}
            />
          ),
        )}
      </span>
    </span>
  );
}
