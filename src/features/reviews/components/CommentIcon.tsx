/** Ícono de comentario dibujado a mano (bocadillo de diálogo). */
export function CommentIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
      aria-hidden
    >
      <path d="M4 5h16v11H10l-5 4V5z" />
    </svg>
  );
}
