'use client';

import { Plus } from 'lucide-react';

/**
 * Puntaje promedio del alfajor, protagonista de la ficha. Sin reseñas muestra
 * el guion largo en gris y el conteo pasa a "todavía sin puntaje" en vez de
 * "0 reseñas", que se lee como un error de carga.
 */
export function AlfajorScoreBlock({
  avgRating,
  reviewsCount,
  onReview,
}: {
  avgRating?: number | null;
  reviewsCount: number;
  onReview: () => void;
}) {
  const rated = avgRating != null;
  const conteo = rated
    ? `${reviewsCount} ${reviewsCount === 1 ? 'reseña' : 'reseñas'}`
    : 'todavía sin puntaje';

  return (
    <div
      className="flex items-center gap-4 py-5"
      style={{
        borderTop: '1px solid var(--ap-hairline)',
        borderBottom: '1px solid var(--ap-hairline)',
      }}
    >
      <div
        className="text-[52px] md:text-[76px]"
        style={{
          fontFamily: 'var(--font-archivo)',
          lineHeight: 0.8,
          letterSpacing: '-0.05em',
          color: rated ? 'var(--ap-ink)' : 'var(--color-gris-100)',
        }}
      >
        {rated ? avgRating.toFixed(1) : '—.—'}
      </div>

      <div className="flex flex-col gap-1">
        <span
          className="text-[12px]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--ap-faint-2)' }}
        >
          / 10.0
        </span>
        <span
          className="text-[11px] tracking-[0.12em] uppercase"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--ap-faint)' }}
        >
          {conteo}
        </span>
      </div>

      {/* Mismo botón que el "Reseñar" del header: es la misma acción, no tiene
          por qué verse distinta según desde dónde la dispares. */}
      <button
        type="button"
        onClick={onReview}
        className="btn-solid ml-auto inline-flex h-11 cursor-pointer items-center gap-[6px] rounded-[10px] px-[18px] text-[13px] leading-none font-semibold tracking-[0.04em] whitespace-nowrap uppercase"
      >
        <Plus className="h-4 w-4" strokeWidth={2.4} />
        Reseñar
      </button>
    </div>
  );
}
