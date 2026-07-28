'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useWorstRated } from '../hooks/useWorstRated';

/**
 * Bloque editorial "El peor votado" del rail del feed. Es contenido
 * accesorio: ante loading/error/204 no renderiza nada (el rail no debe
 * romperse ni mostrar un skeleton por esto).
 */
export function WorstRatedCard() {
  const { data, isLoading, isError } = useWorstRated();

  if (isLoading || isError || !data) return null;

  return (
    <section className="mb-8">
      <h5
        className="text-cinnamon mb-4"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        El peor votado
      </h5>

      <Link
        href={`/alfajores/${data.id}`}
        className="group relative grid grid-cols-[44px_1fr] items-center gap-3 py-3 pr-14"
      >
        {/* Score como sello estampado, rotado, a la derecha. */}
        <div
          className="border-error text-error absolute top-1/2 right-0 -translate-y-1/2 rounded-[6px] border-2 px-2 py-[2px] text-[15px] font-bold"
          style={{ fontFamily: 'var(--font-mono)', rotate: '-12deg' }}
        >
          {data.score.toFixed(1)}
        </div>

        <div className="bg-gris-25 border-gris-50 relative h-11 w-11 overflow-hidden rounded-[10px] border">
          {data.imagenUrl && (
            <Image
              src={data.imagenUrl}
              alt={data.nombre}
              fill
              sizes="44px"
              className="object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-ink truncate text-[14px] font-semibold group-hover:underline">
            {data.nombre}
          </div>
          <div
            className="text-cinnamon mt-[2px]"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            {data.marca.nombre} · {data.reviewsCount} reseñas
          </div>
        </div>
      </Link>
    </section>
  );
}
