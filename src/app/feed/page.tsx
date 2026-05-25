'use client';

import { RequireAuth } from '@/shared/components/auth/RequireAuth';
import { FeedHero } from '@/features/feed/components/FeedHero';
import { FeedSubnav } from '@/features/feed/components/FeedSubnav';
import { FeedTopbar } from '@/features/feed/components/FeedTopbar';

function FeedContent() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <FeedTopbar />
      <FeedSubnav />

      <section className="mx-auto grid max-w-[1280px] grid-cols-[1fr_320px]">
        <div className="border-r border-[rgba(74,30,8,0.14)]">
          <FeedHero />
          <div className="px-8 py-9">
            <p
              className="text-[rgba(44,18,9,0.62)]"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Próximamente
            </p>
            <p className="mt-2 text-sienna text-[15px] max-w-[520px]">
              Reseñas destacadas, ranking semanal y rail lateral — siguen los
              próximos trozos.
            </p>
          </div>
        </div>

        <aside className="bg-paper-raised px-7 py-9">
          <p
            className="text-cinnamon"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Rail
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-sienna">
            Ranking semanal, marcas en foco y recomendaciones — se construyen
            en el próximo trozo.
          </p>
        </aside>
      </section>
    </main>
  );
}

export default function FeedPage() {
  return (
    <RequireAuth>
      <FeedContent />
    </RequireAuth>
  );
}
