'use client';

import { useId, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useMarcasSearch } from '../hooks/useMarcasSearch';
import type { Marca } from '../types/marcas.types';

/**
 * Marca elegida. `catalogo` es una marca que existe; `libre` es un nombre que
 * el usuario escribió porque no la encontró — el alfajor queda sin marca hasta
 * que un admin la resuelve al aprobar.
 */
export type MarcaSelection =
  | { kind: 'catalogo'; marca: Marca }
  | { kind: 'libre'; nombre: string };

/** Largo del nombre libre que acepta el back (`CreateAlfajorDto`). */
const FREE_MIN = 2;
const FREE_MAX = 120;

/**
 * Selector de marca con búsqueda (debounced) contra `GET /marcas?q=`. Controlado:
 * `value` es la marca elegida (o null). Al tipear se limpia la selección y se
 * vuelve a buscar; elegir una opción la fija y cierra la lista. Mismo patrón
 * visual que el buscador de alfajores del QuickReviewModal.
 *
 * Con `allowFree`, el estado vacío de la lista deja de ser un cartel muerto y
 * pasa a ser la salida: "usar X como marca nueva". Va ahí y no en un link fijo
 * bajo el campo porque recién tiene sentido cuando la búsqueda falló — el
 * caso normal es que la marca exista, y un control permanente competiría con
 * el buscador en un form que ya tiene cuatro campos.
 */
export function MarcaCombobox({
  value,
  onChange,
  allowFree = false,
}: {
  value: MarcaSelection | null;
  onChange: (value: MarcaSelection | null) => void;
  /** Habilita proponer una marca que no está en el catálogo. */
  allowFree?: boolean;
}) {
  const [text, setText] = useState('');
  const q = useDebouncedValue(text, 300).trim();
  const { data: marcas = [], isLoading } = useMarcasSearch(value ? '' : q);
  const listId = useId();

  const showList = !value && q.length > 0;
  const empty = !isLoading && marcas.length === 0;
  // El back rechaza fuera de rango; no ofrecemos una salida que va a fallar.
  const canUseFree = allowFree && q.length >= FREE_MIN && q.length <= FREE_MAX;

  const selectedText =
    value === null
      ? text
      : value.kind === 'catalogo'
        ? value.marca.nombre
        : value.nombre;

  function handleType(next: string) {
    if (value) onChange(null);
    setText(next);
  }

  function pick(next: MarcaSelection) {
    onChange(next);
    setText('');
  }

  return (
    <div className="relative">
      <label className="bg-gris-25 border-gris-50 focus-within:border-gris-200 flex h-12 items-center gap-2.5 rounded-[10px] border px-3 transition-colors">
        <Search className="text-gris-300 h-4 w-4" strokeWidth={2} />
        <input
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          type="text"
          value={selectedText}
          onChange={(e) => handleType(e.target.value)}
          placeholder="Buscar marca por nombre"
          className="text-ink placeholder:text-gris-300 h-full flex-1 bg-transparent text-[14px] focus:outline-none"
        />

        {/* La marca libre no existe todavía: sin el rótulo, el campo se lee
            igual que si el usuario hubiera elegido una del catálogo. */}
        {value?.kind === 'libre' && (
          <>
            <span
              className="text-cinnamon shrink-0 text-[9.5px] tracking-[0.16em] uppercase"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Marca nueva
            </span>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Quitar la marca nueva"
              className="text-gris-300 hover:text-ink shrink-0 transition-colors"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </>
        )}
      </label>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="bg-blanco-tibio border-gris-50 shadow-lift absolute z-10 mt-1 max-h-[40vh] w-full overflow-y-auto rounded-[10px] border py-1"
        >
          {isLoading && (
            <li className="text-gris-400 px-3 py-2 text-[13px]">Buscando...</li>
          )}

          {empty && !canUseFree && (
            <li className="text-gris-400 px-3 py-2 text-[13px]">
              No encontramos “{q}”.
            </li>
          )}

          {marcas.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => pick({ kind: 'catalogo', marca: m })}
                className="hover:bg-gris-25 flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors"
              >
                <span className="text-ink text-[14px]">{m.nombre}</span>
                {m.provincia && (
                  <span
                    className="text-gris-300 shrink-0 text-[10px] tracking-[0.14em] uppercase"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {m.provincia}
                  </span>
                )}
              </button>
            </li>
          ))}

          {canUseFree && (
            <li
              className={
                marcas.length > 0 ? 'border-gris-50 mt-1 border-t pt-1' : ''
              }
            >
              <button
                type="button"
                onClick={() => pick({ kind: 'libre', nombre: q })}
                className="hover:bg-gris-25 flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors"
              >
                <Plus
                  className="text-cinnamon h-3.5 w-3.5 shrink-0"
                  strokeWidth={2.5}
                />
                <span className="text-ink truncate text-[14px]">
                  Usar “{q}” como marca nueva
                </span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
