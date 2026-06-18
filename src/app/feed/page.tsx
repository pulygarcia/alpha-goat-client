'use client';

import { FeedHero } from '@/features/feed/components/FeedHero';
import { FeedRail } from '@/features/feed/components/FeedRail';
import { FeedReviews } from '@/features/feed/components/FeedReviews';
import { FeedSubnav } from '@/features/feed/components/FeedSubnav';
import { FeedTopbar } from '@/features/feed/components/FeedTopbar';
import { ReviewFab } from '@/features/feed/components/ReviewFab';

// Feed público: un anónimo puede verlo (modelo "ver público / actuar autenticado").
// El gate vive en las acciones (like, seguir, comentar) vía useRequireAuth, no en la página.
export default function FeedPage() {
  return (
    <main className="bg-paper text-ink min-h-screen">
      <FeedTopbar />
      <FeedSubnav />

      <section className="mx-auto grid max-w-[1280px] grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div className="lg:border-r lg:border-[rgba(74,30,8,0.14)]">
          <FeedHero />
          <FeedReviews />
        </div>

        <FeedRail />
      </section>

      <ReviewFab />
    </main>
  );
}
