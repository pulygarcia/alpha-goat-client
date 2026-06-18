'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRequireAuth } from '@/shared/hooks/useRequireAuth';
import { useCreateComment } from '../hooks/useCreateComment';
import { commentSchema, type CommentFormValues } from '../lib/commentSchema';

/**
 * Form para sumar un comentario a una reseña. Valida con Zod (texto no vacío)
 * y gatea el envío: anónimo → login (modelo "ver público / actuar autenticado").
 * Al publicarse, el hook invalida el listado y se limpia el textarea.
 */
export function CommentForm({ reviewId }: { reviewId: string }) {
  const create = useCreateComment(reviewId);
  const requireAuth = useRequireAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: CommentFormValues) => {
    requireAuth(() =>
      create.mutate(data, { onSuccess: () => reset({ contenido: '' }) }),
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-2"
    >
      <textarea
        {...register('contenido')}
        rows={2}
        placeholder="Sumá un comentario…"
        aria-label="Comentario"
        className="border-cinnamon/30 text-ink placeholder:text-cinnamon/60 focus:border-curry-deep w-full resize-none rounded-[10px] border bg-transparent px-3 py-2 text-[14px] leading-[1.5] transition-colors outline-none"
      />
      {errors.contenido && (
        <p role="alert" className="text-[0.78rem] text-[#c0461f]">
          {errors.contenido.message}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isValid || create.isPending}
          className="btn-curry cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        >
          {create.isPending ? 'Publicando…' : 'Comentar'}
        </button>
      </div>
    </form>
  );
}
