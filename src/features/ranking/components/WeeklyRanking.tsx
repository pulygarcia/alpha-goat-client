'use client';

import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  RailLead,
  RailMoreLink,
  RailNumeral,
  RailTailRow,
} from '@/shared/components/rail/RailLead';
import { RailSection } from '@/shared/components/rail/RailSection';
import { useWeeklyRanking } from '../hooks/useWeeklyRanking';
import type { WeeklyTrend } from '../types/ranking.types';

// El back sólo manda la dirección (el delta crudo no se expone).
const TREND_LABEL: Record<WeeklyTrend, string> = {
  up: '▲',
  down: '▼',
  same: '=',
  new: 'nuevo',
};

const TREND_CLASS: Record<WeeklyTrend, string> = {
  up: 'text-reward',
  down: 'text-error',
  same: 'text-cinnamon',
  new: 'text-curry-deep',
};

/**
 * "23 jul – 29 jul": la ventana del ranking es de 7 días corridos hasta hoy, no
 * la semana calendario. Se calcula en el cliente porque el endpoint devuelve
 * los items pelados, sin período.
 */
function weekRange(): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - 6);
  return `${fmt(from)} – ${fmt(to)}`;
}

export function WeeklyRanking() {
  const { data, isLoading, isError } = useWeeklyRanking();

  const [lead, ...tail] = data ?? [];

  return (
    <RailSection title="Ranking semanal" meta={weekRange()}>
      {isLoading && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <RailNumeral muted>1</RailNumeral>
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-[13px] w-full" />
              <Skeleton className="h-[9px] w-[55%]" />
            </div>
          </div>
          <div className="flex flex-col gap-[9px]">
            <Skeleton className="h-[9px] w-[88%]" />
            <Skeleton className="h-[9px] w-[72%]" />
            <Skeleton className="h-[9px] w-[80%]" />
          </div>
        </div>
      )}

      {isError && (
        <p className="text-gris-400 text-[13px] leading-relaxed">
          No pudimos cargar el ranking semanal.
        </p>
      )}

      {data && data.length === 0 && (
        <p className="text-gris-400 text-[13px] leading-relaxed">
          Todavía no hay suficientes reseñas esta semana.
        </p>
      )}

      {lead && (
        <div className="flex flex-col gap-4">
          <RailLead
            href={`/alfajores/${lead.id}`}
            lead={<RailNumeral>1</RailNumeral>}
            title={lead.nombre}
            meta={
              <>
                <span className={TREND_CLASS[lead.trend]}>
                  {TREND_LABEL[lead.trend]}
                </span>{' '}
                · {lead.marca.nombre}
              </>
            }
            value={lead.score.toFixed(1)}
          />

          <div className="flex flex-col gap-[7px] pt-[2px]">
            {tail.map((item, i) => (
              <RailTailRow
                key={item.id}
                href={`/alfajores/${item.id}`}
                pos={i + 2}
                title={item.nombre}
                value={item.score.toFixed(1)}
              />
            ))}
            <RailMoreLink href="/ranking">Ver ranking completo →</RailMoreLink>
          </div>
        </div>
      )}
    </RailSection>
  );
}
