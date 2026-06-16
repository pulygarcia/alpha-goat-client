'use client';

import { RequireAuth } from '@/shared/components/auth/RequireAuth';
import { FeedHero } from '@/features/feed/components/FeedHero';
import { FeedRail } from '@/features/feed/components/FeedRail';
import { FeedReviews } from '@/features/feed/components/FeedReviews';
import { FeedSubnav } from '@/features/feed/components/FeedSubnav';
import { FeedTopbar } from '@/features/feed/components/FeedTopbar';
import { ReviewFab } from '@/features/feed/components/ReviewFab';

function FeedContent() {
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

export default function FeedPage() {
  return (
    <RequireAuth>
      <FeedContent />
    </RequireAuth>
  );
}
