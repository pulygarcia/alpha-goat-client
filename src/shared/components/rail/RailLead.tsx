import Link from 'next/link';

/**
 * Item destacado de una sección del rail: slot izquierdo (un numeral grande o
 * una miniatura), nombre, una línea de contexto y el valor a la derecha. Es la
 * unidad que se repite en las tres secciones — por eso vive en shared y no en
 * ranking o recommendations.
 */
export function RailLead({
  href,
  lead,
  title,
  meta,
  value,
  valueClassName = 'text-cinnamon',
}: {
  href: string;
  /** Numeral o miniatura; `null` deja el título al ras del borde. */
  lead?: React.ReactNode;
  title: string;
  meta?: React.ReactNode;
  /** Se omite cuando no hay número que mostrar (cold start de recomendados). */
  value?: string;
  valueClassName?: string;
}) {
  return (
    <Link
      href={href}
      className="text-ink group flex items-start gap-3.5 outline-none"
    >
      {lead && <div className="flex-none pt-[2px]">{lead}</div>}

      <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
        <span className="text-[16px] leading-[1.2] font-semibold group-hover:underline group-focus-visible:underline">
          {title}
        </span>
        {meta && (
          <span
            className="text-gris-300 text-[10px] leading-[1.4]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {meta}
          </span>
        )}
      </div>

      {value && (
        <span
          className={`text-[18px] tabular-nums ${valueClassName}`}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {value}
        </span>
      )}
    </Link>
  );
}

/** Numeral Archivo Black del slot izquierdo (puesto en el ranking). */
export function RailNumeral({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={`block text-[34px] leading-[0.8] ${muted ? 'text-gris-100' : 'text-ink'}`}
      style={{
        fontFamily: 'var(--font-archivo)',
        letterSpacing: '-0.06em',
      }}
    >
      {children}
    </span>
  );
}

/** Fila compacta de la cola de una sección: puesto opcional, nombre y valor. */
export function RailTailRow({
  href,
  pos,
  title,
  value,
}: {
  href: string;
  pos?: number;
  title: string;
  value?: string;
}) {
  return (
    <Link
      href={href}
      className="text-gris-400 hover:text-ink flex items-baseline gap-2 text-[11px] transition-colors"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {pos !== undefined && (
        <span className="text-gris-200 w-3 flex-none">{pos}</span>
      )}
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {value && <span className="tabular-nums">{value}</span>}
    </Link>
  );
}

/** Link de cierre de sección ("ver todo"), en mono chiquito. */
export function RailMoreLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-gris-300 hover:text-cinnamon pt-[3px] text-[9.5px] tracking-[0.2em] uppercase transition-colors"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {children}
    </Link>
  );
}
