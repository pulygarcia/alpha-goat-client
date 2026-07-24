'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useAlfajores } from '../hooks/useAlfajores';
import { AlfajorRow } from './AlfajorRow';
import { AlfajorRowsSkeleton } from './AlfajorRowsSkeleton';

export function AlfajoresCatalog() {
  const [search, setSearch] = useState('');
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

  return (
    <main className="mx-auto max-w-[1080px] px-5 py-10 md:px-8">
      <header className="mb-7">
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
        <h1 className="text-ink mt-1 text-[40px] leading-none tracking-[-0.03em] md:text-[52px]">
          Alfajores
        </h1>
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
          {items.map((alfajor) => (
            <AlfajorRow key={alfajor.id} alfajor={alfajor} />
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
    </main>
  );
}
