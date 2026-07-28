'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, X } from 'lucide-react';
import { BackButton } from '@/shared/components/BackButton';
import { Textarea } from '@/shared/components/ui/textarea';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { imageFileSchema } from '@/shared/schemas/imageFile.schema';
import { reviewSchema, type ReviewFormValues } from '../lib/reviewSchema';
import { useMyAlfajorReview } from '../hooks/useMyAlfajorReview';
import { useSubmitReview } from '../hooks/useSubmitReview';
import { useUploadReviewPhoto } from '../hooks/useUploadReviewPhoto';
import { ScoreBar } from './ScoreBar';
import type { Alfajor } from '@/features/alfajores/types/alfajores.types';
import type { Review } from '../types/reviews.types';

/** Los cinco ejes. El general no está acá: es el bloque protagonista aparte. */
const AXES: Array<{ name: keyof ReviewFormValues; label: string }> = [
  { name: 'dulzor', label: 'Dulzor' },
  { name: 'cantidadDDL', label: 'Cant. DDL' },
  { name: 'calidadBano', label: 'Baño' },
  { name: 'ratioTapaRelleno', label: 'Tapa / relleno' },
  { name: 'textura', label: 'Textura' },
];

function ratingsOf(v: ReviewFormValues) {
  return {
    ratingGeneral: v.ratingGeneral,
    dulzor: v.dulzor,
    cantidadDDL: v.cantidadDDL,
    calidadBano: v.calidadBano,
    ratioTapaRelleno: v.ratioTapaRelleno,
    textura: v.textura,
  };
}

export type WizardStep = 'comentario' | 'puntajes';

export function ReviewWizardForm({
  alfajor,
  onBack,
  onDone,
  step,
  onStepChange,
}: {
  alfajor: Alfajor;
  onBack?: () => void;
  onDone: () => void;
  /** Paso controlado (opcional). Si se omite, el wizard lo maneja internamente. */
  step?: WizardStep;
  onStepChange?: (step: WizardStep) => void;
}) {
  const { data: existing, isLoading } = useMyAlfajorReview(alfajor.id);

  if (isLoading) return <WizardSkeleton />;

  return (
    <WizardInner
      alfajor={alfajor}
      existing={existing ?? null}
      onBack={onBack}
      onDone={onDone}
      step={step}
      onStepChange={onStepChange}
    />
  );
}

/**
 * Espera de `useMyAlfajorReview` (hay que saber si el usuario ya reseñó este
 * alfajor para precargar el form). Calca el paso 1 con el pie incluido: la
 * hoja tiene alto fijo, así que si el placeholder no lo llena el botón salta
 * al llegar los datos.
 */
function WizardSkeleton() {
  return (
    <div
      data-testid="wizard-skeleton"
      className="flex min-h-0 flex-1 flex-col"
      aria-busy
    >
      <div className="min-h-0 flex-1 px-[18px] pt-3">
        <Skeleton className="h-[22px] w-[190px]" />
        <Skeleton className="mt-2.5 h-[132px] w-full rounded-[10px]" />
        <div className="mt-4 flex items-start gap-3">
          <Skeleton className="h-[88px] w-[88px] flex-none rounded-[10px]" />
          <div className="flex-1">
            <Skeleton className="h-3.5 w-[120px]" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-1.5 h-3 w-2/3" />
          </div>
        </div>
      </div>

      <div className="border-gris-25 flex flex-none gap-2.5 border-t px-[18px] pt-3.5 pb-5">
        <Skeleton className="h-12 w-[96px] rounded-[10px]" />
        <Skeleton className="h-12 flex-1 rounded-[10px]" />
      </div>
    </div>
  );
}

function WizardInner({
  alfajor,
  existing,
  onBack,
  onDone,
  step: stepProp,
  onStepChange,
}: {
  alfajor: Alfajor;
  existing: Review | null;
  onBack?: () => void;
  onDone: () => void;
  step?: WizardStep;
  onStepChange?: (step: WizardStep) => void;
}) {
  const [stepState, setStepState] = useState<WizardStep>('comentario');
  const step = stepProp ?? stepState;
  const setStep = (next: WizardStep) => {
    setStepState(next);
    onStepChange?.(next);
  };
  const { mutate, isPending, isError } = useSubmitReview(alfajor.id);
  const upload = useUploadReviewPhoto(alfajor.id);
  const isEdit = !!existing;

  // Foto opcional: se elige acá (preview local) y se sube tras crear/editar la
  // reseña, con el id que devuelve el back. Misma validación que el avatar.
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoError(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  }

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    const parsed = imageFileSchema.safeParse(picked);
    if (!parsed.success) {
      setPhotoError(parsed.error.issues[0].message);
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }
    setPhotoError(null);
    setPhoto(picked);
    setPhotoPreview(URL.createObjectURL(picked));
  }

  const { control, register, handleSubmit, watch } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: existing
      ? {
          ratingGeneral: existing.ratingGeneral,
          dulzor: existing.dulzor,
          cantidadDDL: existing.cantidadDDL,
          calidadBano: existing.calidadBano,
          ratioTapaRelleno: existing.ratioTapaRelleno,
          textura: existing.textura,
          comentario: existing.comentario ?? '',
        }
      : {
          ratingGeneral: 5,
          dulzor: 5,
          cantidadDDL: 5,
          calidadBano: 5,
          ratioTapaRelleno: 5,
          textura: 5,
          comentario: '',
        },
  });

  function onSubmit(values: ReviewFormValues) {
    const comentario = values.comentario.trim() || undefined;
    // Tras guardar la reseña, si hay foto se sube con el id devuelto y recién
    // ahí se cierra; sin foto se cierra de una. Un fallo de la foto no bloquea
    // (la reseña ya quedó publicada) — el hook avisa por toast.
    const onSuccess = (review: Review) => {
      if (photo) {
        upload.mutate(
          { reviewId: review.id, file: photo },
          { onSettled: () => onDone() },
        );
      } else {
        onDone();
      }
    };

    if (isEdit && existing) {
      mutate(
        {
          mode: 'edit',
          reviewId: existing.id,
          input: { ...ratingsOf(values), comentario },
        },
        { onSuccess },
      );
    } else {
      mutate(
        {
          mode: 'create',
          input: { alfajorId: alfajor.id, ...ratingsOf(values), comentario },
        },
        { onSuccess },
      );
    }
  }

  return (
    // El form ocupa el alto de la hoja: el cuerpo scrollea y el pie queda fijo,
    // así el botón de avanzar siempre está bajo el pulgar.
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-[18px] pt-3">
        {step === 'comentario' && (
          <>
            <h3
              className="text-ink text-[17px]"
              style={{
                fontFamily: 'var(--font-archivo)',
                letterSpacing: '-0.03em',
              }}
            >
              Contá cómo estuvo{' '}
              <span
                className="text-gris-300 text-[11px] font-normal"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                (opcional)
              </span>
            </h3>

            <div className="bg-gris-25 border-gris-50 focus-within:border-gris-200 mt-2.5 rounded-[10px] border p-3 transition-colors">
              <Textarea
                id="comentario"
                // El título de la sección es un h3, no un <label>: el textarea
                // necesita su propio nombre accesible.
                aria-label="Tu reseña"
                rows={4}
                maxLength={280}
                autoFocus
                {...register('comentario')}
                placeholder="El baño arranca impecable pero se rinde al tercer mordisco..."
                className="placeholder:text-gris-300 min-h-[92px] resize-none border-none bg-transparent p-0 text-[14px] leading-[1.5] shadow-none focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div
                className="text-gris-300 flex justify-end text-[10.5px] tabular-nums"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {(watch('comentario') ?? '').length} / 280
              </div>
            </div>

            {/* Foto opcional: preview local, se sube después de publicar. */}
            <div className="mt-4 flex items-start gap-3">
              {photoPreview ? (
                <div className="relative h-[88px] w-[88px] flex-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Vista previa de la foto"
                    className="h-full w-full rounded-[10px] object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    aria-label="Quitar foto"
                    className="bg-blanco-tibio/90 text-ink border-gris-50 absolute -top-2 -right-2 inline-flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur-sm"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="review-photo"
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
                  Opcional. La mordida cuenta más que el envoltorio.
                </p>
                {photoError && (
                  <p className="text-error mt-1 text-[11.5px]">{photoError}</p>
                )}
              </div>
            </div>
            <input
              ref={photoInputRef}
              id="review-photo"
              type="file"
              aria-label="Foto de la reseña"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={onPickPhoto}
            />
          </>
        )}

        {step === 'puntajes' && (
          <>
            <Controller
              name="ratingGeneral"
              control={control}
              render={({ field }) => (
                <ScoreBar
                  variant="hero"
                  label="Puntaje general"
                  value={Number(field.value)}
                  onChange={field.onChange}
                />
              )}
            />

            <p
              className="text-gris-300 py-3 text-[10px] tracking-[0.22em] uppercase"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Los cinco ejes
            </p>

            <div className="flex flex-col gap-2 pb-2">
              {AXES.map((axis) => (
                <Controller
                  key={axis.name}
                  name={axis.name}
                  control={control}
                  render={({ field }) => (
                    <ScoreBar
                      label={axis.label}
                      value={Number(field.value)}
                      onChange={field.onChange}
                    />
                  )}
                />
              ))}
            </div>

            {isError && (
              <div className="border-cinnamon mt-1 mb-2 rounded-[10px] border-l-[3px] bg-[#fdf4ea] px-3.5 py-3">
                <p className="text-ink text-[13px] font-semibold">
                  No pudimos guardar la reseña
                </p>
                <p className="text-gris-400 mt-1 text-[11.5px] leading-[1.45]">
                  Tus puntajes siguen acá. Probá de nuevo.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="border-gris-25 flex flex-none gap-2.5 border-t px-[18px] pt-3.5 pb-5">
        {step === 'comentario' ? (
          onBack ? (
            <BackButton onClick={onBack}>Volver</BackButton>
          ) : (
            <span />
          )
        ) : (
          <BackButton onClick={() => setStep('comentario')}>Atrás</BackButton>
        )}

        {/* `key` distinta en cada rama: sin ella React reusa el mismo nodo y le
            cambia `type` de "button" a "submit" en el mismo click que avanza de
            paso. El navegador evalúa la acción por defecto después de correr los
            handlers, ve un submit y publica la reseña sin pasar por los
            puntajes. Con keys distintas el nodo se reemplaza y no queda submit
            que disparar. (jsdom no lo reproduce: React flushea en otro momento
            bajo `act`, así que el test de abajo no alcanza para cubrirlo.) */}
        {step === 'comentario' ? (
          <button
            key="next"
            type="button"
            onClick={() => setStep('puntajes')}
            className="text-paper h-12 flex-1 rounded-[10px] bg-gradient-to-br from-[#a86432] to-[#3a1808] text-[12px] font-semibold tracking-[0.04em] uppercase transition-[filter] hover:brightness-110"
          >
            Siguiente
          </button>
        ) : (
          <button
            key="submit"
            type="submit"
            disabled={isPending}
            className="text-paper h-12 flex-1 rounded-[10px] bg-gradient-to-br from-[#a86432] to-[#3a1808] text-[12px] font-semibold tracking-[0.04em] uppercase transition-[filter] hover:brightness-110 disabled:opacity-60"
          >
            {isPending
              ? 'Publicando...'
              : isEdit
                ? 'Guardar cambios'
                : isError
                  ? 'Reintentar'
                  : 'Publicar reseña'}
          </button>
        )}
      </div>
    </form>
  );
}
