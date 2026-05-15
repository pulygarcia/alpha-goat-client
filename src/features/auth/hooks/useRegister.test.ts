import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useRegister } from './useRegister';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('../api/auth.api', () => ({
  authApi: { register: vi.fn() },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useRegister', () => {
  beforeEach(() => {
    pushMock.mockReset();
    useAuthStore.setState({ user: null });
    vi.mocked(authApi.register).mockReset();
  });

  it('on success stores the user and redirects home', async () => {
    const user = { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'USER' as const };
    vi.mocked(authApi.register).mockResolvedValue({ user });

    const { result } = renderHook(() => useRegister(), { wrapper });

    await act(async () => {
      result.current.mutate({ email: 'a@b.com', password: 'secret123', firstName: 'A', lastName: 'B' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().user).toEqual(user);
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('does not store user on failure', async () => {
    vi.mocked(authApi.register).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useRegister(), { wrapper });

    await act(async () => {
      result.current.mutate({ email: 'a@b.com', password: 'secret123', firstName: 'A', lastName: 'B' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthStore.getState().user).toBeNull();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
