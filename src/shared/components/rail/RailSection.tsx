/**
 * Bloque del rail del feed: eyebrow mono a la izquierda, dato de contexto a la
 * derecha y contenido debajo. El rail dejó de ser un stack de tarjetas — las
 * secciones se separan solo por hairlines a sangre, así que el padding vertical
 * y el borde viven acá y no en cada feature.
 */
export function RailSection({
  title,
  meta,
  children,
}: {
  title: string;
  /** Dato chico alineado a la derecha del eyebrow (rango, total, conteo). */
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-gris-50 flex flex-col gap-4 border-t px-5 py-7 first:border-t-0 first:pt-0 last:pb-0 sm:px-7">
      <div className="flex items-baseline justify-between gap-2.5">
        <h5
          className="text-ink text-[10px] tracking-[0.24em] uppercase"
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}
        >
          {title}
        </h5>
        {meta && (
          <span
            className="text-gris-300 text-[9.5px] tracking-[0.1em] tabular-nums"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {meta}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
