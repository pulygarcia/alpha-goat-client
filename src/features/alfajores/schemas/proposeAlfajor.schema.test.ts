import { describe, it, expect } from 'vitest';
import { proposeAlfajorSchema } from './proposeAlfajor.schema';

const valid = {
  nombre: 'Guaymallén Negro',
  marcaId: '550e8400-e29b-41d4-a716-446655440000',
  tipo: 'NEGRO',
};

describe('proposeAlfajorSchema', () => {
  it('accepts a valid proposal', () => {
    expect(proposeAlfajorSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a name shorter than 2 chars', () => {
    const res = proposeAlfajorSchema.safeParse({ ...valid, nombre: 'a' });
    expect(res.success).toBe(false);
  });

  it('rejects a name longer than 150 chars', () => {
    const res = proposeAlfajorSchema.safeParse({
      ...valid,
      nombre: 'x'.repeat(151),
    });
    expect(res.success).toBe(false);
  });

  it('accepts a free-text marca instead of an id', () => {
    const res = proposeAlfajorSchema.safeParse({
      nombre: valid.nombre,
      marcaNombre: 'Dulcinea',
      tipo: valid.tipo,
    });
    expect(res.success).toBe(true);
  });

  it('rejects a missing marca', () => {
    const res = proposeAlfajorSchema.safeParse({ ...valid, marcaId: '' });
    expect(res.success).toBe(false);
  });

  it('rejects both marca sources at once', () => {
    const res = proposeAlfajorSchema.safeParse({
      ...valid,
      marcaNombre: 'Dulcinea',
    });
    expect(res.success).toBe(false);
  });

  it('rejects a free marca name outside 2-120 chars', () => {
    const base = { nombre: valid.nombre, tipo: valid.tipo };
    expect(
      proposeAlfajorSchema.safeParse({ ...base, marcaNombre: 'a' }).success,
    ).toBe(false);
    expect(
      proposeAlfajorSchema.safeParse({
        ...base,
        marcaNombre: 'x'.repeat(121),
      }).success,
    ).toBe(false);
  });

  it('rejects an invalid tipo', () => {
    const res = proposeAlfajorSchema.safeParse({ ...valid, tipo: 'XXX' });
    expect(res.success).toBe(false);
  });
});
