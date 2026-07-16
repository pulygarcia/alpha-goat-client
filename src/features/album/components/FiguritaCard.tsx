import Link from 'next/link';
import { cn } from '@/shared/lib/utils';
import type { AlbumFigurita } from '../types/album.types';

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
        collected ? 'bg-paper-raised' : 'bg-paper-sunken',
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
          )}
          style={{
            backgroundImage: figurita.imagenUrl
              ? `url(${figurita.imagenUrl})`
              : 'linear-gradient(135deg, #b86015, #f4a02b 60%, #f6c977)',
          }}
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
            Sin conseguir
          </span>
        )}

        {collected && (
          <span className="text-curry absolute top-2 right-2 font-archivo text-[15px] drop-shadow-[0_1px_4px_rgba(74,30,8,0.5)]">
            {figurita.myRating}
          </span>
        )}
      </div>
    </Link>
  );
}
