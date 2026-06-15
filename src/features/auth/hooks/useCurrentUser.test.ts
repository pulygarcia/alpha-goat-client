import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCurrentUser } from './useCurrentUser';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import type { User } from '../types/auth.types';

vi.mock('../api/auth.api', () => ({
  authApi: { me: vi.fn() },
}));

const user: User = {
  id: '1',
  email: 'a@b.com',
  username: 'a',
  avatarUrl: null,
  role: 'USER',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useCurrentUser', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null });
    vi.mocked(authApi.me).mockReset();
  });

  it('seeds the cache from initialUser without calling the API', async () => {
    const { result } = renderHook(() => useCurrentUser(user), { wrapper });

    expect(result.current.data).toEqual(user);
    await waitFor(() => expect(useAuthStore.getState().user).toEqual(user));
    expect(authApi.me).not.toHaveBeenCalled();
  });

  it('fetches the session from the API when no initialUser is given', async () => {
    vi.mocked(authApi.me).mockResolvedValue(user);

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(authApi.me).toHaveBeenCalledOnce();
    expect(result.current.data).toEqual(user);
    await waitFor(() => expect(useAuthStore.getState().user).toEqual(user));
  });

  it('does not store a user while the session query is failing', async () => {
    vi.mocked(authApi.me).mockRejectedValue(new Error('401'));

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthStore.getState().user).toBeNull();
  });
});
