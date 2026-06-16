'use client';

import { FeaturedMarcas } from '@/features/marcas/components/FeaturedMarcas';
import { WeeklyRanking } from '@/features/ranking/components/WeeklyRanking';
import { RecommendedForYou } from '@/features/recommendations/components/RecommendedForYou';

export function FeedRail() {
  return (
    <aside className="bg-paper-raised border-t border-[rgba(74,30,8,0.14)] px-5 py-8 sm:px-7 lg:border-t-0 lg:py-9">
      <WeeklyRanking />
      <FeaturedMarcas />
      <RecommendedForYou />
    </aside>
  );
}
