'use client';

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { useFeedHero } from '../hooks/useFeedHero';
import type { FeedHeroRatings } from '../types/feed.types';

const AXIS_LABELS: Record<keyof FeedHeroRatings, string> = {
  general: 'General',
  dulzor: 'Dulzor',
  cantidadDDL: 'DDL',
  calidadBano: 'Baño',
  ratioTapaRelleno: 'Tapa/Relleno',
  textura: 'Textura',
};

function toRadarData(r: FeedHeroRatings) {
  return (Object.keys(AXIS_LABELS) as Array<keyof FeedHeroRatings>)
    .filter((k) => k !== 'general')
    .map((k) => ({ axis: AXIS_LABELS[k], value: r[k] }));
}

export function FeedHero() {
  const { data, isLoading, isError } = useFeedHero();

  if (isLoading) {
    return (
      <div className="text-sienna border-b border-[rgba(74,30,8,0.14)] px-8 py-9">
        Cargando el goat del momento...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sienna border-b border-[rgba(74,30,8,0.14)] px-8 py-9">
        No pudimos contactar al servidor. Probá recargar.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-sienna border-b border-[rgba(74,30,8,0.14)] px-8 py-9">
        Todavía no hay reseñas. Sé el primero en reseñar un alfajor.
      </div>
    );
  }

  const { alfajor, ratings, stats } = data;
  const deltaSign =
    stats.deltaPct === null ? '' : stats.deltaPct >= 0 ? '▲' : '▼';
  const deltaText =
    stats.deltaPct === null
      ? 'sin base previa'
      : `${deltaSign} ${Math.abs(stats.deltaPct).toFixed(0)}% vs sem. anterior`;

  return (
    <section className="border-b border-[rgba(74,30,8,0.14)] px-8 py-9">
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
        Goat del momento
      </p>

      <div className="mt-3 grid grid-cols-[1fr_360px] items-start gap-10">
        <div>
          <h2
            className="text-ink"
            style={{
              fontFamily: 'var(--font-archivo)',
              fontSize: 56,
              letterSpacing: '-0.045em',
              lineHeight: 0.96,
            }}
          >
            {alfajor.nombre}
          </h2>
          <p className="text-sienna mt-2 text-[15px]">
            {alfajor.marca.nombre}
            {alfajor.marca.provincia
              ? ` · ${alfajor.marca.provincia}`
              : ''} · <span className="lowercase">{alfajor.tipo}</span>
          </p>

          <dl className="mt-6 grid max-w-[520px] grid-cols-3 gap-6">
            <Stat label="Rating gral." value={ratings.general.toFixed(1)} />
            <Stat
              label="Reseñas semana"
              value={String(stats.reviewsThisWeek)}
              hint={deltaText}
            />
            <Stat label="Total reseñas" value={String(stats.totalReviews)} />
          </dl>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <RadarChart data={toRadarData(ratings)} outerRadius="78%">
              <PolarGrid stroke="rgba(74,30,8,0.18)" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  fill: 'rgba(44,18,9,0.7)',
                }}
              />
              <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
              <Radar
                dataKey="value"
                stroke="var(--color-curry-deep)"
                fill="var(--color-curry-deep)"
                fillOpacity={0.28}
                isAnimationActive
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <p
        className="text-cinnamon"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        {label}
      </p>
      <p
        className="text-ink mt-1"
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: 28,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </p>
      {hint && <p className="text-sienna mt-1 text-[11px]">{hint}</p>}
    </div>
  );
}
