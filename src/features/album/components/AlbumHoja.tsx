import { StaggerItem } from '@/shared/components/motion/StaggerItem';
import { FiguritaCard } from './FiguritaCard';
import { FichaMarca } from './FichaMarca';
import type { AlbumHoja as AlbumHojaType } from '../types/album.types';

function initial(nombre: string): string {
  return nombre[0]?.toUpperCase() ?? '';
}

/** Una hoja de marca: header con progreso + grilla de figuritas (3 cols en md+, 2 en mobile). */
export function AlbumHoja({
  hoja,
  index,
}: {
  hoja: AlbumHojaType;
  index: number;
}) {
  const needsFiller = hoja.alfajores.length <= 2;

  return (
    <section className="bg-paper-raised relative overflow-hidden rounded-3xl p-6 shadow-[0_30px_80px_-30px_rgba(74,30,8,0.5)] md:p-9">
      <span
        aria-hidden
        className="text-ink/[0.05] pointer-events-none absolute -right-10 -bottom-24 font-archivo text-[340px] leading-none select-none"
      >
        {initial(hoja.marca.nombre)}
      </span>

      <div className="relative flex items-end justify-between gap-4">
        <div>
          <p className="text-ink/55 font-mono text-[10px] tracking-[0.26em] uppercase">
            Hoja {String(index).padStart(2, '0')}
            {hoja.marca.provincia ? ` · ${hoja.marca.provincia}` : ''}
          </p>
          <h2 className="mt-1 font-archivo text-3xl tracking-tight md:text-4xl">
            {hoja.marca.nombre}
          </h2>
        </div>
        <div className="text-right">
          <p className="font-archivo text-cinnamon text-2xl">
            {hoja.stats.collected}/{hoja.stats.total}
          </p>
          <p className="text-ink/55 font-mono text-[10px] tracking-[0.26em] uppercase">
            {hoja.stats.pct}% de la hoja
          </p>
        </div>
      </div>

      <div className="bg-paper-sunken relative mt-3.5 mb-7 h-2 overflow-hidden rounded-full">
        <div
          className="from-cinnamon to-curry h-full rounded-full bg-gradient-to-r"
          style={{ width: `${hoja.stats.pct}%` }}
        />
      </div>

      <div className="relative grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
        {hoja.alfajores.map((figurita, i) => (
          <StaggerItem key={figurita.id} index={i}>
            <FiguritaCard figurita={figurita} />
          </StaggerItem>
        ))}
        {needsFiller && (
          <FichaMarca marca={hoja.marca} total={hoja.alfajores.length} />
        )}
      </div>
    </section>
  );
}
