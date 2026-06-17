'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { reviewSchema, type ReviewFormValues } from '../lib/reviewSchema';
import { useMyAlfajorReview } from '../hooks/useMyAlfajorReview';
import { useSubmitReview } from '../hooks/useSubmitReview';
import { RatingSlider } from './RatingSlider';
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

export function ReviewForm({ alfajorId }: { alfajorId: string }) {
  const { data: existing, isLoading } = useMyAlfajorReview(alfajorId);

  if (isLoading) {
    return <p className="text-sienna text-[14px]">Cargando tu reseña...</p>;
  }

  return <ReviewFormInner alfajorId={alfajorId} existing={existing ?? null} />;
}

function ReviewFormInner({
  alfajorId,
  existing,
}: {
  alfajorId: string;
  existing: Review | null;
}) {
  const router = useRouter();
  const { mutate, isPending, isError } = useSubmitReview(alfajorId);
  const isEdit = !!existing;

  const { control, register, handleSubmit, formState } =
    useForm<ReviewFormValues>({
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
    const onSuccess = () => router.push(`/alfajores/${alfajorId}`);

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
          input: { alfajorId, ...ratingsOf(values), comentario },
        },
        { onSuccess },
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
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

      <div className="flex flex-col gap-2">
        <label
          htmlFor="comentario"
          className="text-ink text-[14px] font-medium"
        >
          Comentario <span className="text-cinnamon">(opcional)</span>
        </label>
        <textarea
          id="comentario"
          rows={4}
          maxLength={500}
          {...register('comentario')}
          placeholder="¿Qué te pareció?"
          className="bg-paper-sunken text-ink focus:border-cinnamon resize-none rounded-[10px] border-[1.5px] border-[rgba(74,30,8,0.22)] px-3 py-2 text-[14px] placeholder:text-[rgba(44,18,9,0.55)] focus:outline-none"
        />
        {formState.errors.comentario && (
          <span className="text-error text-[12px]">
            {formState.errors.comentario.message}
          </span>
        )}
      </div>

      {isError && (
        <p className="text-error text-[13px]">
          No pudimos guardar la reseña. Probá de nuevo.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="text-paper inline-flex h-11 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#a86432] to-[#3a1808] px-6 text-[14px] font-semibold tracking-[0.03em] uppercase transition-[filter] hover:brightness-110 disabled:opacity-60"
      >
        {isPending
          ? 'Guardando...'
          : isEdit
            ? 'Guardar cambios'
            : 'Publicar reseña'}
      </button>
    </form>
  );
}
