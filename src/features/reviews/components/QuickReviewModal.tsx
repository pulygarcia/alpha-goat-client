'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useAlfajores } from '@/features/alfajores/hooks/useAlfajores';
import { ReviewWizardForm } from './ReviewWizardForm';
import type { Alfajor } from '@/features/alfajores/types/alfajores.types';

/**
 * Modal de "reseña rápida": un wizard que elige un alfajor (buscador) y deja
 * reseñarlo ahí mismo (comentario → puntajes + foto). Si recibe `alfajor`
 * (desde el detalle), se saltea el paso de elegir. Controlado por `open`.
 */
export function QuickReviewModal({
  open,
  onOpenChange,
  alfajor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alfajor?: Alfajor;
}) {
  const [selected, setSelected] = useState<Alfajor | null>(alfajor ?? null);

  // Al cerrar, vuelve al estado inicial (preselección o picker) para que el
  // próximo open arranque limpio — sin un effect que sincronice `open`.
  function handleOpenChange(next: boolean) {
    if (!next) setSelected(alfajor ?? null);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-paper-raised text-ink max-w-md border-[rgba(74,30,8,0.22)]">
        <DialogHeader>
          <DialogTitle className="text-ink text-[20px] font-semibold tracking-[-0.02em]">
            {selected ? selected.nombre : 'Reseñá un alfajor'}
          </DialogTitle>
          <DialogDescription className="text-sienna">
            {selected
              ? 'Contanos qué te pareció.'
              : 'Buscá el que probaste y dejá tu reseña.'}
          </DialogDescription>
        </DialogHeader>

        {selected ? (
          <ReviewWizardForm
            alfajor={selected}
            onBack={alfajor ? undefined : () => setSelected(null)}
            onDone={() => handleOpenChange(false)}
          />
        ) : (
          <AlfajorPicker onPick={setSelected} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AlfajorPicker({ onPick }: { onPick: (a: Alfajor) => void }) {
  const [search, setSearch] = useState('');
  const q = useDebouncedValue(search, 300).trim();
  const { data, isLoading } = useAlfajores(q ? { q } : {});
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <>
      <label className="bg-paper-sunken focus-within:border-cinnamon flex h-11 items-center gap-2 rounded-[10px] border-[1.5px] border-[rgba(74,30,8,0.22)] px-3 transition-colors">
        <Search className="text-cinnamon h-4 w-4" strokeWidth={2} />
        <input
          type="search"
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar alfajor por nombre"
          className="text-ink h-full flex-1 bg-transparent text-[14px] placeholder:text-[rgba(44,18,9,0.55)] focus:outline-none"
        />
      </label>

      <div className="-mr-1 max-h-[44vh] overflow-y-auto pr-1">
        {isLoading && (
          <p className="text-sienna px-1 py-3 text-[13px]">Buscando...</p>
        )}

        {!isLoading && items.length === 0 && q && (
          <p className="text-sienna px-1 py-3 text-[13px]">
            No encontramos “{q}”.
          </p>
        )}

        <ul className="flex flex-col">
          {items.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onPick(a)}
                className="hover:bg-paper-sunken flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-[10px] text-left transition-colors"
              >
                <span className="text-ink text-[14px] font-medium">
                  {a.nombre}
                </span>
                <span
                  className="text-cinnamon shrink-0"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  {a.marca?.nombre ?? ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sienna border-t border-[rgba(74,30,8,0.14)] pt-3 text-[13px]">
        ¿No lo encontrás?{' '}
        <span className="text-curry-deep font-semibold">
          Solicitá agregarlo
        </span>{' '}
        <span className="text-cinnamon">(pronto)</span>
      </p>
    </>
  );
}
