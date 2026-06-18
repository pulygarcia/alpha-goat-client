import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useRegister } from './useRegister';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { notifySuccess, notifyError } from '@/shared/lib/toast';

vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('../api/auth.api', () => ({
  authApi: { register: vi.fn() },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useRegister', () => {
  beforeEach(() => {
    pushMock.mockReset();
    useAuthStore.setState({ user: null });
    vi.mocked(authApi.register).mockReset();
    vi.mocked(notifySuccess).mockReset();
    vi.mocked(notifyError).mockReset();
  });

  const fakeUser = {
    id: '1',
    email: 'a@b.com',
    username: 'a',
    avatarUrl: null,
    role: 'USER' as const,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('on success stores the user and redirects to /feed', async () => {
    vi.mocked(authApi.register).mockResolvedValue({ user: fakeUser });

    const { result } = renderHook(() => useRegister(), { wrapper });

    await act(async () => {
      result.current.mutate({
        email: 'a@b.com',
        password: 'secret123',
        username: 'a',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useAuthStore.getState().user).toEqual(fakeUser);
    expect(pushMock).toHaveBeenCalledWith('/feed');
  });

  it('does not store user on failure', async () => {
    vi.mocked(authApi.register).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useRegister(), { wrapper });

    await act(async () => {
      result.current.mutate({
        email: 'a@b.com',
        password: 'secret123',
        username: 'a',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useAuthStore.getState().user).toBeNull();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('notifica "Cuenta creada" al registrarse', async () => {
    vi.mocked(authApi.register).mockResolvedValue({ user: fakeUser });

    const { result } = renderHook(() => useRegister(), { wrapper });
    await act(async () => {
      result.current.mutate({
        email: 'a@b.com',
        password: 'secret123',
        username: 'a',
      });
    });

    await waitFor(() =>
      expect(notifySuccess).toHaveBeenCalledWith('Cuenta creada'),
    );
  });

  it('notifica error cuando falla el registro', async () => {
    vi.mocked(authApi.register).mockRejectedValue(new Error('409'));

    const { result } = renderHook(() => useRegister(), { wrapper });
    await act(async () => {
      result.current.mutate({
        email: 'a@b.com',
        password: 'secret123',
        username: 'a',
      });
    });

    await waitFor(() =>
      expect(notifyError).toHaveBeenCalledWith('No pudimos crear la cuenta'),
    );
  });
});
