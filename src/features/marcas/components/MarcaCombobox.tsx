'use client';

import { useId, useState } from 'react';
import { Search } from 'lucide-react';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useMarcasSearch } from '../hooks/useMarcasSearch';
import type { Marca } from '../types/marcas.types';

/**
 * Selector de marca con búsqueda (debounced) contra `GET /marcas?q=`. Controlado:
 * `value` es la marca elegida (o null). Al tipear se limpia la selección y se
 * vuelve a buscar; elegir una opción la fija y cierra la lista. Mismo patrón
 * visual que el buscador de alfajores del QuickReviewModal.
 */
export function MarcaCombobox({
  value,
  onChange,
}: {
  value: Marca | null;
  onChange: (marca: Marca | null) => void;
}) {
  const [text, setText] = useState('');
  const q = useDebouncedValue(text, 300).trim();
  const { data: marcas = [], isLoading } = useMarcasSearch(value ? '' : q);
  const listId = useId();

  const showList = !value && q.length > 0;

  function handleType(next: string) {
    if (value) onChange(null);
    setText(next);
  }

  function pick(marca: Marca) {
    onChange(marca);
    setText('');
  }

  return (
    <div className="relative">
      <label className="bg-paper-sunken focus-within:border-cinnamon flex h-11 items-center gap-2 rounded-[10px] border-[1.5px] border-[rgba(74,30,8,0.22)] px-3 transition-colors">
        <Search className="text-cinnamon h-4 w-4" strokeWidth={2} />
        <input
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          type="text"
          value={value ? value.nombre : text}
          onChange={(e) => handleType(e.target.value)}
          placeholder="Buscar marca por nombre"
          className="text-ink h-full flex-1 bg-transparent text-[14px] placeholder:text-[rgba(44,18,9,0.55)] focus:outline-none"
        />
      </label>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="bg-paper-raised absolute z-10 mt-1 max-h-[40vh] w-full overflow-y-auto rounded-[10px] border border-[rgba(74,30,8,0.18)] py-1 shadow-[0_18px_36px_-22px_rgba(44,18,9,0.5)]"
        >
          {isLoading && (
            <li className="text-sienna px-3 py-2 text-[13px]">Buscando...</li>
          )}

          {!isLoading && marcas.length === 0 && (
            <li className="text-sienna px-3 py-2 text-[13px]">
              No encontramos “{q}”.
            </li>
          )}

          {marcas.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => pick(m)}
                className="hover:bg-paper-sunken flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors"
              >
                <span className="text-ink text-[14px]">{m.nombre}</span>
                {m.provincia && (
                  <span className="text-cinnamon shrink-0 text-[12px]">
                    {m.provincia}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
