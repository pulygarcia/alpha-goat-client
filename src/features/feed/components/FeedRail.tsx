'use client';

import { FeaturedMarcas } from '@/features/marcas/components/FeaturedMarcas';
import { WeeklyRanking } from '@/features/ranking/components/WeeklyRanking';
import { RecommendedForYou } from '@/features/recommendations/components/RecommendedForYou';

export function FeedRail() {
  return (
    <aside className="bg-paper-raised px-7 py-9">
      <WeeklyRanking />
      <FeaturedMarcas />
      <RecommendedForYou />
    </aside>
  );
}
