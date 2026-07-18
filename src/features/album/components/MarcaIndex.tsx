'use client';

import { useRef } from 'react';
import { cn } from '@/shared/lib/utils';
import type { AlbumHoja } from '../types/album.types';

/** Índice de hojas: pills navegables por drag horizontal (sin scrollbar visible). */
export function MarcaIndex({
  hojas,
  activeMarcaId,
  onSelect,
}: {
  hojas: AlbumHoja[];
  activeMarcaId: string;
  onSelect: (marcaId: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };
    el.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el || !drag.current.active) return;
    const delta = e.clientX - drag.current.startX;
    if (Math.abs(delta) > 3) drag.current.moved = true;
    el.scrollLeft = drag.current.startScrollLeft - delta;
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    drag.current.active = false;
    el?.releasePointerCapture?.(e.pointerId);
  }

  function handleSelect(marcaId: string) {
    // Evita que soltar el drag sobre una pill dispare su click.
    if (drag.current.moved) {
      drag.current.moved = false;
      return;
    }
    onSelect(marcaId);
  }

  return (
    <div
      ref={scrollRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      className="no-scrollbar flex cursor-grab gap-2.5 overflow-x-auto py-1 pb-3 select-none active:cursor-grabbing"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {hojas.map((hoja) => {
        const active = hoja.marca.id === activeMarcaId;
        const full = hoja.stats.pct === 100;

        return (
          <button
            key={hoja.marca.id}
            type="button"
            aria-pressed={active}
            onClick={() => handleSelect(hoja.marca.id)}
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
                full
                  ? 'text-[#7dd693]'
                  : active
                    ? 'text-curry'
                    : 'text-cinnamon',
              )}
            >
              {hoja.stats.pct}%
            </span>
          </button>
        );
      })}
    </div>
  );
}
