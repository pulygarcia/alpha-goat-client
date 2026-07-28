import { Fragment } from 'react';
import type { AlfajorAvgEjes } from '../types/alfajores.types';

const EJES: { key: keyof AlfajorAvgEjes; label: string; strong: boolean }[] = [
  { key: 'dulzor', label: 'Dulzor', strong: true },
  { key: 'cantidadDDL', label: 'Dulce de leche', strong: true },
  { key: 'calidadBano', label: 'Calidad del baño', strong: false },
  { key: 'ratioTapaRelleno', label: 'Tapa / relleno', strong: false },
  { key: 'textura', label: 'Textura', strong: false },
];

/**
 * Promedio por eje del alfajor: 5 barras horizontales. Sin datos (el back
 * todavía no expone `avgEjes`, o el alfajor no tiene reseñas) muestra los
 * rieles vacíos y atenuados en vez de ocultar el bloque, para que la ficha no
 * cambie de alto al llegar la primera reseña.
 */
export function AlfajorEjesAverage({
  avgEjes,
}: {
  avgEjes?: AlfajorAvgEjes | null;
}) {
  const empty = !avgEjes;

  return (
    <div className="flex flex-col gap-3">
      <div
        className="text-[10px] tracking-[0.2em] uppercase"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--ap-faint)' }}
      >
        Promedio por eje
      </div>

      <div
        data-testid="ejes-average"
        data-empty={String(empty)}
        className="grid grid-cols-[104px_1fr_30px] items-center gap-x-3 gap-y-[10px] md:grid-cols-[132px_1fr_34px]"
        style={empty ? { opacity: 0.55 } : undefined}
      >
        {EJES.map(({ key, label, strong }) => (
          <Fragment key={key}>
            <span className="text-[13px]" style={{ color: 'var(--ap-ink-2)' }}>
              {label}
            </span>
            <div
              className="h-[10px] overflow-hidden rounded-[2px]"
              style={{ background: 'var(--ap-inert)' }}
            >
              {avgEjes && (
                <i
                  data-testid={`eje-fill-${key}`}
                  className="block h-full"
                  style={{
                    width: `${avgEjes[key] * 10}%`,
                    background: strong
                      ? 'var(--ap-accent)'
                      : 'var(--ap-accent-dark)',
                  }}
                />
              )}
            </div>
            <span
              className="text-right text-[12px]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {avgEjes ? avgEjes[key].toFixed(1) : ''}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
