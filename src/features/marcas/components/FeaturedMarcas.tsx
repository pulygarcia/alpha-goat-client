'use client';

import { useFeaturedMarcas } from '../hooks/useFeaturedMarcas';
import type { FeaturedMarca } from '../types/marcas.types';

const MONO_META = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.6rem',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 500,
} as const;

function MarcaCard({ marca }: { marca: FeaturedMarca }) {
  const meta = [
    `${marca.productCount} ${marca.productCount === 1 ? 'producto' : 'productos'}`,
    `${marca.avgScore.toFixed(1)} prom.`,
  ].join(' · ');

  return (
    <div className="grid grid-cols-[44px_1fr] items-center gap-3 py-3">
      {marca.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={marca.logoUrl}
          alt={marca.nombre}
          className="h-11 w-11 rounded-[10px] border border-[rgba(74,30,8,0.22)] object-cover"
        />
      ) : (
        <div
          className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[rgba(74,30,8,0.22)] bg-paper-sunken text-cinnamon"
          style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 18,
            letterSpacing: '-0.04em',
          }}
        >
          {marca.nombre.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <div className="text-[14px] font-semibold text-ink">{marca.nombre}</div>
        <div className="mt-[2px] text-cinnamon" style={MONO_META}>
          {meta}
          {marca.provincia ? ` · ${marca.provincia}` : ''}
        </div>
      </div>
    </div>
  );
}

export function FeaturedMarcas() {
  const { data, isLoading, isError } = useFeaturedMarcas();

  return (
    <section className="mb-8">
      <h5
        className="mb-4 text-cinnamon"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        Marcas en foco
      </h5>

      {isLoading && (
        <div aria-hidden className="animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-[44px_1fr] items-center gap-3 py-3">
              <div className="h-11 w-11 rounded-[10px] bg-paper-sunken" />
              <div>
                <div className="h-3 w-24 rounded bg-paper-sunken" />
                <div className="mt-2 h-2 w-32 rounded bg-paper-sunken" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p className="text-[13px] leading-relaxed text-sienna">
          No pudimos cargar las marcas en foco.
        </p>
      )}

      {data && data.length === 0 && (
        <p className="text-[13px] leading-relaxed text-sienna">
          Todavía no hay marcas en foco.
        </p>
      )}

      {data && data.length > 0 && data.map((m) => <MarcaCard key={m.id} marca={m} />)}
    </section>
  );
}
