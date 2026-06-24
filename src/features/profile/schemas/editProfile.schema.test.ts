import { describe, it, expect } from 'vitest';
import { usernameSchema, passwordSchema } from './editProfile.schema';

describe('usernameSchema', () => {
  it('accepts a valid username', () => {
    expect(usernameSchema.safeParse({ username: 'puly_10' }).success).toBe(true);
  });

  it('rejects usernames shorter than 3 chars', () => {
    expect(usernameSchema.safeParse({ username: 'ab' }).success).toBe(false);
  });

  it('rejects forbidden characters', () => {
    expect(usernameSchema.safeParse({ username: 'pu ly!' }).success).toBe(false);
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
