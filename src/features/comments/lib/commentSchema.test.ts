import { describe, it, expect } from 'vitest';
import { commentSchema } from './commentSchema';

describe('commentSchema', () => {
  it('accepts a non-empty comment', () => {
    const result = commentSchema.safeParse({ contenido: 'rico el alfajor' });
    expect(result.success).toBe(true);
  });

  it('trims and rejects a whitespace-only comment', () => {
    const result = commentSchema.safeParse({ contenido: '   ' });
    expect(result.success).toBe(false);
  });

  it('rejects a comment longer than 500 characters', () => {
    const result = commentSchema.safeParse({ contenido: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });
});
