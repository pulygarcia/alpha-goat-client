'use client';

import { WeeklyRanking } from '@/features/ranking/components/WeeklyRanking';
import { WorstRatedCard } from '@/features/ranking/components/WorstRatedCard';
import { RecommendedForYou } from '@/features/recommendations/components/RecommendedForYou';

export function FeedRail() {
  return (
    // El rail comparte el fondo de la página en vez de ir un escalón más
    // claro: las secciones ya no son tarjetas, se separan por hairlines a
    // sangre, y una superficie propia volvería a encajonarlas. El padding
    // horizontal vive en cada sección para que esos hairlines lleguen al borde.
    <aside className="border-gris-50 flex flex-col border-t py-8 lg:border-t-0 lg:py-9">
      <WeeklyRanking />
      <WorstRatedCard />
      <RecommendedForYou />
    </aside>
  );
}
