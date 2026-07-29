'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';
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
  const reduce = useReducedMotion();

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

  const submitForm = handleSubmit(onSubmit);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submitForm();
    }
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
          onKeyDown={handleKeyDown}
          className="text-ink bg-deep/7 placeholder:text-deep/40 w-full resize-none rounded-[14px] py-2.5 pr-11 pl-3.5 text-[14px] leading-[1.5] focus:outline-none"
        />
        <motion.button
          type="submit"
          disabled={!isValid || create.isPending}
          aria-label="Enviar comentario"
          animate={
            reduce
              ? undefined
              : {
                  scale: isValid && !create.isPending ? 1 : 0.92,
                  opacity: isValid && !create.isPending ? 1 : 0.4,
                }
          }
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-curry-deep bg-deep/8 hover:bg-deep/16 disabled:hover:bg-deep/8 absolute right-2 bottom-2.5 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed"
        >
          {create.isPending ? (
            <Spinner className="size-4" />
          ) : (
            <Send size={16} strokeWidth={2} />
          )}
        </motion.button>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        {errors.contenido ? (
          <p role="alert" className="text-error text-[0.78rem]">
            {errors.contenido.message}
          </p>
        ) : (
          <span />
        )}
        <span
          className={`text-[0.72rem] tabular-nums ${
            overLimit ? 'text-error font-semibold' : 'text-cinnamon'
          }`}
        >
          {length}/{COMMENT_MAX}
        </span>
      </div>
    </form>
  );
}
