# Tour de onboarding del feed (paso 1 — FAB)

## Contexto

Los usuarios que entran al feed por primera vez no tienen forma de descubrir el
`ReviewFab` (el alfajor flotante que abre el quick-review) ni otras acciones
clave de la app. Se necesita un instructivo "en caliente" — tooltips con
spotlight apuntando a elementos de la UI — que aparezca la primera vez y no
vuelva a molestar.

Esta es la primera fase: un único paso apuntando al FAB. Perfil y álbum quedan
para una fase posterior, agregados como steps adicionales del mismo
componente.

## Alcance

- Un solo step de tour, mobile only (el `ReviewFab` ya es `sm:hidden`).
- Corre para cualquier visitante del feed, logueado o anónimo.
- Persistencia en `localStorage`, sin tocar el backend.
- No hay versión desktop en esta fase — no existe hoy un CTA de reseñar
  equivalente al FAB en desktop.

## Librería

`react-joyride`: soporta spotlight + arrow + beacon pulsante, overlay que
oscurece el resto de la pantalla, y callback al cerrar/completar para
persistir el flag de "visto". Es la opción más madura del ecosistema React
para este patrón; se descartó `driver.js` por integrar peor con un target
controlado por Framer Motion (el FAB es draggable).

## Arquitectura

Feature nueva `src/features/onboarding/`:

- `components/FeedTour.tsx` — client component, wrapper de `react-joyride`
  con el step único. Recibe el `ref` del botón del FAB como target.
- `hooks/useFeedTourSeen.ts` — hook que lee/escribe la key de localStorage y
  expone `{ seen, markSeen }`.

`FeedTour` se monta junto al `ReviewFab`, no dentro de `AppLayout` — el FAB ya
tiene su propio `btnRef`, así que es más simple pasarlo a `FeedTour` que
levantar un ref compartido hasta el layout.

## Trigger y persistencia

- Key de localStorage: `alphagoat:onboarding:feed-fab-seen` (namespaced para
  dejar lugar a futuros steps de onboarding sin colisionar).
- Se muestra si: viewport mobile (mismo breakpoint que el FAB, `sm:hidden`) Y
  la key no está en localStorage.
- Se marca como visto (`markSeen()`) en cualquiera de estos casos:
  - El usuario completa el step (callback de joyride con status `finished`).
  - El usuario lo descarta (`skipped` / click fuera / esc).
  - El usuario abre el `QuickReviewModal` desde el FAB mientras el tour está
    visible — ya cumplió el objetivo, así que el tour se cierra y se marca
    visto en el mismo evento.
- `useFeedTourSeen` debe ser seguro en SSR: si `window`/`localStorage` no
  están disponibles, devuelve `seen: true` (no se muestra) en vez de romper el
  render de servidor.

## Contenido y estilo

- Target: el botón del FAB (`btnRef` existente en `ReviewFab.tsx`).
- Copy: "Clickeá el alfajor flotante para hacer una reseña rápido" (el texto
  final de tono/voz se ajusta en implementación).
- Sin botón "Anterior" — es un único paso. Botón de cierre/CTA ("Entendido")
  en `curry`.
- Colores del tooltip tomados del design system: fondo `bg-blanco-tibio`,
  texto en el tono `chocolate` de la rampa, acento `curry` en el botón.
- El beacon pulsante de joyride se reemplaza por la utilidad `.pulse-dot` ya
  existente en `globals.css`, para consistencia visual con el resto de la
  app en vez del beacon default de la librería.
- Delay de ~600ms antes de aparecer, para no pisar la animación de entrada
  del feed (hero, stagger de cards).

## Edge cases

- El FAB es draggable pero sin persistencia de posición entre reloads —
  siempre arranca en la misma posición (abajo a la derecha), así que el
  spotlight calculado sobre `getBoundingClientRect()` en mount siempre apunta
  al lugar correcto.
- Si el viewport cambia de mobile a desktop mientras el tour está abierto
  (rotación / resize), el tour se cierra sin marcar visto forzosamente — se
  re-evalúa la próxima vez que el usuario esté en mobile. (Caso raro, no
  requiere lógica especial más allá de que el componente deje de renderizar
  si el breakpoint cambia.)

## Testing

- `useFeedTourSeen.test.ts`: set/get de localStorage, comportamiento cuando
  `localStorage` no está disponible (devuelve `seen: true`).
- `FeedTour`: no se testea en profundidad al ser mayormente wiring de una
  librería de terceros. Se verifica que no renderiza si el flag ya está
  seteado, y que `markSeen` se llama al completar/skippear el step.
- No se testean estilos ni el comportamiento interno de `react-joyride`.

## Fuera de alcance

- Steps adicionales (perfil, álbum) — se suman como steps 2 y 3 del mismo
  `FeedTour` en una fase posterior.
- Persistencia en backend / cross-device.
- Versión desktop del tour.
