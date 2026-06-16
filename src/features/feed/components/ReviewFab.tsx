'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { animate, motion, useMotionValue, type PanInfo } from 'framer-motion';
import { useRef } from 'react';
import { clampY, snapSide } from '../lib/fabPosition';

const SIZE = 64; // px — un poco más grande que los íconos de Next
const MARGIN = 32; // ~2rem de respiro vertical (techo/piso)
const EDGE_GAP = 6; // px — qué tan pegado al borde lateral queda al anclar
const DRAG_THRESHOLD = 6; // px para distinguir tap de arrastre

const SPRING = { type: 'spring', stiffness: 400, damping: 32 } as const;

/**
 * Atajo flotante para reseñar, pensado para el usuario que acaba de probar un
 * alfajor y quiere dejar su reseña a mano. Solo en mobile: arranca abajo a la
 * derecha, se arrastra libre y al soltar se ancla al borde izq/der más cercano
 * (la altura queda donde se dejó). Sin persistencia entre recargas.
 */
export function ReviewFab() {
  const router = useRouter();
  const layerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const wasDragged = useRef(false);

  function handleDragEnd(_: unknown, info: PanInfo) {
    wasDragged.current =
      Math.hypot(info.offset.x, info.offset.y) > DRAG_THRESHOLD;

    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();

    const side = snapSide(rect.left + rect.width / 2, window.innerWidth);
    const targetLeft =
      side === 'left' ? EDGE_GAP : window.innerWidth - EDGE_GAP - rect.width;
    animate(x, x.get() + (targetLeft - rect.left), SPRING);

    const targetTop = clampY(rect.top, window.innerHeight, rect.height, MARGIN);
    animate(y, y.get() + (targetTop - rect.top), SPRING);
  }

  function handleClick() {
    // Si venía de un arrastre, no navegamos (evita abrir /resenar al soltar).
    if (wasDragged.current) {
      wasDragged.current = false;
      return;
    }
    router.push('/resenar');
  }

  return (
    <div
      ref={layerRef}
      className="pointer-events-none fixed inset-0 z-40 sm:hidden"
    >
      <motion.button
        ref={btnRef}
        type="button"
        aria-label="Reseñar un alfajor"
        drag
        dragConstraints={layerRef}
        dragMomentum={false}
        dragElastic={0.04}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        whileTap={{ scale: 0.92 }}
        style={{
          x,
          y,
          width: SIZE,
          height: SIZE,
          right: EDGE_GAP,
          bottom: '2rem',
        }}
        className="bg-paper-raised pointer-events-auto absolute flex touch-none items-center justify-center overflow-hidden rounded-full border border-[rgba(74,30,8,0.18)] p-[7px] shadow-[0_12px_30px_-8px_rgba(44,18,9,0.55)] active:cursor-grabbing"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, rgba(244,160,43,0.30), transparent 70%)',
          }}
        />
        <Image
          src="/alfajor-hero.png"
          alt=""
          width={SIZE}
          height={SIZE}
          className="h-full w-full object-contain"
        />
      </motion.button>
    </div>
  );
}
