import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RequireAuth } from '@/shared/components/auth/RequireAuth';
import { ReviewForm } from '@/features/reviews/components/ReviewForm';

// Reseñar requiere sesión. `params` es Promise en Next 16.
export default async function ResenarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <RequireAuth>
      <div className="bg-paper text-ink min-h-screen">
        <main className="mx-auto max-w-[680px] px-5 py-8 md:px-8 md:py-10">
          <Link
            href={`/alfajores/${id}`}
            className="text-sienna hover:text-ink mb-7 inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Volver al alfajor
          </Link>

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
            Tu reseña
          </p>
          <h1 className="text-ink mt-1 mb-7 text-[36px] leading-none tracking-[-0.03em] md:text-[44px]">
            Reseñar
          </h1>

          <ReviewForm alfajorId={id} />
        </main>
      </div>
    </RequireAuth>
  );
}
