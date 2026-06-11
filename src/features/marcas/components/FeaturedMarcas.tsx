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
          className="bg-paper-sunken text-cinnamon flex h-11 w-11 items-center justify-center rounded-[10px] border border-[rgba(74,30,8,0.22)]"
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
        <div className="text-ink text-[14px] font-semibold">{marca.nombre}</div>
        <div className="text-cinnamon mt-[2px]" style={MONO_META}>
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
        className="text-cinnamon mb-4"
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
            <div
              key={i}
              className="grid grid-cols-[44px_1fr] items-center gap-3 py-3"
            >
              <div className="bg-paper-sunken h-11 w-11 rounded-[10px]" />
              <div>
                <div className="bg-paper-sunken h-3 w-24 rounded" />
                <div className="bg-paper-sunken mt-2 h-2 w-32 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sienna text-[13px] leading-relaxed">
          No pudimos cargar las marcas en foco.
        </p>
      )}

      {data && data.length === 0 && (
        <p className="text-sienna text-[13px] leading-relaxed">
          Todavía no hay marcas en foco.
        </p>
      )}

      {data &&
        data.length > 0 &&
        data.map((m) => <MarcaCard key={m.id} marca={m} />)}
    </section>
  );
}
