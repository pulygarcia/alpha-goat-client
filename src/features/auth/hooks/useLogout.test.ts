import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLogout } from './useLogout';
import { CURRENT_USER_KEY } from './useCurrentUser';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import type { User } from '../types/auth.types';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('../api/auth.api', () => ({
  authApi: { logout: vi.fn() },
}));

const user: User = {
  id: '1',
  email: 'a@b.com',
  username: 'a',
  avatarUrl: null,
  role: 'USER',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function makeWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client }, children);
  };
}

function seededClient() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  client.setQueryData(CURRENT_USER_KEY, user);
  return client;
}

describe('useLogout', () => {
  beforeEach(() => {
    pushMock.mockReset();
    useAuthStore.setState({ user });
    vi.mocked(authApi.logout).mockReset();
  });

  it('clears auth state, nulls the session cache and redirects on success', async () => {
    vi.mocked(authApi.logout).mockResolvedValue();
    const client = seededClient();

    const { result } = renderHook(() => useLogout(), {
      wrapper: makeWrapper(client),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().user).toBeNull();
    expect(client.getQueryData(CURRENT_USER_KEY)).toBeNull();
    expect(pushMock).toHaveBeenCalledWith('/login');
  });

  it('still clears and redirects when the logout request fails (onSettled)', async () => {
    vi.mocked(authApi.logout).mockRejectedValue(new Error('network'));
    const client = seededClient();

    const { result } = renderHook(() => useLogout(), {
      wrapper: makeWrapper(client),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthStore.getState().user).toBeNull();
    expect(client.getQueryData(CURRENT_USER_KEY)).toBeNull();
    expect(pushMock).toHaveBeenCalledWith('/login');
  });
});
