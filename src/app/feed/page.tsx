'use client';

import { RequireAuth } from '@/shared/components/auth/RequireAuth';
import { FeedHero } from '@/features/feed/components/FeedHero';
import { FeedReviews } from '@/features/feed/components/FeedReviews';
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
          <FeedReviews />
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
