'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import { Textarea } from '@/shared/components/ui/textarea';
import { reviewSchema, type ReviewFormValues } from '../lib/reviewSchema';
import { useMyAlfajorReview } from '../hooks/useMyAlfajorReview';
import { useSubmitReview } from '../hooks/useSubmitReview';
import { RatingSlider } from './RatingSlider';
import type { Alfajor } from '@/features/alfajores/types/alfajores.types';
import type { Review } from '../types/reviews.types';

const AXES: Array<{ name: keyof ReviewFormValues; label: string }> = [
  { name: 'ratingGeneral', label: 'General' },
  { name: 'dulzor', label: 'Dulzor' },
  { name: 'cantidadDDL', label: 'DDL' },
  { name: 'calidadBano', label: 'Baño' },
  { name: 'ratioTapaRelleno', label: 'Tapa/Relleno' },
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

export function ReviewWizardForm({
  alfajor,
  onBack,
  onDone,
}: {
  alfajor: Alfajor;
  onBack?: () => void;
  onDone: () => void;
}) {
  const { data: existing, isLoading } = useMyAlfajorReview(alfajor.id);

  if (isLoading) {
    return <p className="text-sienna text-[14px]">Cargando tu reseña...</p>;
  }

  return (
    <WizardInner
      alfajor={alfajor}
      existing={existing ?? null}
      onBack={onBack}
      onDone={onDone}
    />
  );
}

function WizardInner({
  alfajor,
  existing,
  onBack,
  onDone,
}: {
  alfajor: Alfajor;
  existing: Review | null;
  onBack?: () => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState<'comentario' | 'puntajes'>('comentario');
  const { mutate, isPending, isError } = useSubmitReview(alfajor.id);
  const isEdit = !!existing;

  const { control, register, handleSubmit } = useForm<ReviewFormValues>({
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
    const onSuccess = () => onDone();

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <p className="text-sienna text-[13px]">
        Reseñando{' '}
        <span className="text-ink font-semibold">{alfajor.nombre}</span>
        {alfajor.marca ? ` · ${alfajor.marca.nombre}` : ''}
      </p>

      {step === 'comentario' && (
        <>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="comentario"
              className="text-ink text-[14px] font-medium"
            >
              Tu reseña <span className="text-cinnamon">(opcional)</span>
            </label>
            <Textarea
              id="comentario"
              rows={5}
              maxLength={500}
              autoFocus
              {...register('comentario')}
              placeholder="¿Qué te pareció?"
              className="bg-paper-sunken min-h-[120px] resize-none border-[rgba(74,30,8,0.22)] text-[14px]"
            />
          </div>

          <div className="flex items-center justify-between">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="text-sienna hover:text-ink inline-flex items-center gap-1.5 text-[13px] font-medium"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                Volver
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => setStep('puntajes')}
              className="text-paper inline-flex h-11 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#a86432] to-[#3a1808] px-6 text-[14px] font-semibold tracking-[0.03em] uppercase transition-[filter] hover:brightness-110"
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {step === 'puntajes' && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            {AXES.map((axis) => (
              <Controller
                key={axis.name}
                name={axis.name}
                control={control}
                render={({ field }) => (
                  <RatingSlider
                    label={axis.label}
                    value={Number(field.value)}
                    onChange={field.onChange}
                  />
                )}
              />
            ))}
          </div>

          {/* Foto: aún sin uploads, placeholder por ahora. */}
          <div className="flex items-center gap-3 rounded-[10px] border border-dashed border-[rgba(74,30,8,0.28)] px-4 py-3 opacity-70">
            <ImagePlus className="text-cinnamon h-5 w-5" strokeWidth={2} />
            <span className="text-sienna text-[13px]">
              Subí una foto del alfajor{' '}
              <span className="text-cinnamon">(próximamente)</span>
            </span>
          </div>

          {isError && (
            <p className="text-error text-[13px]">
              No pudimos guardar la reseña. Probá de nuevo.
            </p>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep('comentario')}
              className="text-sienna hover:text-ink inline-flex items-center gap-1.5 text-[13px] font-medium"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              Atrás
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="text-paper inline-flex h-11 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#a86432] to-[#3a1808] px-6 text-[14px] font-semibold tracking-[0.03em] uppercase transition-[filter] hover:brightness-110 disabled:opacity-60"
            >
              {isPending ? 'Guardando...' : isEdit ? 'Guardar' : 'Publicar'}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
