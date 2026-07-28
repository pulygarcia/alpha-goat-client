'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  rejectAlfajorSchema,
  type RejectAlfajorValues,
} from '../schemas/rejectAlfajor.schema';

interface RejectAlfajorDialogProps {
  alfajorNombre: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (rejectionReason: string) => void;
  isPending: boolean;
}

/** Pide el motivo del rechazo (1–500) antes de mandarlo al back. */
export function RejectAlfajorDialog({
  alfajorNombre,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: RejectAlfajorDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RejectAlfajorValues>({
    resolver: zodResolver(rejectAlfajorSchema),
    defaultValues: { rejectionReason: '' },
  });

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-blanco text-ink border-gris-50 sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Rechazar “{alfajorNombre}”</DialogTitle>
          <DialogDescription className="text-gris-400">
            El motivo queda registrado junto al alfajor rechazado.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => onConfirm(values.rejectionReason))}
          className="flex flex-col gap-3"
        >
          <textarea
            {...register('rejectionReason')}
            rows={4}
            maxLength={500}
            placeholder="Ej: duplicado de un alfajor ya cargado"
            aria-label="Motivo del rechazo"
            className="bg-blanco-tibio text-ink placeholder:text-gris-300 border-gris-50 focus:border-gris-200 w-full resize-none rounded-[10px] border px-3 py-2 text-[14px] outline-none"
          />
          {errors.rejectionReason && (
            <p role="alert" className="text-[13px] text-red-700">
              {errors.rejectionReason.message}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="text-blanco-tibio inline-flex h-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#a86432] to-[#3a1808] px-4 text-[13px] font-semibold tracking-[0.04em] uppercase transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Rechazando…' : 'Confirmar rechazo'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
