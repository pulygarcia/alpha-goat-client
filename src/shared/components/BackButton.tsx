import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

type BackButtonProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & ({ href: string; onClick?: never } | { onClick: () => void; href?: never });

/**
 * Control de retroceso de la app ("Volver al catálogo", "Atrás" del wizard).
 * Navega con `href` o dispara `onClick`, nunca las dos cosas.
 *
 * El tracking va bajo a propósito: en mayúsculas, el espaciado grande se lee
 * como plantilla. Los colores salen por `className`/`style` porque cada
 * superficie tiene su paleta (la ficha del alfajor usa sus `--ap-*`, el resto
 * el papel crema), pero la forma es siempre la misma.
 */
export function BackButton({
  children,
  className,
  style,
  href,
  onClick,
}: BackButtonProps) {
  const classes = cn(
    'text-sienna hover:text-ink inline-flex items-center gap-1.5 rounded-[8px] border border-[rgba(74,30,8,0.14)] px-3 py-1.5 text-[11px] tracking-[0.05em] uppercase transition-colors hover:bg-black/[0.03]',
    className,
  );
  const content = (
    <>
      <ArrowLeft className="h-4 w-4" strokeWidth={2} />
      {children}
    </>
  );

  const fontStyle = { fontFamily: 'var(--font-mono)', ...style };

  if (href) {
    return (
      <Link href={href} className={classes} style={fontStyle}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classes}
      style={fontStyle}
    >
      {content}
    </button>
  );
}
