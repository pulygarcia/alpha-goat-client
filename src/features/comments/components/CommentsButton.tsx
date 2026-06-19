'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { CommentsModal, type ReviewSummary } from './CommentsModal';

interface CommentsButtonProps {
  reviewId: string;
  count: number;
  summary: ReviewSummary;
}

/**
 * Disparador del modal de comentarios: ícono de burbuja + contador. Abrir el
 * hilo es público (ver es público); comentar se gatea dentro del modal.
 */
export function CommentsButton({
  reviewId,
  count,
  summary,
}: CommentsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ver comentarios"
        className="text-cinnamon hover:text-curry-deep inline-flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors"
      >
        <MessageCircle size={16} strokeWidth={2} />
        {count}
      </button>

      <CommentsModal
        reviewId={reviewId}
        summary={summary}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
