'use client';

import Image from 'next/image';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useEffect } from 'react';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

/**
 * Alfajor protagonista del hero: imagen estática con profundidad —
 * glow dorado, flotación idle y parallax sutil siguiendo el mouse.
 */
export function AlfajorFloat() {
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const translateX = useTransform(springX, [-1, 1], [-18, 18]);
  const translateY = useTransform(springY, [-1, 1], [-12, 12]);
  const rotate = useTransform(springX, [-1, 1], [-4, 4]);

  useEffect(() => {
    if (reducedMotion || isMobile) return;
    function onMove(e: MouseEvent) {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY, reducedMotion, isMobile]);

  return (
    <div
      aria-hidden="true"
      // En mobile queda 16 puntos más arriba: con el mismo 44% que en desktop,
      // sobre un ancho de 125vw el alfajor se hundía casi fuera de pantalla.
      className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-[min(125vw,720px)] translate-y-[28%] sm:w-[min(72vw,1000px)] sm:translate-y-[44%]"
    >
      {/* glow dorado detrás del alfajor */}
      <div
        className="absolute inset-[-12%] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(244,160,43,0.22) 0%, rgba(184,96,21,0.10) 45%, transparent 70%)',
        }}
      />
      {/* capa 1: entrada (asciende desde abajo) */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.4, ease: 'easeOut' }}
      >
        {/* capa 2: parallax al mouse (no-op en mobile, no hay mousemove) */}
        <motion.div
          style={
            reducedMotion ? undefined : { x: translateX, y: translateY, rotate }
          }
        >
          {/*
            capa 3: flotación idle. Se desactiva en mobile: es un rAF de
            framer-motion corriendo en loop infinito que, sumado al shader
            WebGL del fondo, hacía competir por el hilo principal con el
            marquee de reseñas y se veía todo trabado.
          */}
          <motion.div
            animate={reducedMotion || isMobile ? undefined : { y: [0, -14, 0] }}
            transition={
              reducedMotion || isMobile
                ? undefined
                : { duration: 5.5, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <Image
              src="/alfajor-hero.png"
              alt=""
              width={1024}
              height={1024}
              priority
              className="h-auto w-full drop-shadow-[0_45px_60px_rgba(0,0,0,0.55)]"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
