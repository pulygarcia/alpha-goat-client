import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth.store';
import type { User } from '../types/auth.types';

const user: User = {
  id: '1',
  email: 'a@b.com',
  username: 'a',
  avatarUrl: null,
  role: 'USER',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('auth.store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null });
  });

  it('starts with no user', () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setUser stores the given user', () => {
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('setUser(null) clears the user', () => {
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('logout resets the user to null', () => {
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
