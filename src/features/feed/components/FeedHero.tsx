'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { useFeedHero } from '../hooks/useFeedHero';
import { useFeedFilters } from '../store/feedFilters.store';
import { useRevealOnScroll } from '@/shared/hooks/useRevealOnScroll';
import type { FeedHeroRatings } from '../types/feed.types';
import { FeedHeroSkeleton } from './FeedHeroSkeleton';

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
  const scope = useFeedFilters((s) => s.scope);
  const { data, isLoading, isError } = useFeedHero();
  const { ref, revealed, animate } = useRevealOnScroll<HTMLDivElement>();
  const reduceMotion = useReducedMotion();

  const collapsed = scope !== null;

  let content: React.ReactNode = null;

  if (collapsed) {
    if (!isLoading && !isError && data) {
      content = (
        <CollapsedHero
          alfajorId={data.alfajor.id}
          alfajorNombre={data.alfajor.nombre}
          ratings={data.ratings}
        />
      );
    }
  } else if (isLoading) {
    content = <FeedHeroSkeleton />;
  } else if (isError) {
    content = (
      <div className="text-gris-400 border-gris-50 border-b px-8 py-9">
        No pudimos contactar al servidor. Probá recargar.
      </div>
    );
  } else if (!data) {
    content = (
      <div className="text-gris-400 border-gris-50 border-b px-8 py-9">
        Todavía no hay reseñas. Sé el primero en reseñar un alfajor.
      </div>
    );
  } else {
    const { alfajor, ratings, stats } = data;
    const deltaSign =
      stats.deltaPct === null ? '' : stats.deltaPct >= 0 ? '▲' : '▼';
    const deltaText =
      stats.deltaPct === null
        ? undefined
        : `${deltaSign} ${Math.abs(stats.deltaPct).toFixed(0)}% vs sem. anterior`;

    content = (
      <section className="border-gris-50 border-b px-5 py-8 md:px-8 md:py-9">
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

        <div className="mt-3 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_360px] lg:items-center lg:gap-10">
          <div>
            <h2
              className="text-[40px] md:text-[48px] lg:text-[56px]"
              style={{
                fontFamily: 'var(--font-archivo)',
                letterSpacing: '-0.045em',
                lineHeight: 0.96,
              }}
            >
              <Link
                href={`/alfajores/${alfajor.id}`}
                className="text-ink hover:text-curry-deep focus-visible:ring-curry-deep rounded-[4px] underline-offset-[6px] transition-colors hover:underline focus-visible:ring-2 focus-visible:outline-none"
              >
                {alfajor.nombre}
              </Link>
            </h2>
            <p className="text-gris-400 mt-2 text-[15px]">
              {alfajor.marca.nombre}
              {alfajor.marca.provincia
                ? ` · ${alfajor.marca.provincia}`
                : ''} · <span className="lowercase">{alfajor.tipo}</span>
            </p>

            <dl className="mt-6 grid grid-cols-3 gap-3 md:gap-6">
              <Stat label="Rating" value={ratings.general.toFixed(1)} />
              <Stat
                label="Esta semana"
                value={String(stats.reviewsThisWeek)}
                hint={deltaText}
              />
              <Stat label="Total reseñas" value={String(stats.totalReviews)} />
            </dl>
          </div>

          <motion.div
            ref={ref}
            className="h-[280px] w-full"
            style={{ transformOrigin: 'center' }}
            initial={animate ? { opacity: 0, scale: 0.7 } : false}
            animate={revealed ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={0}
            >
              <RadarChart data={toRadarData(ratings)} outerRadius="78%">
                <PolarGrid stroke="var(--color-gris-50)" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    fill: 'var(--color-gris-400)',
                  }}
                />
                <PolarRadiusAxis
                  domain={[0, 10]}
                  tick={false}
                  axisLine={false}
                />
                {revealed && (
                  <Radar
                    dataKey="value"
                    stroke="var(--color-curry-deep)"
                    fill="var(--color-curry-deep)"
                    fillOpacity={0.28}
                    isAnimationActive={false}
                  />
                )}
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <motion.div
      layout={!reduceMotion}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.div>
  );
}

function CollapsedHero({
  alfajorId,
  alfajorNombre,
  ratings,
}: {
  alfajorId: string;
  alfajorNombre: string;
  ratings: FeedHeroRatings;
}) {
  return (
    <div className="border-gris-50 border-b px-5 py-6 md:px-8 md:py-7">
      <p
        className="text-curry-deep"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        Goat del momento
      </p>
      <div className="mt-1 flex items-center gap-5">
        <p
          className="text-ink flex items-baseline gap-2 truncate"
          style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 26,
            letterSpacing: '-0.03em',
          }}
        >
          <Link
            href={`/alfajores/${alfajorId}`}
            className="hover:text-curry-deep focus-visible:ring-curry-deep truncate rounded-[4px] underline-offset-4 transition-colors hover:underline focus-visible:ring-2 focus-visible:outline-none"
          >
            {alfajorNombre}
          </Link>
          <span className="text-cinnamon text-[15px] font-semibold">
            {ratings.general.toFixed(1)}
          </span>
        </p>

        <div data-testid="feed-hero-mini-radar" className="h-14 w-14 shrink-0">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <RadarChart data={toRadarData(ratings)} outerRadius="88%">
              <Radar
                dataKey="value"
                stroke="var(--color-curry-deep)"
                fill="var(--color-curry-deep)"
                fillOpacity={0.32}
                strokeWidth={1.3}
                isAnimationActive={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
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
    <div className="flex min-w-0 flex-col items-center text-center">
      <p
        className="text-cinnamon truncate text-[9.5px] tracking-[0.14em] uppercase md:text-[0.62rem] md:tracking-[0.26em]"
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
        }}
      >
        {label}
      </p>
      <p
        className="text-ink mt-1 text-[23px] md:text-[28px]"
        style={{
          fontFamily: 'var(--font-archivo)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </p>
      {hint && (
        <p className="text-gris-400 mt-1 text-[10px] md:text-[11px]">{hint}</p>
      )}
    </div>
  );
}
