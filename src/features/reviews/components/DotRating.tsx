'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CountUp } from '@/shared/components/motion/CountUp';

const DOTS = Array.from({ length: 11 }, (_, i) => i); // 0..10

function clampToStep(raw: number): number {
  const clamped = Math.min(10, Math.max(0, raw));
  return Math.round(clamped * 2) / 2; // step 0.5
}

/**
 * Selector de puntaje 0-10 (paso 0.5) como fila de 11 puntos tap/drag, en vez
 * del `Slider` de shadcn. Cada punto anima su relleno/escala con framer-motion
 * al arrastrar; el punto "de borde" (el más cercano al valor actual) hace de
 * thumb visual sin serlo literalmente.
 */
export function DotRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  function valueFromClientX(clientX: number): number {
    const track = trackRef.current;
    if (!track) return value;
    const rect = track.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return clampToStep(ratio * 10);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    onChange(valueFromClientX(e.clientX));
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    onChange(valueFromClientX(e.clientX));
  }

  function handlePointerUp() {
    setDragging(false);
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-ink text-[14px] font-medium">{label}</span>
        <span
          className="text-curry-deep text-[15px] font-bold tabular-nums"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <CountUp value={value} decimals={1} durationMs={150} />
        </span>
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={value}
        aria-orientation="horizontal"
        className="flex h-6 cursor-pointer touch-none items-center justify-between rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[rgba(74,30,8,0.35)]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        {DOTS.map((dot) => {
          const filled = dot <= Math.floor(value);
          const half = !filled && dot === Math.ceil(value) && value % 1 !== 0;
          const isEdge = dot === Math.round(value);

          return (
            <motion.span
              key={dot}
              aria-hidden
              className="rounded-full"
              style={{
                width: 8,
                height: 8,
                background: half
                  ? 'linear-gradient(90deg, #b3702a 50%, var(--color-paper-emph) 50%)'
                  : filled
                    ? '#b3702a'
                    : 'var(--color-paper-emph)',
              }}
              animate={{
                scale: isEdge ? 1.5 : 1,
                opacity: filled || half || isEdge ? 1 : 0.55,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          );
        })}
      </div>
    </div>
  );
}
