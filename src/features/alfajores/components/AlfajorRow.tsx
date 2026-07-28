'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Alfajor } from '../types/alfajores.types';

/**
 * Barrita horizontal compacta del catálogo: foto chica + nombre/marca y, a la
 * derecha, el puntaje con su barrita. Sin tipo.
 */
export function AlfajorRow({ alfajor }: { alfajor: Alfajor }) {
  const { id, nombre, imagenUrl, marca, avgRating } = alfajor;
  const rated = avgRating != null;
  const reduce = useReducedMotion();

  return (
    <Link
      href={`/alfajores/${id}`}
      style={{ boxShadow: '0 0.5px 0 0 rgba(74,30,8,0.14)' }}
      className="group -mx-2 flex items-center gap-3 rounded-[10px] px-2 py-2.5 transition-colors hover:bg-black/[0.03]"
    >
      <div className="bg-gris-25 relative h-11 w-11 flex-none overflow-hidden rounded-[9px]">
        {imagenUrl ? (
          <Image
            src={imagenUrl}
            alt={nombre}
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : (
          <div className="text-cinnamon/50 flex h-full w-full items-center justify-center">
            <Cookie className="h-5 w-5" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-ink group-hover:text-curry-deep truncate text-[14px] font-semibold tracking-[-0.01em] transition-colors">
          {nombre}
        </h3>
        <p className="text-sienna truncate text-[12.5px]">
          {marca?.nombre ?? 'Marca desconocida'}
          {marca?.provincia ? ` · ${marca.provincia}` : ''}
        </p>
      </div>

      <div className="flex flex-none flex-col items-end gap-1.5">
        <span
          className="text-[17px] leading-none tabular-nums"
          style={{
            fontFamily: 'var(--font-archivo)',
            letterSpacing: '-0.03em',
            color: rated ? 'var(--color-ink)' : 'var(--color-gris-100)',
          }}
        >
          {rated ? avgRating.toFixed(1) : '—'}
        </span>
        <span
          className="bg-gris-50 block h-[3px] w-11 overflow-hidden rounded-full"
          aria-hidden
        >
          {rated && (
            <motion.i
              data-testid={`row-score-fill-${id}`}
              className="bg-cinnamon block h-full rounded-full"
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${avgRating * 10}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </span>
      </div>
    </Link>
  );
}
