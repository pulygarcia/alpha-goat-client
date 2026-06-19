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

  it('accepts a comment exactly at the 280 limit', () => {
    const result = commentSchema.safeParse({ contenido: 'a'.repeat(280) });
    expect(result.success).toBe(true);
  });

  it('rejects a comment longer than 280 characters', () => {
    const result = commentSchema.safeParse({ contenido: 'a'.repeat(281) });
    expect(result.success).toBe(false);
  });
});
