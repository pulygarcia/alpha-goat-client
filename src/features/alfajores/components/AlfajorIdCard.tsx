import { AlfajorImageUploader } from './AlfajorImageUploader';
import type { Alfajor } from '../types/alfajores.types';

function tipoLabel(tipo: string) {
  return tipo.charAt(0) + tipo.slice(1).toLowerCase();
}

/** Ficha de identidad del alfajor: foto, marca, nombre y tipo. */
export function AlfajorIdCard({ alfajor }: { alfajor: Alfajor }) {
  const marca = alfajor.marca;
  const inicial = (marca?.nombre ?? alfajor.nombre).charAt(0).toUpperCase();

  return (
    <div className="flex flex-row items-start gap-[14px] md:gap-6 lg:flex-col lg:gap-[22px]">
      <AlfajorImageUploader
        alfajorId={alfajor.id}
        imagenUrl={alfajor.imagenUrl}
        nombre={alfajor.nombre}
        placeholder={tipoLabel(alfajor.tipo)}
        imageFit="contain"
        className="w-[104px] shrink-0 md:w-[200px] lg:w-full lg:max-w-[340px]"
        slotClassName="relative h-[104px] w-full overflow-hidden rounded-[6px] md:aspect-[433/500] md:h-auto"
      />

      <div className="flex min-w-0 flex-col gap-[10px]">
        <div className="flex flex-wrap items-center gap-[9px]">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px]"
            style={{
              fontFamily: 'var(--font-archivo)',
              background: 'var(--ap-ink)',
              color: '#fff',
            }}
          >
            {inicial}
          </span>
          <span
            className="text-[13px] font-semibold"
            style={{ color: 'var(--ap-ink)' }}
          >
            {marca?.nombre ?? 'Marca desconocida'}
          </span>
          {marca?.provincia && (
            <>
              <span style={{ color: 'var(--color-gris-200)' }}>·</span>
              <span
                className="text-[13px]"
                style={{ color: 'var(--ap-faint)' }}
              >
                {marca.provincia}
              </span>
            </>
          )}
        </div>

        <h1
          className="text-[23px] md:text-[38px]"
          style={{
            fontFamily: 'var(--font-archivo)',
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
            color: 'var(--ap-ink)',
          }}
        >
          {alfajor.nombre}
        </h1>

        <span
          className="self-start rounded-[3px] px-[9px] py-[5px] text-[10px] tracking-[0.16em] uppercase"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--ap-muted)',
            border: '1px solid var(--ap-border)',
          }}
        >
          {tipoLabel(alfajor.tipo)}
        </span>
      </div>
    </div>
  );
}
