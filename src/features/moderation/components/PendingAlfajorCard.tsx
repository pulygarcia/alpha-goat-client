'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Alfajor } from '@/features/alfajores/types/alfajores.types';
import { NoPhoto } from '@/shared/components/media/NoPhoto';
import { useModerateAlfajor } from '../hooks/useModerateAlfajor';
import { LinkMarcaDialog } from './LinkMarcaDialog';
import { RejectAlfajorDialog } from './RejectAlfajorDialog';

/** "CHOCOLATE" → "Chocolate". */
function tipoLabel(tipo: string) {
  return tipo.charAt(0) + tipo.slice(1).toLowerCase();
}

/** Card de la cola de moderación: datos del alfajor + Aprobar / Rechazar. */
export function PendingAlfajorCard({ alfajor }: { alfajor: Alfajor }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const moderate = useModerateAlfajor();

  // Propuesta con marca libre: no hay marca que mostrar todavía, sino un
  // nombre a resolver. Se distingue en el card porque cambia lo que hace el
  // botón de aprobar (el back crea o reusa esa marca).
  const marcaPropuesta = alfajor.marcaNombrePropuesto;

  return (
    <article className="bg-blanco border-gris-50 flex items-center gap-4 rounded-[14px] border p-4">
      <div className="bg-gris-25 relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[10px]">
        {alfajor.imagenUrl ? (
          <Image
            src={alfajor.imagenUrl}
            alt={alfajor.nombre}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <NoPhoto size="sm" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-ink truncate text-[15px] leading-tight font-semibold">
          {alfajor.nombre}
        </h3>
        {marcaPropuesta ? (
          <p className="text-gris-400 flex min-w-0 items-center gap-1.5 text-[12.5px]">
            <span
              className="bg-ambar/15 text-cinnamon shrink-0 rounded-full px-2 py-0.5 text-[9.5px] tracking-[0.14em] uppercase"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Marca nueva
            </span>
            <span className="truncate">
              “{marcaPropuesta}” · {tipoLabel(alfajor.tipo)}
            </span>
          </p>
        ) : (
          <p className="text-gris-400 truncate text-[12.5px]">
            {alfajor.marca?.nombre ?? 'Marca desconocida'}
            {alfajor.marca?.provincia ? ` · ${alfajor.marca.provincia}` : ''}
            {' · '}
            {tipoLabel(alfajor.tipo)}
          </p>
        )}
        <p className="text-gris-300 text-[12px]">
          Propuesto el{' '}
          {new Date(alfajor.createdAt).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={moderate.isPending}
          onClick={() => moderate.mutate({ id: alfajor.id, action: 'approve' })}
          className="btn-solid inline-flex h-9 items-center rounded-[10px] px-3 text-[12.5px] font-semibold tracking-[0.04em] uppercase disabled:cursor-not-allowed disabled:opacity-60"
        >
          Aprobar
        </button>
        {marcaPropuesta && (
          <button
            type="button"
            disabled={moderate.isPending}
            onClick={() => setLinkOpen(true)}
            className="text-gris-400 hover:bg-gris-25 hover:text-ink border-gris-50 inline-flex h-9 items-center rounded-[10px] border px-3 text-[12.5px] font-semibold tracking-[0.04em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            Vincular
          </button>
        )}
        <button
          type="button"
          disabled={moderate.isPending}
          onClick={() => setRejectOpen(true)}
          className="text-gris-400 hover:bg-gris-25 hover:text-ink border-gris-50 inline-flex h-9 items-center rounded-[10px] border px-3 text-[12.5px] font-semibold tracking-[0.04em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          Rechazar
        </button>
      </div>

      {marcaPropuesta && (
        <LinkMarcaDialog
          marcaNombrePropuesto={marcaPropuesta}
          open={linkOpen}
          onOpenChange={setLinkOpen}
          isPending={moderate.isPending}
          onConfirm={(marcaId) =>
            moderate.mutate(
              { id: alfajor.id, action: 'approve', marcaId },
              { onSuccess: () => setLinkOpen(false) },
            )
          }
        />
      )}

      <RejectAlfajorDialog
        alfajorNombre={alfajor.nombre}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        isPending={moderate.isPending}
        onConfirm={(rejectionReason) =>
          moderate.mutate(
            { id: alfajor.id, action: 'reject', rejectionReason },
            { onSuccess: () => setRejectOpen(false) },
          )
        }
      />
    </article>
  );
}
