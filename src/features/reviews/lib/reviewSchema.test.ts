import { describe, it, expect } from 'vitest';
import { reviewSchema } from './reviewSchema';

const valid = {
  ratingGeneral: 8,
  dulzor: 7,
  cantidadDDL: 9,
  calidadBano: 8,
  ratioTapaRelleno: 6,
  textura: 8,
  comentario: '',
};

describe('reviewSchema', () => {
  it('accepts valid ratings and an empty comment', () => {
    expect(reviewSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a rating above 10', () => {
    expect(reviewSchema.safeParse({ ...valid, dulzor: 11 }).success).toBe(
      false,
    );
  });

  it('rejects a negative rating', () => {
    expect(reviewSchema.safeParse({ ...valid, textura: -1 }).success).toBe(
      false,
    );
  });

  it('rejects a comment longer than 500 chars', () => {
    expect(
      reviewSchema.safeParse({ ...valid, comentario: 'x'.repeat(501) }).success,
    ).toBe(false);
  });
});
