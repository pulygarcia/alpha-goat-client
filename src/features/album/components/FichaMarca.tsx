import type { AlbumHoja } from '../types/album.types';

function initials(nombre: string): string {
  const words = nombre.split(' ').filter(Boolean);

  // If multiple words, take first letter of each (up to 2)
  if (words.length > 1) {
    return words.slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');
  }

  // If single word, take first 2 characters
  return nombre.slice(0, 2).toUpperCase();
}

/**
 * Relleno editorial para hojas con 1-2 figuritas: en vez de dejar la grilla
 * vacía, una "ficha de marca" que completa el layout con datos atmosféricos.
 * Solo decorativa, sin link ni fetch propio.
 */
export function FichaMarca({
  marca,
  total,
}: {
  marca: AlbumHoja['marca'];
  total: number;
}) {
  return (
    <aside className="bg-paper-sunken flex flex-col justify-between rounded-xl border border-[rgba(74,30,8,0.12)] p-4">
      <div>
        <div className="border-ink/40 text-ink/55 mb-3 flex h-14 w-14 -rotate-6 items-center justify-center rounded-full border-2 border-dashed font-archivo text-lg">
          {initials(marca.nombre)}
        </div>
        <p className="text-ink/70 font-mono text-[10px] tracking-[0.24em] uppercase">
          Ficha de marca
        </p>
        <p className="text-ink/70 mt-2 text-[13px] leading-relaxed">
          Edición corta: {total} figurita{total === 1 ? '' : 's'} en catálogo.
        </p>
      </div>
      {marca.provincia && (
        <p className="mt-3 font-archivo text-[14px] tracking-tight">
          {marca.provincia.toUpperCase()} · AR
        </p>
      )}
    </aside>
  );
}
