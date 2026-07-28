'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { UserAvatar } from '@/shared/components/UserAvatar';

interface UnfollowConfirmDialogProps {
  /** Sólo para el copy; si no se conoce, el texto cae a una forma genérica. */
  username?: string;
  avatarUrl?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}

/**
 * Confirmación antes de dejar de seguir. Seguir es reversible y no molesta,
 * pero dejar de seguir suele ser un click accidental sobre "Siguiendo" — por
 * eso el gate va sólo en esa dirección.
 */
export function UnfollowConfirmDialog({
  username,
  avatarUrl,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: UnfollowConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-blanco text-ink data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 border-gris-50 duration-[250ms] sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-[19px] tracking-[-0.02em]">
            {username && (
              <UserAvatar
                avatarUrl={avatarUrl ?? null}
                username={username}
                className="border-gris-50 h-10 w-10 shrink-0 rounded-full border object-cover"
              />
            )}
            <span>
              {username
                ? `¿Dejar de seguir a ${username}?`
                : '¿Dejar de seguir?'}
            </span>
          </DialogTitle>
          <DialogDescription className="text-gris-400 text-[13.5px]">
            Sus reseñas van a dejar de aparecerte en el feed de “Siguiendo”.
            Podés volver a seguirlo cuando quieras.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-gris-400 hover:bg-gris-25 border-gris-50 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="bg-error text-blanco-tibio rounded-full px-4 py-2 text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? 'Saliendo...' : 'Dejar de seguir'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
