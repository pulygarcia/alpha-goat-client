'use client';

import { Card } from '@/shared/components/ui/card';
import { Odometer } from '@/shared/components/motion/Odometer';
import { StaggerItem } from '@/shared/components/motion/StaggerItem';
import type { Profile } from '../types/profile.types';

type Metric = {
  testid: string;
  label: string;
  caption: string;
  value: number;
  decimals?: number;
  /** Cuando el dato no aplica (p. ej. score sin reseñas) mostramos un guion. */
  empty?: boolean;
};

function Num({ metric }: { metric: Metric }) {
  return (
    <Card className="bg-paper-raised rounded-xl border-[rgba(74,30,8,0.12)] p-[18px] shadow-none">
      <span
        className="text-curry-deep block"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.59rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {metric.label}
      </span>
      <span
        data-testid={metric.testid}
        className="text-ink mt-2 block"
        style={{
          fontFamily: 'var(--font-archivo)',
          fontSize: 34,
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}
      >
        {metric.empty ? (
          '—'
        ) : (
          <Odometer value={metric.value} decimals={metric.decimals} />
        )}
      </span>
      <span className="text-cinnamon mt-1 block text-[12px]">
        {metric.caption}
      </span>
    </Card>
  );
}

/**
 * Panel "Aportes a la comunidad": métricas solo en números, con count-up al
 * cargar. Los cuatro aportes vienen del perfil; mientras el back no los exponga
 * caen a 0 (y el score a "—" cuando no hay reseñas todavía).
 */
export function ContributionStats({ profile }: { profile: Profile }) {
  const metrics: Metric[] = [
    {
      testid: 'contrib-comments',
      label: 'Comentarios',
      caption: 'en reseñas de otros',
      value: profile.commentsCount ?? 0,
    },
    {
      testid: 'contrib-added',
      label: 'Al catálogo',
      caption: 'alfajores aprobados',
      value: profile.alfajoresAddedCount ?? 0,
    },
    {
      testid: 'contrib-likes',
      label: 'Likes recibidos',
      caption: 'en tus reseñas',
      value: profile.likesReceivedCount ?? 0,
    },
    {
      testid: 'contrib-score',
      label: 'Score medio',
      caption: 'de tus puntajes',
      value: profile.avgScore ?? 0,
      decimals: 1,
      empty: profile.avgScore == null,
    },
  ];

  return (
    <section>
      <span
        className="text-curry-deep block font-bold"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.66rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        Aportes a la comunidad
      </span>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric, i) => (
          <StaggerItem key={metric.testid} index={i}>
            <Num metric={metric} />
          </StaggerItem>
        ))}
      </div>
    </section>
  );
}
