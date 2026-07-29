'use client';

import Image from 'next/image';
import { NoPhoto } from '@/shared/components/media/NoPhoto';
import { RailLead } from '@/shared/components/rail/RailLead';
import { RailSection } from '@/shared/components/rail/RailSection';
import { useWorstRated } from '../hooks/useWorstRated';

/**
 * Bloque editorial "El peor votado" del rail del feed. Es contenido
 * accesorio: ante loading/error/204 no renderiza nada (el rail no debe
 * romperse ni mostrar un skeleton por esto).
 *
 * El slot izquierdo lleva la foto y no el numeral grande del diseño: la
 * posición de cola no la manda el back (haría falta el total del ranking) y
 * un número inventado ahí sería peor que no tenerlo.
 */
export function WorstRatedCard() {
  const { data, isLoading, isError } = useWorstRated();

  if (isLoading || isError || !data) return null;

  return (
    <RailSection title="El peor votado" meta={`${data.reviewsCount} reseñas`}>
      <RailLead
        href={`/alfajores/${data.id}`}
        lead={
          <div className="border-gris-50 bg-gris-25 relative h-11 w-11 overflow-hidden rounded-[10px] border">
            {data.imagenUrl ? (
              <Image
                src={data.imagenUrl}
                alt={data.nombre}
                fill
                sizes="44px"
                className="object-cover"
              />
            ) : (
              <NoPhoto size="sm" />
            )}
          </div>
        }
        title={data.nombre}
        meta={data.marca.nombre}
        value={data.score.toFixed(1)}
        valueClassName="text-gris-300"
      />
    </RailSection>
  );
}
