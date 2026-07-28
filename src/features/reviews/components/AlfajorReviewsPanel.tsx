'use client';

import { useAlfajorReviews } from '../hooks/useAlfajorReviews';
import { reviewToVM } from '../lib/reviewCardVM';
import { AlfajorReviewCard } from './AlfajorReviewCard';

function SkeletonRow({ opacity }: { opacity: number }) {
  return (
    <div className="flex flex-col gap-3" style={{ opacity }}>
      <div className="flex items-center gap-3">
        <div
          className="h-9 w-9 rounded-full"
          style={{ background: '#eeebe6' }}
        />
        <div className="flex flex-col gap-[6px]">
          <div
            className="h-3 w-[110px] rounded-[2px]"
            style={{ background: '#eeebe6' }}
          />
          <div
            className="h-[10px] w-[70px] rounded-[2px]"
            style={{ background: '#f3f1ed' }}
          />
        </div>
      </div>
      <div
        className="h-[13px] rounded-[2px]"
        style={{ background: '#f1efeb' }}
      />
      <div
        className="h-[13px] w-[82%] rounded-[2px]"
        style={{ background: '#f1efeb' }}
      />
    </div>
  );
}

/**
 * Columna de reseñas de la página del alfajor. Es dueña de sus cuatro estados:
 * la ficha del alfajor sigue visible aunque el listado falle, por eso el error
 * se resuelve acá adentro con un reintento local en vez de tumbar la página.
 */
export function AlfajorReviewsPanel({
  alfajorId,
  onReview,
}: {
  alfajorId: string;
  onReview: () => void;
}) {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAlfajorReviews(alfajorId);

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const isEmpty = !isLoading && !isError && items.length === 0;

  return (
    <div className="flex min-w-0 flex-col">
      <div
        className="flex items-baseline justify-between gap-4 pb-4"
        style={{ borderBottom: '2px solid var(--ap-ink)' }}
      >
        <h2
          className="text-[17px]"
          style={{
            fontFamily: 'var(--font-archivo)',
            letterSpacing: '-0.02em',
            color: 'var(--ap-ink)',
          }}
        >
          Reseñas de la comunidad
        </h2>
        <span
          className="text-[11px] tracking-[0.14em] whitespace-nowrap uppercase"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--ap-faint)' }}
        >
          Más recientes
        </span>
      </div>

      {isLoading && (
        <div
          data-testid="alfajor-reviews-loading"
          aria-hidden
          className="flex flex-col gap-[26px] pt-[26px]"
        >
          <SkeletonRow opacity={1} />
          <SkeletonRow opacity={0.6} />
          <SkeletonRow opacity={0.3} />
        </div>
      )}

      {isError && (
        <div
          className="mt-[26px] flex flex-col items-start gap-[10px] rounded-[6px] p-[26px]"
          style={{ border: '1px solid #e6d3c2', background: '#fbf6f1' }}
        >
          <span
            className="text-[10px] tracking-[0.16em] uppercase"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--ap-accent)',
            }}
          >
            Error al cargar
          </span>
          <div className="text-[16px] font-semibold">
            No pudimos traer las reseñas
          </div>
          <p
            className="max-w-[52ch] text-[14px] leading-[1.55]"
            style={{ color: 'var(--ap-faint)' }}
          >
            La ficha del alfajor se cargó bien; falló el listado. Probá de nuevo
            en unos segundos.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="cursor-pointer rounded-[4px] px-5 py-3 text-[11px] tracking-[0.14em] uppercase"
            style={{
              fontFamily: 'var(--font-mono)',
              background: 'var(--ap-ink)',
              color: 'var(--color-blanco-tibio)',
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {isEmpty && (
        <div
          className="mt-[26px] flex flex-col items-start gap-[10px] rounded-[6px] px-[26px] py-11"
          style={{ border: '1px dashed var(--ap-border)' }}
        >
          <div
            className="text-[20px]"
            style={{
              fontFamily: 'var(--font-archivo)',
              letterSpacing: '-0.03em',
              color: 'var(--ap-ink)',
            }}
          >
            Nadie lo reseñó todavía
          </div>
          <p
            className="max-w-[52ch] text-[14px] leading-[1.6]"
            style={{ color: 'var(--ap-faint)' }}
          >
            Tu cata va a definir el promedio y el perfil por eje de este
            alfajor.
          </p>
          <button
            type="button"
            onClick={onReview}
            className="mt-[6px] cursor-pointer rounded-[5px] px-6 py-[14px] text-[15px] font-semibold"
            style={{
              background: 'var(--ap-ink)',
              color: 'var(--color-blanco-tibio)',
            }}
          >
            Ser el primero
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex flex-col">
          {items.map((review) => (
            <AlfajorReviewCard key={review.id} vm={reviewToVM(review)} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mt-[26px] cursor-pointer self-start rounded-[4px] px-7 py-[14px] text-[12px] tracking-[0.14em] uppercase disabled:opacity-50"
          style={{
            fontFamily: 'var(--font-mono)',
            border: '1px solid var(--ap-ink)',
            color: 'var(--ap-ink)',
          }}
        >
          {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
        </button>
      )}
    </div>
  );
}
