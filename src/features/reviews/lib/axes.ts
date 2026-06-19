import type { ReviewCardAxes } from './reviewCardVM';

/** Etiquetas legibles de los 5 ejes, en el orden en que se muestran. */
export const AXIS_LABELS: Record<keyof ReviewCardAxes, string> = {
  dulzor: 'Dulzor',
  cantidadDDL: 'Cantidad de DDL',
  calidadBano: 'Calidad del baño',
  ratioTapaRelleno: 'Tapa / Relleno',
  textura: 'Textura',
};

export const AXIS_KEYS = Object.keys(AXIS_LABELS) as Array<
  keyof ReviewCardAxes
>;
