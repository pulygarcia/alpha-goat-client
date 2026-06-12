'use client';

import { useWeeklyRanking } from '../hooks/useWeeklyRanking';
import type { WeeklyRankingItem, WeeklyTrend } from '../types/ranking.types';

const MONO_META = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.6rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  fontWeight: 500,
} as const;

// El back sólo manda la dirección (el delta crudo no se expone).
const TREND_LABEL: Record<WeeklyTrend, string> = {
  up: '▲',
  down: '▼',
  same: '=',
  new: 'nuevo',
};

const TREND_CLASS: Record<WeeklyTrend, string> = {
  up: 'text-reward',
  down: 'text-error',
  same: 'text-cinnamon',
  new: 'text-curry-deep',
};

function RankRow({ item, pos }: { item: WeeklyRankingItem; pos: number }) {
  return (
    <div className="grid grid-cols-[32px_1fr_auto] items-center gap-3 border-b border-dashed border-[rgba(74,30,8,0.22)] py-[11px]">
      <div
        className={pos <= 2 ? 'text-curry-deep' : 'text-sienna'}
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: 22,
          letterSpacing: '-0.04em',
        }}
      >
        {String(pos).padStart(2, '0')}
      </div>
      <div>
        <div className="text-ink text-[13.5px] font-medium">{item.nombre}</div>
        <div className="text-sienna mt-[2px]" style={MONO_META}>
          {item.marca.nombre}
        </div>
      </div>
      <div className="text-right">
        <div
          className="text-curry-deep text-[13px] font-bold"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {item.score.toFixed(1)}
        </div>
        <div
          className={`mt-[2px] text-[0.62rem] font-bold uppercase ${TREND_CLASS[item.trend]}`}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {TREND_LABEL[item.trend]}
        </div>
      </div>
    </div>
  );
}

export function WeeklyRanking() {
  const { data, isLoading, isError } = useWeeklyRanking();

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
        Ranking semanal
      </h5>

      {isLoading && (
        <div aria-hidden className="animate-pulse">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="grid grid-cols-[32px_1fr_auto] items-center gap-3 py-[11px]"
            >
              <div className="bg-paper-sunken h-6 w-7 rounded" />
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
          No pudimos cargar el ranking semanal.
        </p>
      )}

      {data && data.length === 0 && (
        <p className="text-sienna text-[13px] leading-relaxed">
          Todavía no hay suficientes reseñas esta semana.
        </p>
      )}

      {data &&
        data.length > 0 &&
        data.map((item, i) => (
          <RankRow key={item.id} item={item} pos={i + 1} />
        ))}
    </section>
  );
}
