'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AlfajorReviews } from '@/features/reviews/components/AlfajorReviews';
import { QuickReviewModal } from '@/features/reviews/components/QuickReviewModal';
import { useAlfajor } from '../hooks/useAlfajor';
import { AlfajorDetailSkeleton } from './AlfajorDetailSkeleton';

function tipoLabel(tipo: string) {
  return tipo.charAt(0) + tipo.slice(1).toLowerCase();
}

function statusOf(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | null)?.response?.status;
}

export function AlfajorDetail({ id }: { id: string }) {
  const { data, isLoading, isError, error } = useAlfajor(id);
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <main className="mx-auto max-w-[1080px] px-5 py-8 md:px-8 md:py-10">
      <Link
        href="/alfajores"
        className="text-sienna hover:text-ink mb-7 inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Volver al catálogo
      </Link>

      {isLoading && <AlfajorDetailSkeleton />}

      {isError && statusOf(error) === 404 && (
        <p className="text-sienna text-[14px]">
          No encontramos este alfajor. Puede que no exista o todavía no esté
          aprobado.
        </p>
      )}

      {isError && statusOf(error) !== 404 && (
        <p className="text-sienna text-[14px]">
          No pudimos cargar el alfajor. Probá recargar.
        </p>
      )}

      {data && (
        <>
          <article className="grid gap-8 md:grid-cols-[minmax(0,420px)_1fr]">
            <div className="bg-paper-sunken relative aspect-square w-full overflow-hidden rounded-[16px] border border-[rgba(74,30,8,0.14)]">
              {data.imagenUrl ? (
                <Image
                  src={data.imagenUrl}
                  alt={data.nombre}
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-cover"
                />
              ) : (
                <div
                  className="text-cinnamon flex h-full w-full items-center justify-center text-[0.7rem] tracking-[0.24em] uppercase"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {tipoLabel(data.tipo)}
                </div>
              )}
            </div>

            <div className="pt-1">
              <span
                className="text-curry-deep"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                {tipoLabel(data.tipo)}
              </span>

              <h1 className="text-ink mt-2 text-[40px] leading-[1.02] tracking-[-0.03em] md:text-[48px]">
                {data.nombre}
              </h1>

              <p className="text-sienna mt-3 text-[15px]">
                {data.marca?.nombre ?? 'Marca desconocida'}
                {data.marca?.provincia ? ` · ${data.marca.provincia}` : ''}
              </p>

              {data.descripcion && (
                <p className="text-ink/80 mt-6 max-w-[560px] text-[15px] leading-relaxed">
                  {data.descripcion}
                </p>
              )}

              <button
                type="button"
                onClick={() => setReviewOpen(true)}
                className="text-paper mt-7 inline-flex h-11 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#a86432] to-[#3a1808] px-6 text-[14px] font-semibold tracking-[0.03em] uppercase transition-[filter] hover:brightness-110"
              >
                Reseñar
              </button>
            </div>
          </article>

          <AlfajorReviews alfajorId={data.id} />

          <QuickReviewModal
            open={reviewOpen}
            onOpenChange={setReviewOpen}
            alfajor={data}
          />
        </>
      )}
    </main>
  );
}
