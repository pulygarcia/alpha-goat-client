'use client';

import { useState } from 'react';
import { BackButton } from '@/shared/components/BackButton';
import { AlfajorReviewsPanel } from '@/features/reviews/components/AlfajorReviewsPanel';
import { QuickReviewModal } from '@/features/reviews/components/QuickReviewModal';
import { useAlfajorReviews } from '@/features/reviews/hooks/useAlfajorReviews';
import { useAlfajor } from '../hooks/useAlfajor';
import { AlfajorDetailSkeleton } from './AlfajorDetailSkeleton';
import { AlfajorEjesAverage } from './AlfajorEjesAverage';
import { AlfajorIdCard } from './AlfajorIdCard';
import { AlfajorScoreBlock } from './AlfajorScoreBlock';

/**
 * Paleta propia de esta página (mockup AlfajorPage): un hueso cálido casi
 * blanco, en vez del papel crema del resto de la app. Va con scope en el
 * contenedor, no como tokens globales, para que no se filtre a
 * feed/ranking/perfil.
 */
const PALETTE = {
  '--ap-bg': 'var(--color-blanco-tibio)',
  '--ap-ink': 'var(--color-ink)',
  '--ap-ink-2': 'var(--color-gris-600)',
  '--ap-muted': 'var(--color-gris-500)',
  '--ap-faint': 'var(--color-gris-400)',
  '--ap-faint-2': 'var(--color-gris-300)',
  '--ap-accent': 'var(--color-cinnamon)',
  '--ap-accent-dark': 'var(--color-gris-600)',
  '--ap-hairline': 'var(--color-gris-25)',
  '--ap-border': 'var(--color-gris-50)',
  '--ap-inert': 'var(--color-gris-25)',
} as React.CSSProperties;

function statusOf(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | null)?.response?.status;
}

export function AlfajorDetail({ id }: { id: string }) {
  const { data, isLoading, isError, error } = useAlfajor(id);
  // Misma query key que usa el panel de reseñas: el conteo sale del cache
  // compartido, sin un request extra ni un campo nuevo en el back.
  const reviews = useAlfajorReviews(id);
  const [reviewOpen, setReviewOpen] = useState(false);

  const reviewsCount = reviews.data?.pages[0]?.total ?? 0;

  return (
    // El fondo va en un wrapper a ancho completo: el `main` sigue centrado en
    // 1280, pero el color llega hasta los bordes en vez de dejar una franja
    // del curry oscuro del layout a los costados.
    <main
      className="min-h-screen w-full px-[18px] pt-4 pb-10 md:px-6 lg:px-10 lg:pt-10 lg:pb-16"
      style={{ ...PALETTE, background: 'var(--ap-bg)', color: 'var(--ap-ink)' }}
    >
      <div className="mx-auto max-w-[1280px]">
        <BackButton
          href="/alfajores"
          className="hover:bg-gris-25 mb-6"
          style={{ color: 'var(--ap-muted)', borderColor: 'var(--ap-border)' }}
        >
          Volver al catálogo
        </BackButton>

        {isLoading && <AlfajorDetailSkeleton />}

        {isError && statusOf(error) === 404 && (
          <p className="text-[14px]" style={{ color: 'var(--ap-muted)' }}>
            No encontramos este alfajor. Puede que no exista o todavía no esté
            aprobado.
          </p>
        )}

        {isError && statusOf(error) !== 404 && (
          <p className="text-[14px]" style={{ color: 'var(--ap-muted)' }}>
            No pudimos cargar el alfajor. Probá recargar.
          </p>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[400px_1fr] lg:gap-14">
              <aside className="flex flex-col gap-[22px] self-start lg:sticky lg:top-6">
                <AlfajorIdCard alfajor={data} />
                <AlfajorScoreBlock
                  avgRating={data.avgRating}
                  reviewsCount={reviewsCount}
                  onReview={() => setReviewOpen(true)}
                />
                <AlfajorEjesAverage avgEjes={data.avgEjes} />
                {data.descripcion && (
                  <p
                    className="text-[14px] leading-[1.65]"
                    style={{ color: 'var(--ap-muted)', textWrap: 'pretty' }}
                  >
                    {data.descripcion}
                  </p>
                )}
              </aside>

              <AlfajorReviewsPanel
                alfajorId={data.id}
                onReview={() => setReviewOpen(true)}
              />
            </div>

            <QuickReviewModal
              open={reviewOpen}
              onOpenChange={setReviewOpen}
              alfajor={data}
            />
          </>
        )}
      </div>
    </main>
  );
}
