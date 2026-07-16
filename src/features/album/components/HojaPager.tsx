import type { AlbumHoja } from '../types/album.types';

/** Pager anterior/siguiente entre hojas, con la posición actual al centro. */
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
    <div className="bg-paper-raised flex items-center justify-between gap-3 rounded-2xl p-3.5 shadow-[0_14px_32px_-20px_rgba(74,30,8,0.45)] md:p-4">
      <button
        type="button"
        disabled={!prev}
        onClick={() => prev && onNavigate(prev.marca.id)}
        className="text-ink cursor-pointer rounded-full border border-[rgba(74,30,8,0.2)] px-4 py-2.5 text-[12px] font-semibold tracking-wide uppercase disabled:cursor-not-allowed disabled:opacity-30"
      >
        {prev ? `← ${prev.marca.nombre}` : '← Anterior'}
      </button>

      <div className="text-center">
        <p className="font-archivo text-[15px]">
          Hoja {activeIndex + 1} de {hojas.length}
        </p>
        <p className="text-ink/55 font-mono text-[10px] tracking-[0.24em] uppercase">
          {current.marca.nombre}
          {current.marca.provincia ? ` · ${current.marca.provincia}` : ''}
        </p>
      </div>

      <button
        type="button"
        disabled={!next}
        onClick={() => next && onNavigate(next.marca.id)}
        className="bg-curry text-sienna cursor-pointer rounded-full px-5 py-2.5 text-[12px] font-semibold tracking-wide uppercase shadow-[0_8px_24px_-8px_rgba(244,160,43,0.6)] disabled:cursor-not-allowed disabled:opacity-30"
      >
        {next ? `${next.marca.nombre} →` : 'Siguiente →'}
      </button>
    </div>
  );
}
