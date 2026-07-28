'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useAlfajores } from '../hooks/useAlfajores';
import { AlfajorRow } from './AlfajorRow';
import { AlfajorRowsSkeleton } from './AlfajorRowsSkeleton';
import { ProposeAlfajorModal } from './ProposeAlfajorModal';

const ROW_STAGGER = 0.035; // s entre filas
const STAGGER_MAX = 0.28; // tope: listas largas no esperan eternamente

export function AlfajoresCatalog() {
  const [search, setSearch] = useState('');
  const [proposeOpen, setProposeOpen] = useState(false);
  const reduce = useReducedMotion();
  const q = useDebouncedValue(search, 300).trim();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAlfajores(q ? { q } : {});

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const isEmpty = !isLoading && !isError && items.length === 0;

  // El total sale del cache de la query: con búsqueda activa cuenta resultados,
  // no el catálogo entero, así que la etiqueta cambia para no mentir.
  const total = data?.pages[0]?.total;
  const countLabel = q
    ? total === 1
      ? 'resultado'
      : 'resultados'
    : total === 1
      ? 'alfajor registrado'
      : 'alfajores registrados';

  return (
    // Mismo hueso cálido que la página del alfajor, a ancho completo para que
    // el color llegue a los bordes en vez de dejar el curry del layout a los lados.
    <main className="bg-blanco-tibio min-h-screen w-full px-5 py-10 md:px-8">
      <div className="mx-auto max-w-[1080px]">
        <header className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p
              className="text-curry-deep"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Catálogo
            </p>
            <h1
              className="text-ink mt-1 text-[40px] md:text-[52px]"
              style={{
                fontFamily: 'var(--font-archivo)',
                lineHeight: 1.02,
                letterSpacing: '-0.035em',
              }}
            >
              Alfajores
            </h1>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2 pt-1 text-right">
            {total != null && (
              <p className="text-sienna text-[12px] md:text-[13px]">
                <span
                  className="text-ink text-[15px] md:text-[17px]"
                  style={{ fontFamily: 'var(--font-archivo)' }}
                >
                  {total}
                </span>{' '}
                {countLabel}
              </p>
            )}
            <button
              type="button"
              onClick={() => setProposeOpen(true)}
              className="text-sienna hover:text-ink text-[12px] underline decoration-[rgba(74,30,8,0.3)] underline-offset-4 transition-colors hover:decoration-current md:text-[13px]"
            >
              ¿Falta alguno? Proponelo
            </button>
          </div>
        </header>

        <label className="mb-7 flex h-11 w-full max-w-[420px] items-center gap-2 rounded-[10px] border border-[rgba(74,30,8,0.12)] bg-black/[0.015] px-3 transition-colors focus-within:border-[rgba(74,30,8,0.22)]">
          <Search className="text-cinnamon h-4 w-4" strokeWidth={2} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar alfajor por nombre"
            className="text-ink h-full flex-1 bg-transparent text-[14px] placeholder:text-[rgba(44,18,9,0.55)] focus:outline-none"
          />
        </label>

        {isLoading && <AlfajorRowsSkeleton />}

        {isError && (
          <p className="text-sienna text-[14px]">
            No pudimos cargar el catálogo. Probá recargar.
          </p>
        )}

        {isEmpty && (
          <p className="text-sienna text-[14px]">
            {q
              ? `No encontramos alfajores para “${q}”.`
              : 'No encontramos alfajores por ahora.'}
          </p>
        )}

        {items.length > 0 && (
          <div className="flex flex-col gap-1">
            {/* Encabezado de columna: el label va una vez arriba de la lista y
                no repetido en cada fila, que a 20 rows es puro ruido. */}
            <p
              className="text-gris-300 px-2 text-right text-[10px] tracking-[0.18em] uppercase"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Puntaje
            </p>

            {items.map((alfajor, i) => (
              <motion.div
                key={alfajor.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  // El índice es global a las páginas cargadas, así que el tope
                  // evita que la página 3 entre con medio segundo de retraso.
                  delay: reduce ? 0 : Math.min(i * ROW_STAGGER, STAGGER_MAX),
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <AlfajorRow alfajor={alfajor} />
              </motion.div>
            ))}
          </div>
        )}

        {hasNextPage && (
          <div className="pt-8 text-center">
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-curry-deep disabled:opacity-50"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        )}

        <ProposeAlfajorModal open={proposeOpen} onOpenChange={setProposeOpen} />
      </div>
    </main>
  );
}
