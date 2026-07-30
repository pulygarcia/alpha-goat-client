'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  MarcaCombobox,
  type MarcaSelection,
} from '@/features/marcas/components/MarcaCombobox';

interface LinkMarcaDialogProps {
  /** Nombre que propuso el usuario, para que el admin sepa qué está resolviendo. */
  marcaNombrePropuesto: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (marcaId: string) => void;
  isPending: boolean;
}

/**
 * Resuelve una propuesta de marca libre contra una marca del catálogo. Es el
 * camino de excepción: aprobar sin abrir esto ya crea o reusa la marca del
 * nombre propuesto, que es lo correcto salvo que el usuario haya escrito una
 * variante de una marca que ya existe ("havana" → Havanna).
 *
 * El combobox va sin `allowFree`: acá el punto es engancharla con una marca
 * existente, y escribir texto libre sería exactamente lo que ya hace el botón
 * de aprobar.
 */
export function LinkMarcaDialog({
  marcaNombrePropuesto,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: LinkMarcaDialogProps) {
  const [selection, setSelection] = useState<MarcaSelection | null>(null);
  const marcaId =
    selection?.kind === 'catalogo' ? selection.marca.id : undefined;

  function handleOpenChange(next: boolean) {
    if (!next) setSelection(null);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-blanco text-ink border-gris-50 sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Vincular “{marcaNombrePropuesto}”</DialogTitle>
          <DialogDescription className="text-gris-400">
            Elegí la marca del catálogo con la que se aprueba. Si no elegís
            ninguna, aprobar crea la marca con el nombre propuesto.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <MarcaCombobox value={selection} onChange={setSelection} />
          <button
            type="button"
            disabled={isPending || !marcaId}
            onClick={() => marcaId && onConfirm(marcaId)}
            className="btn-solid inline-flex h-10 items-center justify-center rounded-[10px] px-4 text-[13px] font-semibold tracking-[0.04em] uppercase disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Aprobando…' : 'Aprobar con esta marca'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
