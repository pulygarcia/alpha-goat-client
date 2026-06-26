import { describe, it, expect } from 'vitest';
import {
  usernameSchema,
  passwordSchema,
  avatarFileSchema,
} from './editProfile.schema';

function fakeFile(type: string, size: number): File {
  const file = new File(['x'], 'avatar', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('usernameSchema', () => {
  it('accepts a valid username', () => {
    expect(usernameSchema.safeParse({ username: 'puly_10' }).success).toBe(
      true,
    );
  });

  it('rejects usernames shorter than 3 chars', () => {
    expect(usernameSchema.safeParse({ username: 'ab' }).success).toBe(false);
  });

  it('rejects forbidden characters', () => {
    expect(usernameSchema.safeParse({ username: 'pu ly!' }).success).toBe(
      false,
    );
  });
});

describe('passwordSchema', () => {
  it('accepts current + new password (8+)', () => {
    const res = passwordSchema.safeParse({
      currentPassword: 'oldpass1',
      newPassword: 'newpass1',
    });
    expect(res.success).toBe(true);
  });

  it('rejects a new password shorter than 8 chars', () => {
    const res = passwordSchema.safeParse({
      currentPassword: 'oldpass1',
      newPassword: 'short',
    });
    expect(res.success).toBe(false);
  });

  it('requires the current password', () => {
    const res = passwordSchema.safeParse({
      currentPassword: '',
      newPassword: 'newpass1',
    });
    expect(res.success).toBe(false);
  });
});

describe('avatarFileSchema', () => {
  it('accepts a jpeg/png/webp under 5 MB', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(avatarFileSchema.safeParse(fakeFile(type, 1024)).success).toBe(
        true,
      );
    }
  });

  it('rejects an unsupported type', () => {
    const res = avatarFileSchema.safeParse(fakeFile('image/gif', 1024));
    expect(res.success).toBe(false);
  });

  it('rejects a file larger than 5 MB', () => {
    const res = avatarFileSchema.safeParse(
      fakeFile('image/png', 5 * 1024 * 1024 + 1),
    );
    expect(res.success).toBe(false);
  });
});
