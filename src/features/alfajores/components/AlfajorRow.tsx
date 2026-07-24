import Image from 'next/image';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import type { Alfajor } from '../types/alfajores.types';

/** Barrita horizontal compacta del catálogo: foto chica + nombre/marca. Sin tipo. */
export function AlfajorRow({ alfajor }: { alfajor: Alfajor }) {
  const { id, nombre, imagenUrl, marca } = alfajor;

  return (
    <Link
      href={`/alfajores/${id}`}
      style={{ boxShadow: '0 0.5px 0 0 rgba(74,30,8,0.14)' }}
      className="group -mx-2 flex items-center gap-3 rounded-[10px] px-2 py-2.5 transition-colors hover:bg-black/[0.03]"
    >
      <div className="bg-paper-sunken relative h-11 w-11 flex-none overflow-hidden rounded-[9px]">
        {imagenUrl ? (
          <Image
            src={imagenUrl}
            alt={nombre}
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : (
          <div className="text-cinnamon/50 flex h-full w-full items-center justify-center">
            <Cookie className="h-5 w-5" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-ink group-hover:text-curry-deep truncate text-[14px] font-semibold tracking-[-0.01em] transition-colors">
          {nombre}
        </h3>
        <p className="text-sienna truncate text-[12.5px]">
          {marca?.nombre ?? 'Marca desconocida'}
          {marca?.provincia ? ` · ${marca.provincia}` : ''}
        </p>
      </div>
    </Link>
  );
}
