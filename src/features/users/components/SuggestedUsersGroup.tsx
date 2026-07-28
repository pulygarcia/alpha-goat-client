'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { UserAvatar } from '@/shared/components/UserAvatar';
import type { UserSearchResult } from '../types/users.types';

/** Cuántos avatares se muestran apilados antes de colapsar el resto. */
const VISIBLE = 5;

/** s entre cada avatar de la tanda de entrada. */
const STEP = 0.03;

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Cada avatar entra de abajo con un resorte corto y firme: rápido, sin rebote
 * exagerado. El escalonado es apenas perceptible (30ms) — con seis avatares la
 * tanda entera cierra en ~350ms.
 *
 * No se reusa `StaggerItem` porque envuelve cada hijo en un `div` propio y eso
 * rompería el `-ml` que produce la superposición.
 */
function entrance(index: number) {
  return {
    initial: { opacity: 0, y: 10, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
      type: 'spring' as const,
      stiffness: 520,
      damping: 30,
      delay: index * STEP,
    },
  };
}

/**
 * Sugeridos en dos estados:
 *
 * - **colapsado** — pila de avatares superpuestos (patrón `AvatarGroup`) con un
 *   contador `+N` cuando sobran;
 * - **expandido** — al tocar el contador la pila se despliega en columna, cada
 *   avatar con su username al lado y sumando los que estaban ocultos.
 *
 * La transición entre ambos es una animación de layout: los avatares que ya
 * estaban en pantalla viajan de su posición apilada a su fila, no desaparecen
 * para volver a aparecer.
 */
export function SuggestedUsersGroup({
  users,
  onSelect,
}: {
  users: UserSearchResult[];
  onSelect: (username: string) => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const reduce = useReducedMotion();

  const shown = expanded ? users : users.slice(0, VISIBLE);
  const rest = users.length - shown.length;

  return (
    <div className="px-1">
      <motion.div
        layout={!reduce}
        transition={{ duration: 0.36, ease: EASE }}
        className={expanded ? 'flex flex-col gap-1' : 'flex items-center pb-1'}
      >
        {shown.map((user, i) => (
          <motion.button
            key={user.id}
            type="button"
            layout={!reduce}
            title={expanded ? undefined : user.username}
            onClick={() => onSelect(user.username)}
            onMouseEnter={() => setActive(user.username)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(user.username)}
            onBlur={() => setActive(null)}
            // El `-ml` negativo (superposición) sólo existe apilado; en columna
            // cada fila arranca en el margen y gana el username al lado.
            className={
              expanded
                ? 'hover:bg-gris-25 focus-visible:ring-gris-200 flex w-full items-center gap-3 rounded-full px-1 py-1 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none'
                : 'ring-blanco-tibio focus-visible:ring-gris-200 -ml-2.5 rounded-full ring-2 transition-transform first:ml-0 hover:z-10 hover:-translate-y-[3px] focus-visible:z-10 focus-visible:-translate-y-[3px] focus-visible:outline-none'
            }
            // Apilado entra escalonado; expandido sólo necesita la transición
            // de layout (si no, los avatares ya montados re-animarían).
            {...(reduce
              ? {}
              : expanded
                ? { transition: { duration: 0.36, ease: EASE } }
                : entrance(i))}
          >
            <motion.span layout={!reduce} className="block shrink-0">
              <UserAvatar
                avatarUrl={user.avatarUrl}
                username={user.username}
                className="block h-11 w-11 rounded-full object-cover"
              />
            </motion.span>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.span
                  initial={reduce ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: -6 }}
                  transition={{
                    duration: 0.24,
                    delay: reduce ? 0 : 0.1 + i * STEP,
                    ease: EASE,
                  }}
                  className="text-ink truncate text-[13.5px] font-medium"
                >
                  {user.username}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}

        {rest > 0 && (
          <motion.button
            key="rest"
            type="button"
            layout={!reduce}
            onClick={() => setExpanded(true)}
            aria-label={`Ver los ${rest} sugeridos restantes`}
            className="bg-gris-25 text-gris-500 ring-blanco-tibio hover:bg-gris-50 focus-visible:ring-gris-200 -ml-2.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ring-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            {...(reduce ? {} : entrance(shown.length))}
          >
            +{rest}
          </motion.button>
        )}
      </motion.div>

      {/* Apilado: el username del avatar apuntado (alto reservado para que no
          empuje la lista). Expandido: sobra, cada fila ya lo muestra. */}
      {!expanded && (
        <p className="text-gris-400 mt-2 h-4 truncate text-[11px]">
          {active ?? ''}
        </p>
      )}
    </div>
  );
}
