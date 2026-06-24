'use client';

import { motion, useReducedMotion } from 'framer-motion';

const STEP = 0.045; // s entre cada item de una misma tanda
const MAX_DELAY = 0.32; // tope: tandas largas no esperan eternamente

/**
 * Envuelve un item de una lista para que entre con un fade+subida escalonado.
 * `index` es la posición dentro de su tanda (no el índice global): así cada
 * página del infinite scroll escalona solo sus propios items y las cards ya
 * montadas no vuelven a animarse. Respeta `prefers-reduced-motion`.
 */
export function StaggerItem({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        delay: Math.min(index * STEP, MAX_DELAY),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
