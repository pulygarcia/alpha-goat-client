'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AlfajorReviews } from '@/features/reviews/components/AlfajorReviews';
import { QuickReviewModal } from '@/features/reviews/components/QuickReviewModal';
import { useAlfajor } from '../hooks/useAlfajor';
import { AlfajorDetailSkeleton } from './AlfajorDetailSkeleton';
import { AlfajorImageUploader } from './AlfajorImageUploader';

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
          <article className="flex flex-col items-center gap-6 text-center md:grid md:grid-cols-[minmax(0,420px)_1fr] md:items-start md:gap-8 md:text-left">
            <AlfajorImageUploader
              alfajorId={data.id}
              imagenUrl={data.imagenUrl}
              nombre={data.nombre}
              placeholder={tipoLabel(data.tipo)}
            />

            <div className="w-full md:pt-1">
              <h1 className="text-ink text-[26px] leading-[1.08] tracking-[-0.02em] md:text-[48px] md:leading-[1.02] md:tracking-[-0.03em]">
                {data.nombre}
              </h1>

              <p className="text-sienna mt-2 text-[13.5px] md:mt-3 md:text-[15px]">
                {data.marca?.nombre ?? 'Marca desconocida'}
                {data.marca?.provincia ? ` · ${data.marca.provincia}` : ''}
              </p>

              {data.descripcion && (
                <p className="text-ink/80 mx-auto mt-5 max-w-[560px] text-[14px] leading-relaxed md:mx-0 md:mt-6 md:text-[15px]">
                  {data.descripcion}
                </p>
              )}

              <button
                type="button"
                onClick={() => setReviewOpen(true)}
                className="text-paper mt-6 inline-flex h-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#a86432] to-[#3a1808] px-5 text-[13px] font-semibold tracking-[0.03em] uppercase transition-[filter] hover:brightness-110 md:mt-7 md:h-11 md:px-6 md:text-[14px]"
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
