'use client';

import { useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { CountUp } from '@/shared/components/motion/CountUp';

function clampToStep(raw: number): number {
  const clamped = Math.min(10, Math.max(0, raw));
  return Math.round(clamped * 2) / 2; // step 0.5
}

/** Marcas cada 1 punto sobre la barra: dan la escala sin dibujar 11 puntos. */
const TICKS = 'repeating-linear-gradient(90deg,transparent 0 calc(10% - 1px),';

/**
 * Puntaje 0-10 (paso 0.5) como barra arrastrable. Reemplaza a la fila de
 * puntitos: en mobile el objetivo táctil pasa de 8px a toda la barra.
 *
 * `hero` es el puntaje general — bloque oscuro con el número gigante y botones
 * de medio punto, porque es el único obligatorio. `axis` son los cinco ejes,
 * en una fila compacta.
 *
 * Sigue siendo un `role="slider"` con teclado: la barra es la piel, no el
 * contrato de accesibilidad.
 */
export function ScoreBar({
  label,
  value,
  onChange,
  variant = 'axis',
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  variant?: 'hero' | 'axis';
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const hero = variant === 'hero';

  function valueFromClientX(clientX: number): number {
    const track = trackRef.current;
    if (!track) return value;
    const rect = track.getBoundingClientRect();
    return clampToStep(((clientX - rect.left) / rect.width) * 10);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    onChange(valueFromClientX(e.clientX));
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragging) onChange(valueFromClientX(e.clientX));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(clampToStep(value + 0.5));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(clampToStep(value - 0.5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(10);
    }
  }

  const track = (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={10}
      aria-valuenow={value}
      aria-orientation="horizontal"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={handleKeyDown}
      className={`relative flex-1 cursor-pointer touch-none overflow-hidden rounded-full outline-none focus-visible:ring-2 ${
        hero
          ? 'h-11 bg-white/15 focus-visible:ring-white/50'
          : 'bg-gris-25 focus-visible:ring-gris-200 h-8'
      }`}
    >
      <motion.span
        // El relleno del hero es gris-25 y no un gris más oscuro: contra el
        // chocolate del bloque es el único escalón de la rampa que no se apaga.
        className={`absolute inset-y-0 left-0 rounded-full ${hero ? 'bg-gris-25' : 'bg-gris-500'}`}
        animate={{ width: `${(value / 10) * 100}%` }}
        transition={{ type: 'spring', stiffness: 520, damping: 40 }}
      />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `${TICKS}${hero ? 'color-mix(in oklab, var(--color-ink) 28%, transparent)' : 'var(--color-blanco-tibio)'} calc(10% - 1px) 10%)`,
        }}
      />
    </div>
  );

  if (!hero) {
    return (
      <div className="flex items-center gap-2.5">
        <span
          className="text-gris-500 w-[72px] flex-none text-[9.5px] leading-[1.25] tracking-[0.12em] uppercase"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {label}
        </span>
        {track}
        <span
          className="w-[28px] flex-none text-right text-[13px] tabular-nums"
          style={{
            fontFamily: 'var(--font-archivo)',
            letterSpacing: '-0.03em',
            // Bajo 7 el valor se pinta en caramelo: el eje flojo se encuentra
            // de un vistazo, sin leer los cinco números.
            color: value < 7 ? 'var(--color-cinnamon)' : 'var(--color-ink)',
          }}
        >
          {Number.isInteger(value) ? value : value.toFixed(1)}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-ink text-blanco-tibio rounded-[14px] px-4 pt-3 pb-3.5">
      <div className="flex items-end gap-3">
        <span
          className="pb-1.5 text-[10px] leading-[1.3] tracking-[0.2em] text-white/60 uppercase"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Puntaje
          <br />
          general
        </span>
        <span
          className="ml-auto text-[38px] leading-[0.8] tabular-nums"
          style={{
            fontFamily: 'var(--font-archivo)',
            letterSpacing: '-0.055em',
          }}
        >
          <CountUp value={value} decimals={1} durationMs={150} />
        </span>
        <span
          className="pb-1 text-[10px] text-white/55"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          /10
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        <StepButton
          label="Bajar medio punto"
          onClick={() => onChange(clampToStep(value - 0.5))}
        >
          <Minus className="h-5 w-5" strokeWidth={2} />
        </StepButton>
        {track}
        <StepButton
          label="Subir medio punto"
          onClick={() => onChange(clampToStep(value + 0.5))}
        >
          <Plus className="h-5 w-5" strokeWidth={2} />
        </StepButton>
      </div>
    </div>
  );
}

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 flex-none items-center justify-center rounded-[10px] border border-white/35 transition-colors hover:bg-white/15"
    >
      {children}
    </button>
  );
}
