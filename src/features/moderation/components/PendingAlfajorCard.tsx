'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Alfajor } from '@/features/alfajores/types/alfajores.types';
import { useModerateAlfajor } from '../hooks/useModerateAlfajor';
import { RejectAlfajorDialog } from './RejectAlfajorDialog';

/** "CHOCOLATE" → "Chocolate". */
function tipoLabel(tipo: string) {
  return tipo.charAt(0) + tipo.slice(1).toLowerCase();
}

/** Card de la cola de moderación: datos del alfajor + Aprobar / Rechazar. */
export function PendingAlfajorCard({ alfajor }: { alfajor: Alfajor }) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const moderate = useModerateAlfajor();

  return (
    <article className="bg-paper-raised flex items-center gap-4 rounded-[14px] border border-[rgba(74,30,8,0.14)] p-4">
      <div className="bg-paper-sunken relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[10px]">
        {alfajor.imagenUrl ? (
          <Image
            src={alfajor.imagenUrl}
            alt={alfajor.nombre}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div
            className="text-cinnamon flex h-full w-full items-center justify-center text-center text-[0.5rem] leading-tight tracking-[0.14em] uppercase"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {tipoLabel(alfajor.tipo)}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-ink truncate text-[15px] leading-tight font-semibold">
          {alfajor.nombre}
        </h3>
        <p className="text-sienna truncate text-[12.5px]">
          {alfajor.marca?.nombre ?? 'Marca desconocida'}
          {alfajor.marca?.provincia ? ` · ${alfajor.marca.provincia}` : ''}
          {' · '}
          {tipoLabel(alfajor.tipo)}
        </p>
        <p className="text-sienna/70 text-[12px]">
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
          className="text-paper inline-flex h-9 items-center rounded-[10px] bg-gradient-to-br from-[#a86432] to-[#3a1808] px-3 text-[12.5px] font-semibold tracking-[0.04em] uppercase transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Aprobar
        </button>
        <button
          type="button"
          disabled={moderate.isPending}
          onClick={() => setRejectOpen(true)}
          className="text-sienna hover:bg-paper-sunken hover:text-ink inline-flex h-9 items-center rounded-[10px] border border-[rgba(74,30,8,0.22)] px-3 text-[12.5px] font-semibold tracking-[0.04em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          Rechazar
        </button>
      </div>

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
