'use client';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRecommendations } from '../hooks/useRecommendations';
import type { RecommendationItem } from '../types/recommendations.types';

const MONO_META = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.6rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  fontWeight: 500,
} as const;

function RecRow({ item }: { item: RecommendationItem }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-dashed border-[rgba(74,30,8,0.22)] py-[11px]">
      <div>
        <div className="text-ink text-[13.5px] font-medium">{item.nombre}</div>
        <div className="text-sienna mt-[2px]" style={MONO_META}>
          {item.marca.nombre}
        </div>
      </div>
      {/* Cold start: matchPct null → recomendado por calidad, sin afinidad que mostrar. */}
      {item.matchPct !== null && (
        <div className="text-right">
          <div
            className="text-curry-deep text-[13px] font-bold"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {Math.round(item.matchPct)}%
          </div>
          <div className="text-sienna mt-[2px]" style={MONO_META}>
            afinidad
          </div>
        </div>
      )}
    </div>
  );
}

export function RecommendedForYou() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useRecommendations();

  // El bloque no tiene sentido para un invitado: no se muestra.
  if (!user) return null;

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
        Recomendado para vos
      </h5>

      {isLoading && (
        <div aria-hidden className="animate-pulse">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto] items-center gap-3 py-[11px]"
            >
              <div>
                <div className="bg-paper-sunken h-3 w-28 rounded" />
                <div className="bg-paper-sunken mt-2 h-2 w-16 rounded" />
              </div>
              <div className="bg-paper-sunken h-3 w-8 rounded" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sienna text-[13px] leading-relaxed">
          No pudimos cargar tus recomendaciones.
        </p>
      )}

      {data && data.length === 0 && (
        <p className="text-sienna text-[13px] leading-relaxed">
          Reseñá algunos alfajores y te recomendamos según tu gusto.
        </p>
      )}

      {data &&
        data.length > 0 &&
        data.map((item) => <RecRow key={item.id} item={item} />)}
    </section>
  );
}
