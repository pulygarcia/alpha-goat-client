'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { useFeedHero } from '../hooks/useFeedHero';
import { useFeedFilters } from '../store/feedFilters.store';
import { useRevealOnScroll } from '@/shared/hooks/useRevealOnScroll';
import { NoPhoto } from '@/shared/components/media/NoPhoto';
import type {
  FeedHeroAlfajor,
  FeedHeroRatings,
  FeedHeroScope,
} from '../types/feed.types';
import { FeedHeroSkeleton } from './FeedHeroSkeleton';

// El pick histórico aparece cuando nadie llegó al piso de reseñas de la
// semana: sigue siendo un goat, pero no "del momento".
const SCOPE_LABELS: Record<FeedHeroScope, string> = {
  weekly: 'Goat del momento',
  allTime: 'El goat histórico',
};

function scopeLabel(scope: FeedHeroScope | undefined) {
  return SCOPE_LABELS[scope ?? 'weekly'];
}

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
          alfajor={data.alfajor}
          ratings={data.ratings}
          scope={data.scope}
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
        : `${deltaSign} ${Math.abs(stats.deltaPct).toFixed(0)}% esta semana`;
    const dim = 'color-mix(in oklab, var(--color-crema) 78%, transparent)';

    content = (
      <section className="border-gris-50 border-b px-5 py-6 md:px-8 md:py-9">
        <div
          className="bg-bg-deep text-crema relative overflow-hidden rounded-2xl bg-cover bg-center"
          style={{ backgroundImage: "url('/backgrounds/feed-hero-bg.jpg')" }}
        >
          <div aria-hidden className="absolute inset-0 bg-black/15" />
          <div className="relative z-10 flex flex-col-reverse md:flex-row md:items-stretch md:gap-10">
            <div className="flex flex-col justify-center gap-3 px-6 py-6 md:max-w-[440px] md:gap-[18px] md:py-0 md:pl-16">
              <span
                className="text-curry"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                {scopeLabel(data.scope)}
              </span>
              <Link
                href={`/alfajores/${alfajor.id}`}
                className="hover:text-curry-bright focus-visible:ring-curry-bright w-fit rounded-[4px] underline-offset-[6px] transition-colors hover:underline focus-visible:ring-2 focus-visible:outline-none"
                style={{
                  fontFamily: 'var(--font-archivo)',
                  fontSize: 'clamp(38px, 8vw, 56px)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.045em',
                }}
              >
                {alfajor.nombre}
              </Link>
              <span
                className="text-[13.5px] md:text-[15px]"
                style={{ color: dim }}
              >
                {stats.totalReviews} reseñas
                {deltaText && (
                  <>
                    {' · '}
                    <span className="text-curry font-semibold">
                      {deltaText}
                    </span>
                  </>
                )}
              </span>
            </div>

            <motion.div
              ref={ref}
              className="flex items-center justify-center px-6 pt-6 pb-7 md:flex-1 md:px-16 md:py-10"
              initial={animate ? { opacity: 0, scale: 0.85 } : false}
              animate={revealed ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative shrink-0">
                <div
                  className="border-crema/15 h-[96px] w-[96px] overflow-hidden rounded-2xl border md:h-[152px] md:w-[152px]"
                  style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)' }}
                >
                  {alfajor.imagenUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={alfajor.imagenUrl}
                      alt={alfajor.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <NoPhoto />
                  )}
                </div>
                <span
                  className="bg-curry text-sienna absolute -right-2 -bottom-2 flex h-9 w-9 items-center justify-center rounded-full text-[12px] md:h-12 md:w-12 md:text-[15px]"
                  style={{
                    fontFamily: 'var(--font-archivo)',
                    letterSpacing: '-0.02em',
                    boxShadow: '0 8px 18px -4px rgba(0,0,0,0.45)',
                  }}
                >
                  {ratings.general.toFixed(1)}
                </span>
              </div>
            </motion.div>
          </div>

          <div
            className="relative z-10 flex flex-col gap-2 border-t px-6 py-5 md:gap-3 md:px-16 md:py-7"
            style={{
              borderColor:
                'color-mix(in oklab, var(--color-crema) 18%, transparent)',
            }}
          >
            {(Object.keys(AXIS_LABELS) as Array<keyof FeedHeroRatings>)
              .filter((k) => k !== 'general')
              .map((key) => {
                const value = ratings[key];
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 md:max-w-[440px] md:gap-4"
                  >
                    <span
                      className="w-[78px] shrink-0 text-right text-[9px] md:w-[104px] md:text-[10px]"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color:
                          'color-mix(in oklab, var(--color-crema) 60%, transparent)',
                      }}
                    >
                      {AXIS_LABELS[key]}
                    </span>
                    <span
                      className="relative h-[3px] flex-1 overflow-hidden rounded-full md:h-[4px]"
                      style={{
                        background:
                          'color-mix(in oklab, var(--color-crema) 14%, transparent)',
                      }}
                    >
                      <span
                        className="bg-crema absolute inset-y-0 left-0 rounded-full"
                        style={{ width: `${value * 10}%` }}
                      />
                    </span>
                    <span
                      className="text-crema w-7 shrink-0 text-right text-[13px] md:w-9 md:text-[16px]"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                      }}
                    >
                      {value.toFixed(1)}
                    </span>
                  </div>
                );
              })}
          </div>
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
  alfajor,
  ratings,
  scope,
}: {
  alfajor: FeedHeroAlfajor;
  ratings: FeedHeroRatings;
  scope: FeedHeroScope | undefined;
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
        {scopeLabel(scope)}
      </p>
      <div className="mt-1 flex items-center gap-4">
        {/* La miniatura ancla el hero colapsado: sin el radar grande ni las
            stats, la foto es lo único que identifica al alfajor de un vistazo. */}
        <Link
          href={`/alfajores/${alfajor.id}`}
          aria-hidden
          tabIndex={-1}
          className="border-gris-50 bg-gris-25 h-11 w-11 shrink-0 overflow-hidden rounded-[10px] border"
        >
          {alfajor.imagenUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={alfajor.imagenUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <NoPhoto size="sm" />
          )}
        </Link>

        <p
          className="text-ink flex items-baseline gap-2 truncate"
          style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 26,
            letterSpacing: '-0.03em',
          }}
        >
          <Link
            href={`/alfajores/${alfajor.id}`}
            className="hover:text-curry-deep focus-visible:ring-curry-deep truncate rounded-[4px] underline-offset-4 transition-colors hover:underline focus-visible:ring-2 focus-visible:outline-none"
          >
            {alfajor.nombre}
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
