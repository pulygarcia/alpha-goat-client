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

  it('rejects a missing marca', () => {
    const res = proposeAlfajorSchema.safeParse({ ...valid, marcaId: '' });
    expect(res.success).toBe(false);
  });

  it('rejects an invalid tipo', () => {
    const res = proposeAlfajorSchema.safeParse({ ...valid, tipo: 'XXX' });
    expect(res.success).toBe(false);
  });
});
