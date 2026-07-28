'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Check, ImagePlus, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { notifyError } from '@/shared/lib/toast';
import { imageFileSchema } from '@/shared/schemas/imageFile.schema';
import { ALFAJOR_TIPOS } from '@/shared/types/alfajor';
import { MarcaCombobox } from '@/features/marcas/components/MarcaCombobox';
import type { Marca } from '@/features/marcas/types/marcas.types';
import { useProposeAlfajor } from '../hooks/useProposeAlfajor';
import {
  proposeAlfajorSchema,
  type ProposeAlfajorForm,
} from '../schemas/proposeAlfajor.schema';

const fieldClass =
  'bg-gris-25 border-gris-50 focus-within:border-gris-200 flex h-12 items-center rounded-[10px] border px-3 transition-colors';
const inputClass =
  'text-ink placeholder:text-gris-300 h-full w-full bg-transparent text-[14px] focus:outline-none';
const labelClass =
  'text-gris-300 mb-1.5 block text-[10px] tracking-[0.16em] uppercase';
const errorClass = 'text-error mt-1.5 text-[11.5px]';
const primaryClass =
  'text-paper h-12 flex-1 rounded-[10px] bg-gradient-to-br from-[#a86432] to-[#3a1808] text-[12px] font-semibold tracking-[0.04em] uppercase transition-[filter] hover:brightness-110 disabled:opacity-60';

/** "CHOCOLATE" → "Chocolate". */
function tipoLabel(tipo: string) {
  return tipo.charAt(0) + tipo.slice(1).toLowerCase();
}

/**
 * Modal para proponer un alfajor nuevo. El alfajor nace PENDING (no entra al
 * catálogo público hasta que un admin lo apruebe), así que al enviar mostramos
 * una pantalla de confirmación in-modal en vez de devolver al flujo de reseña.
 * Un 409 (ya existe ese nombre+marca) se muestra inline; otros errores van a toast.
 *
 * Se presenta como hoja anclada abajo igual que el QuickReviewModal desde el que
 * se abre: es continuación del mismo flujo, y saltar de hoja a modal centrado a
 * mitad de camino leía como otra app. A diferencia del wizard, acá el alto lo
 * pone el contenido (no hay pasos que igualar) con tope en 92vh.
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
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoError, setFotoError] = useState<string | null>(null);
  const [fotoFailed, setFotoFailed] = useState(false);
  const propose = useProposeAlfajor();
  const reduce = useReducedMotion();

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
      clearFoto();
      setFotoFailed(false);
      reset();
    }
    onOpenChange(next);
  }

  function clearFoto() {
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setFoto(null);
    setFotoPreview(null);
    setFotoError(null);
  }

  function pickFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    const parsed = imageFileSchema.safeParse(picked);
    if (!parsed.success) {
      clearFoto();
      setFotoError(parsed.error.issues[0].message);
      return;
    }
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setFotoError(null);
    setFoto(picked);
    setFotoPreview(URL.createObjectURL(picked));
  }

  function pickMarca(next: Marca | null) {
    setMarca(next);
    setValue('marcaId', next?.id ?? '', { shouldValidate: true });
  }

  const onSubmit = handleSubmit((values) => {
    propose.mutate(
      { input: values, foto: foto ?? undefined },
      {
        onSuccess: (result) => {
          setFotoFailed(!result.fotoUploaded);
          setSubmitted(true);
        },
        onError: (err) => {
          if (axios.isAxiosError(err) && err.response?.status === 409) {
            setError('nombre', {
              message: 'Ese alfajor ya existe para esa marca.',
            });
            return;
          }
          notifyError('No pudimos enviar la propuesta');
        },
      },
    );
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Mismo anclaje que el QuickReviewModal: sobreescribe el centrado del
          primitivo en vez de forkearlo (Radix conserva foco y escape). */}
      <DialogContent
        showClose={false}
        className="bg-blanco-tibio text-ink border-gris-50 top-auto bottom-0 left-1/2 flex max-h-[92vh] w-[min(520px,100vw)] max-w-none translate-y-0 flex-col gap-0 overflow-hidden rounded-t-[18px] rounded-b-none p-0 duration-[250ms] sm:rounded-b-none"
      >
        <DialogHeader className="flex-none space-y-0 px-[18px] pt-2.5">
          <div className="flex items-center gap-3">
            <span
              className="text-gris-300 flex-1 text-[10px] tracking-[0.2em] uppercase"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {submitted ? 'Enviado' : 'Nuevo alfajor'}
            </span>
            <DialogClose
              aria-label="Cerrar"
              className="text-gris-300 hover:text-ink flex h-7 w-7 flex-none items-center justify-center rounded-full transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </DialogClose>
          </div>

          <DialogTitle
            className="text-ink mt-3 text-[18px]"
            style={{
              fontFamily: 'var(--font-archivo)',
              letterSpacing: '-0.03em',
            }}
          >
            {submitted ? '¡Gracias!' : 'Proponer un alfajor'}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          className="flex min-h-0 flex-1 flex-col"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          {submitted ? (
            <>
              <div className="min-h-0 flex-1 px-[18px] pt-3.5">
                <div className="bg-gris-25 flex items-start gap-3 rounded-[10px] p-3">
                  <span
                    aria-hidden
                    className="bg-cinnamon text-paper flex h-7 w-7 flex-none items-center justify-center rounded-full"
                  >
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <p className="text-gris-500 text-[13px] leading-[1.5]">
                    Quedó{' '}
                    <strong className="text-ink">
                      pendiente de aprobación
                    </strong>
                    . Lo revisamos y te avisamos cuando esté disponible para
                    reseñar.
                  </p>
                </div>

                {fotoFailed && (
                  <p className="text-gris-400 mt-3 text-[11.5px] leading-[1.45]">
                    Ojo: la foto no se pudo subir, pero la propuesta quedó
                    registrada igual.
                  </p>
                )}
              </div>

              <div className="border-gris-25 flex flex-none gap-2.5 border-t px-[18px] pt-3.5 pb-5">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className={primaryClass}
                >
                  Cerrar
                </button>
              </div>
            </>
          ) : (
            <form
              onSubmit={onSubmit}
              className="flex min-h-0 flex-1 flex-col"
              noValidate
            >
              <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-[18px] pt-3.5 pb-4">
                <div>
                  <label htmlFor="propose-nombre" className={labelClass}>
                    Nombre
                  </label>
                  <div className={fieldClass}>
                    <input
                      id="propose-nombre"
                      className={inputClass}
                      placeholder="Ej: Havanna Mixto"
                      {...register('nombre')}
                    />
                  </div>
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
                  <div className={fieldClass}>
                    <select
                      id="propose-tipo"
                      className={`${inputClass} appearance-none`}
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
                  </div>
                  {errors.tipo && (
                    <p className={errorClass}>{errors.tipo.message}</p>
                  )}
                </div>

                {/* Misma caja de foto que el paso 1 del wizard: el input queda
                    oculto y el dropzone/preview hace de control visible. */}
                <div className="flex items-start gap-3">
                  {fotoPreview ? (
                    <div className="relative h-[88px] w-[88px] flex-none">
                      {/* Preview local (objectURL); <img> a propósito, next/image no optimiza blobs. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={fotoPreview}
                        alt="Vista previa de la foto"
                        className="h-full w-full rounded-[10px] object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearFoto}
                        aria-label="Quitar foto"
                        className="bg-blanco-tibio/90 text-ink border-gris-50 absolute -top-2 -right-2 inline-flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur-sm"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="propose-foto"
                      className="border-gris-100 bg-gris-25 hover:border-gris-200 flex h-[88px] w-[88px] flex-none cursor-pointer items-center justify-center rounded-[10px] border border-dashed transition-colors"
                    >
                      <ImagePlus
                        className="text-gris-300 h-6 w-6"
                        strokeWidth={2}
                      />
                    </label>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-ink text-[13px] font-semibold">
                      Foto del alfajor
                    </p>
                    <p className="text-gris-300 mt-1 text-[11.5px] leading-[1.45]">
                      Opcional. Ayuda a que lo aprobemos más rápido.
                    </p>
                    {fotoError && (
                      <p className="text-error mt-1 text-[11.5px]">
                        {fotoError}
                      </p>
                    )}
                  </div>
                </div>
                <input
                  id="propose-foto"
                  type="file"
                  aria-label="Foto (opcional)"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={pickFoto}
                  className="sr-only"
                />
              </div>

              <div className="border-gris-25 flex flex-none gap-2.5 border-t px-[18px] pt-3.5 pb-5">
                <button
                  type="submit"
                  disabled={propose.isPending}
                  className={primaryClass}
                >
                  {propose.isPending ? 'Enviando...' : 'Enviar propuesta'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
