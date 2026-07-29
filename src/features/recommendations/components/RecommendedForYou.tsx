'use client';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { RailLead, RailTailRow } from '@/shared/components/rail/RailLead';
import { RailSection } from '@/shared/components/rail/RailSection';
import { useRecommendations } from '../hooks/useRecommendations';

/** Cold start: matchPct null → recomendado por calidad, sin afinidad que mostrar. */
function pct(matchPct: number | null): string | undefined {
  return matchPct === null ? undefined : `${Math.round(matchPct)}%`;
}

export function RecommendedForYou() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useRecommendations();

  // El bloque no tiene sentido para un invitado: no se muestra.
  if (!user) return null;

  const [lead, ...tail] = data ?? [];

  return (
    <RailSection
      title="Recomendado para vos"
      meta={data && data.length > 0 ? String(data.length) : undefined}
    >
      {isLoading && (
        <div className="flex items-start gap-3.5">
          <Skeleton className="h-11 w-11 flex-none rounded-[10px]" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-[13px] w-full" />
            <Skeleton className="h-[9px] w-[70%]" />
          </div>
        </div>
      )}

      {isError && (
        <p className="text-gris-400 text-[13px] leading-relaxed">
          No pudimos cargar tus recomendaciones.
        </p>
      )}

      {data && data.length === 0 && (
        <p className="text-gris-400 text-[13px] leading-relaxed">
          Reseñá algunos alfajores y te recomendamos según tu gusto.
        </p>
      )}

      {lead && (
        <div className="flex flex-col gap-4">
          {/* Sin slot izquierdo: el endpoint de recomendaciones no trae
              imagenUrl, así que una miniatura sería siempre el placeholder
              vacío. El nombre arranca al ras del borde. */}
          <RailLead
            href={`/alfajores/${lead.id}`}
            title={lead.nombre}
            meta={lead.marca.nombre}
            value={pct(lead.matchPct)}
          />

          {tail.length > 0 && (
            <div className="flex flex-col gap-[7px]">
              {tail.map((item) => (
                <RailTailRow
                  key={item.id}
                  href={`/alfajores/${item.id}`}
                  title={item.nombre}
                  value={pct(item.matchPct)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </RailSection>
  );
}
