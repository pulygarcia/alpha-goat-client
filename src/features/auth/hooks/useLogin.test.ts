import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLogin } from './useLogin';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { notifyError } from '@/shared/lib/toast';

vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

const pushMock = vi.fn();
let nextParam: string | null = null;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({
    get: (k: string) => (k === 'next' ? nextParam : null),
  }),
}));

vi.mock('../api/auth.api', () => ({
  authApi: { login: vi.fn() },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useLogin', () => {
  beforeEach(() => {
    pushMock.mockReset();
    nextParam = null;
    useAuthStore.setState({ user: null });
    vi.mocked(authApi.login).mockReset();
    vi.mocked(notifyError).mockReset();
  });

  it('on success stores the user and redirects home', async () => {
    const user = {
      id: '1',
      email: 'a@b.com',
      username: 'a',
      avatarUrl: null,
      role: 'USER' as const,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    vi.mocked(authApi.login).mockResolvedValue({ user });

    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      result.current.mutate({ email: 'a@b.com', password: 'secret' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().user).toEqual(user);
    expect(pushMock).toHaveBeenCalledWith('/feed');
  });

  it('honors a safe ?next= redirect', async () => {
    nextParam = '/perfil';
    const user = {
      id: '1',
      email: 'a@b.com',
      username: 'a',
      avatarUrl: null,
      role: 'USER' as const,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    vi.mocked(authApi.login).mockResolvedValue({ user });

    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      result.current.mutate({ email: 'a@b.com', password: 'secret' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pushMock).toHaveBeenCalledWith('/perfil');
  });

  it('ignores an unsafe ?next= (open redirect protection)', async () => {
    nextParam = '//evil.com';
    const user = {
      id: '1',
      email: 'a@b.com',
      username: 'a',
      avatarUrl: null,
      role: 'USER' as const,
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    vi.mocked(authApi.login).mockResolvedValue({ user });

    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      result.current.mutate({ email: 'a@b.com', password: 'secret' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pushMock).toHaveBeenCalledWith('/feed');
  });

  it('surfaces the error and does not redirect on failure', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      result.current.mutate({ email: 'a@b.com', password: 'secret' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthStore.getState().user).toBeNull();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('notifica error cuando falla el login', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('401'));

    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      result.current.mutate({ email: 'a@b.com', password: 'secret' });
    });

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith('No pudimos iniciar sesión'),
    );
  });
});
