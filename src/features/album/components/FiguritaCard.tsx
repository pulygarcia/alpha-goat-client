import Link from 'next/link';
import { cn } from '@/shared/lib/utils';
import type { AlbumFigurita } from '../types/album.types';

/** Color del sello de nota: dorado desde 8, neutral en el medio, rojo por debajo de 4. */
function ratingBadgeClasses(rating: number): string {
  if (rating >= 8) return 'bg-curry text-sienna';
  if (rating < 4) return 'bg-[#ff7a59] text-paper';
  return 'bg-ink text-paper';
}

/** Recorte tipo sello postal: 12 dientes triangulares alrededor del círculo. */
const SEAL_CLIP_PATH =
  'polygon(50% 0%, 59.83% 13.3%, 75% 6.7%, 76.87% 23.13%, 93.3% 25%, 86.7% 40.17%, 100% 50%, 86.7% 59.83%, 93.3% 75%, 76.87% 76.87%, 75% 93.3%, 59.83% 86.7%, 50% 100%, 40.17% 86.7%, 25% 93.3%, 23.13% 76.87%, 6.7% 75%, 13.3% 59.83%, 0% 50%, 13.3% 40.17%, 6.7% 25%, 23.13% 23.13%, 25% 6.7%, 40.17% 13.3%)';

/**
 * Una figurita del álbum, estilo "estampilla postal": borde perforado
 * (simulado con muescas semicirculares arriba y abajo), conseguida a color
 * con la nota del dueño como valor postal; sin conseguir en escala de grises
 * con tag rotado. Siempre linkea al detalle del alfajor.
 */
export function FiguritaCard({ figurita }: { figurita: AlbumFigurita }) {
  const { collected } = figurita;

  return (
    <Link
      href={`/alfajores/${figurita.id}`}
      className={cn(
        'group relative block p-2',
        collected
          ? 'bg-paper-raised shadow-[0_10px_22px_-12px_rgba(74,30,8,0.45)]'
          : 'bg-paper-sunken',
      )}
    >
      <div
        className={cn(
          'relative border p-2',
          collected ? 'border-[rgba(74,30,8,0.25)]' : 'border-dashed border-[rgba(74,30,8,0.35)]',
        )}
      >
        <div
          aria-hidden
          className={cn(
            'absolute -top-3 left-0 flex w-full justify-around',
            collected ? 'text-paper-raised' : 'text-paper-sunken',
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={`t-${i}`} className="bg-paper h-3 w-3 rounded-full" />
          ))}
        </div>
        <div
          aria-hidden
          className={cn(
            'absolute -bottom-3 left-0 flex w-full justify-around',
            collected ? 'text-paper-raised' : 'text-paper-sunken',
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={`b-${i}`} className="bg-paper h-3 w-3 rounded-full" />
          ))}
        </div>

        <div
          className={cn(
            'h-[110px] rounded-md bg-cover bg-center',
            !collected && 'grayscale',
            !figurita.imagenUrl && 'bg-gradient-to-br from-cinnamon via-curry to-curry-soft',
          )}
          style={figurita.imagenUrl ? { backgroundImage: `url(${figurita.imagenUrl})` } : undefined}
        />

        <h3
          className={cn(
            'mt-2 text-[13px] font-semibold tracking-tight',
            collected ? 'text-ink' : 'text-ink/45',
          )}
        >
          {figurita.nombre}
        </h3>

        <p
          className={cn(
            'font-mono text-[9px] tracking-[0.18em] uppercase',
            collected ? 'text-cinnamon' : 'text-ink/35',
          )}
        >
          {figurita.tipo}
          {figurita.avgRating !== null && ` · ★ ${figurita.avgRating}`}
        </p>

        {!collected && (
          <span className="bg-ink/80 text-paper absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded font-mono text-[9px] tracking-[0.2em] uppercase px-2.5 py-1">
            Faltante
          </span>
        )}
      </div>

      {collected && figurita.myRating !== null && (
        <span
          className={cn(
            'border-paper-raised absolute -top-3 -right-3 z-10 flex h-10 w-10 items-center justify-center border-[3px] font-archivo text-[13px]',
            ratingBadgeClasses(figurita.myRating),
          )}
          style={{ clipPath: SEAL_CLIP_PATH }}
        >
          {figurita.myRating}
        </span>
      )}
    </Link>
  );
}
