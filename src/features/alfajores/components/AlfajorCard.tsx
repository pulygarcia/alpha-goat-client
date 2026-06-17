import Image from 'next/image';
import Link from 'next/link';
import type { Alfajor } from '../types/alfajores.types';

/** "CHOCOLATE" → "Chocolate". */
function tipoLabel(tipo: string) {
  return tipo.charAt(0) + tipo.slice(1).toLowerCase();
}

export function AlfajorCard({ alfajor }: { alfajor: Alfajor }) {
  const { id, nombre, tipo, imagenUrl, marca } = alfajor;

  return (
    <Link
      href={`/alfajores/${id}`}
      className="group bg-paper-raised flex flex-col overflow-hidden rounded-[14px] border border-[rgba(74,30,8,0.14)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-22px_rgba(44,18,9,0.5)]"
    >
      <div className="bg-paper-sunken relative aspect-[4/3] w-full overflow-hidden">
        {imagenUrl ? (
          <Image
            src={imagenUrl}
            alt={nombre}
            fill
            sizes="(max-width: 640px) 50vw, 280px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="text-cinnamon flex h-full w-full items-center justify-center text-[0.62rem] tracking-[0.22em] uppercase"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {tipoLabel(tipo)}
          </div>
        )}
        <span
          className="bg-paper/90 text-curry-deep absolute top-2 left-2 rounded-full px-2 py-[3px] text-[0.55rem] font-bold tracking-[0.16em] uppercase backdrop-blur-sm"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {tipoLabel(tipo)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-ink text-[15px] leading-tight font-semibold tracking-[-0.01em]">
          {nombre}
        </h3>
        <p className="text-sienna text-[12.5px]">
          {marca?.nombre ?? 'Marca desconocida'}
          {marca?.provincia ? ` · ${marca.provincia}` : ''}
        </p>
      </div>
    </Link>
  );
}
