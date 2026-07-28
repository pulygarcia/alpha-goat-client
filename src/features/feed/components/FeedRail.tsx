'use client';

import { WeeklyRanking } from '@/features/ranking/components/WeeklyRanking';
import { WorstRatedCard } from '@/features/ranking/components/WorstRatedCard';
import { RecommendedForYou } from '@/features/recommendations/components/RecommendedForYou';

export function FeedRail() {
  return (
    // El rail va un escalón más claro que la página (blanco sobre blanco
    // tibio), que es la relación que tenía con el papel: se despega sin
    // necesidad de un borde propio en desktop.
    <aside className="bg-blanco border-gris-50 border-t px-5 py-8 sm:px-7 lg:border-t-0 lg:py-9">
      <WeeklyRanking />
      <WorstRatedCard />
      <RecommendedForYou />
    </aside>
  );
}
