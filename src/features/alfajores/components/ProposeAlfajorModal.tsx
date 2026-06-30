'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { notifyError } from '@/shared/lib/toast';
import { ALFAJOR_TIPOS } from '@/shared/types/alfajor';
import { MarcaCombobox } from '@/features/marcas/components/MarcaCombobox';
import type { Marca } from '@/features/marcas/types/marcas.types';
import { useProposeAlfajor } from '../hooks/useProposeAlfajor';
import {
  proposeAlfajorSchema,
  type ProposeAlfajorForm,
} from '../schemas/proposeAlfajor.schema';

const inputClass =
  'w-full rounded-[10px] border border-[rgba(74,30,8,0.18)] bg-paper px-3 py-2 text-[14px] text-ink outline-none focus:border-[#3a1808]';
const labelClass = 'text-cinnamon mb-1 block text-[12px] font-semibold';
const errorClass = 'text-sienna mt-1 text-[12px]';
const submitClass =
  'text-paper mt-2 inline-flex h-10 w-full items-center justify-center rounded-[10px] bg-gradient-to-br from-[#3a1808] to-[#1c0a03] px-5 text-[13px] font-semibold tracking-[0.03em] uppercase transition-[filter] hover:brightness-125 disabled:opacity-60';

/** "CHOCOLATE" → "Chocolate". */
function tipoLabel(tipo: string) {
  return tipo.charAt(0) + tipo.slice(1).toLowerCase();
}

/**
 * Modal para proponer un alfajor nuevo. El alfajor nace PENDING (no entra al
 * catálogo público hasta que un admin lo apruebe), así que al enviar mostramos
 * una pantalla de confirmación in-modal en vez de devolver al flujo de reseña.
 * Un 409 (ya existe ese nombre+marca) se muestra inline; otros errores van a toast.
 */
export function ProposeAlfajorModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [marca, setMarca] = useState<Marca | null>(null);
  const propose = useProposeAlfajor();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProposeAlfajorForm>({
    resolver: zodResolver(proposeAlfajorSchema),
    defaultValues: { nombre: '', marcaId: '', tipo: undefined },
  });

  // Al cerrar, vuelve al estado inicial para que el próximo open arranque limpio.
  function handleOpenChange(next: boolean) {
    if (!next) {
      setSubmitted(false);
      setMarca(null);
      reset();
    }
    onOpenChange(next);
  }

  function pickMarca(next: Marca | null) {
    setMarca(next);
    setValue('marcaId', next?.id ?? '', { shouldValidate: true });
  }

  const onSubmit = handleSubmit((values) => {
    propose.mutate(values, {
      onSuccess: () => setSubmitted(true),
      onError: (err) => {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          setError('nombre', {
            message: 'Ese alfajor ya existe para esa marca.',
          });
          return;
        }
        notifyError('No pudimos enviar la propuesta');
      },
    });
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-paper-raised text-ink max-w-md border-[rgba(74,30,8,0.22)]">
        <DialogHeader>
          <DialogTitle className="text-ink">
            {submitted ? '¡Gracias!' : 'Proponer un alfajor'}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col gap-4">
            <p className="text-sienna text-[14px]">
              Quedó <strong>pendiente de aprobación</strong>. Lo revisamos y te
              avisamos cuando esté disponible para reseñar.
            </p>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className={submitClass}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
            <div>
              <label htmlFor="propose-nombre" className={labelClass}>
                Nombre
              </label>
              <input
                id="propose-nombre"
                className={inputClass}
                placeholder="Ej: Havanna Mixto"
                {...register('nombre')}
              />
              {errors.nombre && (
                <p className={errorClass}>{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <span className={labelClass}>Marca</span>
              <MarcaCombobox value={marca} onChange={pickMarca} />
              {errors.marcaId && (
                <p className={errorClass}>{errors.marcaId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="propose-tipo" className={labelClass}>
                Tipo
              </label>
              <select
                id="propose-tipo"
                className={inputClass}
                defaultValue=""
                {...register('tipo')}
              >
                <option value="" disabled>
                  Elegí un tipo
                </option>
                {ALFAJOR_TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {tipoLabel(t)}
                  </option>
                ))}
              </select>
              {errors.tipo && (
                <p className={errorClass}>{errors.tipo.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={propose.isPending}
              className={submitClass}
            >
              Enviar propuesta
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
