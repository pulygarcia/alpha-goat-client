/** Tipos de alfajor — espejo del enum `AlfajorTipo` del back. Tuple runtime
 * (fuente única) del que se deriva el type y que reusan schema/selectores. */
export const ALFAJOR_TIPOS = [
  'CHOCOLATE',
  'BLANCO',
  'NEGRO',
  'FRUTAL',
  'MAICENA',
  'OTRO',
] as const;

export type AlfajorTipo = (typeof ALFAJOR_TIPOS)[number];
