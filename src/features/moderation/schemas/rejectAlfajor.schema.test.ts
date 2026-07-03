import { describe, it, expect } from 'vitest';
import { rejectAlfajorSchema } from './rejectAlfajor.schema';

describe('rejectAlfajorSchema', () => {
  it('accepts a valid reason and trims it', () => {
    const result = rejectAlfajorSchema.parse({
      rejectionReason: '  Marca inexistente  ',
    });
    expect(result.rejectionReason).toBe('Marca inexistente');
  });

  it('rejects an empty or whitespace-only reason', () => {
    expect(
      rejectAlfajorSchema.safeParse({ rejectionReason: '   ' }).success,
    ).toBe(false);
  });

  it('rejects a reason longer than 500 characters', () => {
    expect(
      rejectAlfajorSchema.safeParse({ rejectionReason: 'x'.repeat(501) })
        .success,
    ).toBe(false);
  });
});
