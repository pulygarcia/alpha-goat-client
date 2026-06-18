import { toast } from 'sonner';

/** Notificación de éxito compartida. Las features usan esto, no `sonner` directo. */
export function notifySuccess(message: string): void {
  toast.success(message);
}

/** Notificación de error compartida. */
export function notifyError(message: string): void {
  toast.error(message);
}
