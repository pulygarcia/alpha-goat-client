/** Lógica de posición del FAB de reseñar (arrastrable, snap a bordes). */

/**
 * Decide a qué borde horizontal anclar el botón según el centro de su caja:
 * mitad izquierda → 'left', mitad derecha (incluido el punto medio) → 'right'.
 */
export function snapSide(
  centerX: number,
  viewportWidth: number,
): 'left' | 'right' {
  return centerX < viewportWidth / 2 ? 'left' : 'right';
}

/**
 * Mantiene la posición vertical dentro del viewport, con un margen arriba y
 * abajo (para que no se pegue al techo ni al piso).
 */
export function clampY(
  y: number,
  viewportHeight: number,
  fabSize: number,
  margin: number,
): number {
  const min = margin;
  const max = viewportHeight - fabSize - margin;
  return Math.min(Math.max(y, min), max);
}
