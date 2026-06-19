'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { Spinner } from '@/shared/components/ui/spinner';
import { useRequireAuth } from '@/shared/hooks/useRequireAuth';
import { useCreateComment } from '../hooks/useCreateComment';
import {
  COMMENT_MAX,
  commentSchema,
  type CommentFormValues,
} from '../lib/commentSchema';

/**
 * Form para sumar un comentario a una reseña: etiqueta "respondiendo a" + el
 * textarea con el botón de envío. El avatar y la línea del hilo los pone el
 * modal (carril). Valida con Zod y gatea el envío: anónimo → login.
 */
export function CommentForm({
  reviewId,
  replyingTo,
}: {
  reviewId: string;
  replyingTo: string;
}) {
  const create = useCreateComment(reviewId);
  const requireAuth = useRequireAuth();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    mode: 'onChange',
  });

  const length = (watch('contenido') ?? '').length;
  const overLimit = length > COMMENT_MAX;

  const onSubmit = (data: CommentFormValues) => {
    requireAuth(() =>
      create.mutate(data, { onSuccess: () => reset({ contenido: '' }) }),
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="text-cinnamon mb-1.5 text-[0.72rem]">
        Respondiendo a <span className="font-semibold">{replyingTo}</span>
      </p>
      <div className="relative">
        <textarea
          {...register('contenido')}
          rows={2}
          placeholder="Sumá un comentario…"
          aria-label="Comentario"
          className="text-ink w-full resize-none rounded-[14px] bg-[rgba(74,30,8,0.07)] py-2.5 pr-11 pl-3.5 text-[14px] leading-[1.5] placeholder:text-[rgba(74,30,8,0.4)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!isValid || create.isPending}
          aria-label="Enviar comentario"
          className="text-curry-deep absolute right-2 bottom-2.5 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[rgba(74,30,8,0.08)] transition-colors hover:bg-[rgba(74,30,8,0.16)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[rgba(74,30,8,0.08)]"
        >
          {create.isPending ? (
            <Spinner className="size-4" />
          ) : (
            <Send size={16} strokeWidth={2} />
          )}
        </button>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        {errors.contenido ? (
          <p role="alert" className="text-[0.78rem] text-[#c0461f]">
            {errors.contenido.message}
          </p>
        ) : (
          <span />
        )}
        <span
          className={`text-[0.72rem] tabular-nums ${
            overLimit ? 'font-semibold text-[#c0461f]' : 'text-cinnamon'
          }`}
        >
          {length}/{COMMENT_MAX}
        </span>
      </div>
    </form>
  );
}
