'use client';

import { FeaturedMarcas } from '@/features/marcas/components/FeaturedMarcas';

const RAIL_HEADING = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.7rem',
  letterSpacing: '0.26em',
  textTransform: 'uppercase',
  fontWeight: 700,
} as const;

/** Bloque del rail aún sin endpoint en el back. */
function PendingSection({ title, note }: { title: string; note: string }) {
  return (
    <section className="mb-8">
      <h5 className="text-cinnamon mb-4" style={RAIL_HEADING}>
        {title}
      </h5>
      <p className="text-sienna text-[13px] leading-relaxed">{note}</p>
    </section>
  );
}

export function FeedRail() {
  return (
    <aside className="bg-paper-raised px-7 py-9">
      <PendingSection
        title="Ranking semanal"
        note="El top de la semana llega cuando el back exponga GET /ranking/weekly."
      />
      <FeaturedMarcas />
      <PendingSection
        title="Recomendado para vos"
        note="Recomendaciones según tu huella — pendiente de GET /recommendations."
      />
    </aside>
  );
}
