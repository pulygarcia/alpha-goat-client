import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import type { AlbumHoja } from '../types/album.types';

/** Índice de hojas como pills scrolleables horizontalmente. */
export function MarcaIndex({
  hojas,
  activeMarcaId,
  onSelect,
}: {
  hojas: AlbumHoja[];
  activeMarcaId: string;
  onSelect: (marcaId: string) => void;
}) {
  return (
    <ScrollArea className="w-full pb-3 whitespace-nowrap">
      <div className="flex gap-2.5 py-1">
        {hojas.map((hoja) => {
          const active = hoja.marca.id === activeMarcaId;
          const full = hoja.stats.pct === 100;

          return (
            <button
              key={hoja.marca.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(hoja.marca.id)}
              className={cn(
                'flex flex-none cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-medium whitespace-nowrap',
                active
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper-raised text-ink border-[rgba(74,30,8,0.14)]',
              )}
            >
              {hoja.marca.nombre}
              <span
                className={cn(
                  'font-mono text-[10px]',
                  full ? 'text-[#7dd693]' : active ? 'text-curry' : 'text-cinnamon',
                )}
              >
                {hoja.stats.pct}%
              </span>
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
