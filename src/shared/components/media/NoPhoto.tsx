/**
 * Relleno para slots de imagen vacíos: rayado diagonal en grises + "Sin foto".
 * Reemplaza al placeholder que mostraba el tipo del alfajor — el tipo ya viaja
 * en el badge / la metadata de cada card, y repetirlo dentro del hueco de la
 * foto se leía como si esa fuera la foto.
 */
export function NoPhoto({
  size = 'md',
  className = '',
}: {
  /** `sm` para slots chicos (miniaturas de 64-96px). */
  size?: 'sm' | 'md';
  className?: string;
}) {
  const sm = size === 'sm';

  return (
    <div
      aria-hidden
      className={`bg-gris-25 relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(-45deg, var(--color-gris-50) 0 ${
            sm ? '4px' : '7px'
          }, transparent ${sm ? '4px' : '7px'} ${sm ? '9px' : '15px'})`,
        }}
      />
      <span
        className={`bg-gris-25 text-gris-300 relative rounded-full uppercase ${
          sm
            ? 'px-1.5 py-[1px] text-[0.5rem] tracking-[0.1em]'
            : 'px-2.5 py-[3px] text-[0.62rem] tracking-[0.18em]'
        }`}
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Sin foto
      </span>
    </div>
  );
}
