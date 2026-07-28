'use client';

import { useState } from 'react';
import { useFeedReviews } from '../hooks/useFeedReviews';
import { useFeedFilters } from '../store/feedFilters.store';
import type { FeedScope, FeedSort } from '../types/feed.types';
import { FeedReviewsSkeleton } from './FeedReviewsSkeleton';
import { ReviewCard } from '@/features/reviews/components/ReviewCard';
import { feedItemToVM } from '@/features/reviews/lib/reviewCardVM';
import { StaggerItem } from '@/shared/components/motion/StaggerItem';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

/**
 * En mobile el feed corta a 8 reseñas y el resto queda detrás de "Ver más": la
 * página trae 20 por request y en una columna angosta eso es un scroll enorme
 * antes de llegar al pie. En desktop no se recorta.
 */
const MOBILE_CAP = 8;

const MORE_BUTTON = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.62rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  fontWeight: 700,
} as const;

const SORTS: Array<{ value: FeedSort; label: string }> = [
  { value: 'likes', label: 'Más likes' },
  { value: 'recent', label: 'Recientes' },
  { value: 'rating', label: 'Mejor puntuadas' },
];

const TITLES: Record<FeedScope, string> = {
  today: 'Reseñas de hoy',
  week: 'Reseñas de esta semana',
  following: 'Reseñas de gente que seguís',
  province: 'Reseñas destacadas',
};

function titleFor(scope: FeedScope | null): string {
  return scope === null ? 'Reseñas destacadas' : TITLES[scope];
}

/** Pastilla discreta al pie del feed: revela el recorte de mobile o pagina. */
function MoreButton({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="text-gris-400 border-gris-50 hover:bg-gris-25 hover:border-gris-200 hover:text-ink focus-visible:ring-ring inline-flex items-center gap-2 rounded-full border px-5 py-2 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
      style={MORE_BUTTON}
    >
      {loading ? 'Cargando...' : 'Ver más'}
      {!loading && (
        <span aria-hidden className="text-[0.7rem] leading-none">
          ↓
        </span>
      )}
    </button>
  );
}

export function FeedReviews() {
  const [sort, setSort] = useState<FeedSort>('recent');
  const [showAllOnMobile, setShowAllOnMobile] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const scope = useFeedFilters((s) => s.scope);
  const clearScope = useFeedFilters((s) => s.clearScope);
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedReviews({ sort, scope: scope ?? undefined });

  const pages = data?.pages ?? [];
  const isEmpty =
    !isLoading && !isError && pages.every((p) => p.items.length === 0);

  const total = pages.reduce((n, p) => n + p.items.length, 0);
  const capped = isMobile && !showAllOnMobile && total > MOBILE_CAP;
  const limit = capped ? MOBILE_CAP : total;

  // Se aplana conservando el índice *dentro de su página*: es lo que espera
  // `StaggerItem` para que cada tanda escalone sola y las cards ya montadas no
  // vuelvan a animarse al cargar la siguiente.
  const visible = pages
    .flatMap((page) => page.items.map((item, i) => ({ item, i })))
    .slice(0, limit);

  return (
    <section className="px-5 py-8 md:px-8 md:py-9">
      <div className="mb-5 flex flex-col gap-[14px]">
        <h4 className="text-ink text-[24px] font-semibold tracking-[-0.02em]">
          {titleFor(scope)}
        </h4>
        <Tabs value={sort} onValueChange={(v) => setSort(v as FeedSort)}>
          <TabsList
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            {SORTS.map((s) => (
              <TabsTrigger key={s.value} value={s.value}>
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading && <FeedReviewsSkeleton />}

      {isError && (
        <p className="text-gris-400">
          No pudimos contactar al servidor. Probá recargar.
        </p>
      )}

      {isEmpty && scope === 'following' && (
        <div className="py-8">
          <p className="text-ink text-[17px] font-semibold">
            Tu feed de seguidos está vacío
          </p>
          <p className="text-gris-400 mt-2 max-w-[420px] text-[14px] leading-relaxed">
            Todavía no seguís a nadie. Explorá el feed general y seguí a quienes
            reseñan los alfajores que te interesan.
          </p>
          <button
            type="button"
            onClick={clearScope}
            className="text-curry-deep mt-4"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Explorá el feed general
          </button>
        </div>
      )}

      {isEmpty && scope !== 'following' && (
        <p className="text-gris-400">Todavía no hay reseñas para mostrar.</p>
      )}

      <div className="flex flex-col gap-4">
        {visible.map(({ item, i }) => (
          <StaggerItem key={item.id} index={i}>
            <ReviewCard vm={feedItemToVM(item)} context="feed" />
          </StaggerItem>
        ))}
      </div>

      {/* Un solo botón para las dos formas de "más": recortado en mobile
          revela lo que ya está en cache (sin pedir nada); si no, pagina. Para
          el lector es la misma acción, así que se llama y se ve igual. */}
      {(capped || hasNextPage) && (
        <div className="pt-6 text-center">
          <MoreButton
            loading={!capped && isFetchingNextPage}
            onClick={() =>
              capped ? setShowAllOnMobile(true) : fetchNextPage()
            }
          />
        </div>
      )}
    </section>
  );
}
