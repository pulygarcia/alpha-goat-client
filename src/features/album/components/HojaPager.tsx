import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { AlbumHoja } from '../types/album.types';

/** Pager anterior/siguiente entre hojas: botones circulares + puntos indicadores. */
export function HojaPager({
  hojas,
  activeIndex,
  onNavigate,
}: {
  hojas: AlbumHoja[];
  activeIndex: number;
  onNavigate: (marcaId: string) => void;
}) {
  const prev = hojas[activeIndex - 1];
  const current = hojas[activeIndex];
  const next = hojas[activeIndex + 1];

  if (!current) return null;

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        aria-label="Hoja anterior"
        disabled={!prev}
        onClick={() => prev && onNavigate(prev.marca.id)}
        className="bg-curry text-sienna hover:bg-curry-bright disabled:hover:bg-curry inline-flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
      </button>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {hojas.map((hoja, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={hoja.marca.id}
              type="button"
              aria-label={`Ir a la hoja de ${hoja.marca.nombre}`}
              aria-current={active}
              onClick={() => onNavigate(hoja.marca.id)}
              className={cn(
                'cursor-pointer rounded-full transition-all',
                active
                  ? 'bg-cinnamon h-2.5 w-2.5'
                  : 'bg-ink/20 hover:bg-ink/35 h-2 w-2',
              )}
            />
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Hoja siguiente"
        disabled={!next}
        onClick={() => next && onNavigate(next.marca.id)}
        className="bg-curry text-sienna hover:bg-curry-bright disabled:hover:bg-curry inline-flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={2.4} />
      </button>
    </div>
  );
}
