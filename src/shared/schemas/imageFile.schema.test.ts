import { describe, it, expect } from 'vitest';
import {
  imageFileSchema,
  IMAGE_ACCEPTED_TYPES,
  IMAGE_MAX_BYTES,
} from './imageFile.schema';

function fakeFile(type: string, size: number): File {
  const file = new File(['x'], 'image', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('imageFileSchema', () => {
  it('accepts a jpeg/png/webp under the max size', () => {
    for (const type of IMAGE_ACCEPTED_TYPES) {
      expect(imageFileSchema.safeParse(fakeFile(type, 1024)).success).toBe(
        true,
      );
    }
  });

  it('rejects an unsupported type', () => {
    expect(imageFileSchema.safeParse(fakeFile('image/gif', 1024)).success).toBe(
      false,
    );
  });

  it('rejects a file larger than the max size', () => {
    expect(
      imageFileSchema.safeParse(fakeFile('image/png', IMAGE_MAX_BYTES + 1))
        .success,
    ).toBe(false);
  });

  it('exposes a 5 MB limit', () => {
    expect(IMAGE_MAX_BYTES).toBe(5 * 1024 * 1024);
  });
});
