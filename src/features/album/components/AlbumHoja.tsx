import { StaggerItem } from '@/shared/components/motion/StaggerItem';
import { FiguritaCard } from './FiguritaCard';
import { FichaMarca } from './FichaMarca';
import { HojaProgressGauge } from './HojaProgressGauge';
import type { AlbumHoja as AlbumHojaType } from '../types/album.types';

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
    <section className="relative overflow-hidden rounded-3xl p-6 md:px-0 md:py-9">
      <div className="relative flex items-end justify-between gap-4">
        <div>
          <p className="text-ink/55 font-mono text-[10px] tracking-[0.26em] uppercase">
            Hoja {String(index).padStart(2, '0')}
            {hoja.marca.provincia ? ` · ${hoja.marca.provincia}` : ''}
          </p>
          <h2 className="font-archivo mt-1 text-3xl tracking-tight md:text-4xl">
            {hoja.marca.nombre}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-archivo text-cinnamon text-2xl">
              {hoja.stats.collected}/{hoja.stats.total}
            </p>
            <p className="text-ink/55 font-mono text-[10px] tracking-[0.26em] uppercase">
              de la hoja
            </p>
          </div>
          <HojaProgressGauge pct={hoja.stats.pct} />
        </div>
      </div>

      <div className="mt-3.5 mb-7" />

      <div className="relative grid grid-cols-2 gap-4 px-3 md:grid-cols-3 md:gap-5 md:px-4">
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
