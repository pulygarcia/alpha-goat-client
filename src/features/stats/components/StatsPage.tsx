'use client';

import { Cookie, HandHeart, MessageSquareText, Users } from 'lucide-react';
import { useGlobalStats } from '../hooks/useGlobalStats';
import { StatCounter } from './StatCounter';
import { StatsCountersSkeleton } from './StatsCountersSkeleton';
import { CommunityDomeGallery } from '@/shared/components/dome-gallery/CommunityDomeGallery';

export function StatsPage() {
  const { data, isLoading, isError } = useGlobalStats();

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-10 md:px-8">
      <header className="mb-6 text-center">
        <h1 className="text-ink text-[30px] leading-none tracking-[-0.03em] md:text-[40px]">
          Números de{' '}
          <span style={{ fontFamily: 'var(--font-archivo)' }}>AlphaGoat</span>
        </h1>
      </header>

      {isLoading && <StatsCountersSkeleton />}

      {isError && (
        <p className="text-gris-400 text-center text-[14px]">
          No pudimos cargar las estadísticas. Probá recargar.
        </p>
      )}

      {data && (
        <>
          {/* Cúpula: protagonista de la página, ocupa casi todo el ancho */}
          <div className="mx-auto h-[420px] w-full overflow-hidden rounded-full sm:h-[480px] md:h-[640px] md:overflow-visible md:rounded-none">
            <CommunityDomeGallery />
          </div>

          {/* Contadores: fila horizontal con separadores finos, sin grid */}
          <div className="mx-auto mt-8 flex flex-nowrap items-center justify-center overflow-x-auto">
            {[
              {
                label: 'Reseñas',
                value: data.reviewsTotal,
                icon: MessageSquareText,
              },
              { label: 'Alfajores', value: data.alfajoresTotal, icon: Cookie },
              { label: 'Usuarios', value: data.usersTotal, icon: Users },
              {
                label: 'Aportados',
                value: data.alfajoresContributedByUsers,
                icon: HandHeart,
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`border-gris-50 px-2 sm:px-8 md:px-12 ${i > 0 ? 'border-l' : ''}`}
              >
                <StatCounter
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
