import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUpdateProfile } from './useUpdateProfile';
import { useChangePassword } from './useChangePassword';
import { profileApi } from '../api/profile.api';
import { notifySuccess, notifyError } from '@/shared/lib/toast';

vi.mock('../api/profile.api', () => ({
  profileApi: { updateMe: vi.fn(), changePassword: vi.fn() },
}));
vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useUpdateProfile', () => {
  beforeEach(() => {
    vi.mocked(profileApi.updateMe).mockReset();
    vi.mocked(notifySuccess).mockReset();
    vi.mocked(notifyError).mockReset();
  });

  it('updates the username and notifies success', async () => {
    vi.mocked(profileApi.updateMe).mockResolvedValue({ id: 'u1' } as never);

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });
    result.current.mutate({ username: 'newname' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(profileApi.updateMe).toHaveBeenCalledWith({ username: 'newname' });
    expect(notifySuccess).toHaveBeenCalled();
  });

  it('notifies error on failure', async () => {
    vi.mocked(profileApi.updateMe).mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });
    result.current.mutate({ username: 'x' });

    await waitFor(() => expect(notifyError).toHaveBeenCalled());
  });
});

describe('useChangePassword', () => {
  beforeEach(() => {
    vi.mocked(profileApi.changePassword).mockReset();
    vi.mocked(notifySuccess).mockReset();
    vi.mocked(notifyError).mockReset();
  });

  it('changes the password and notifies success', async () => {
    vi.mocked(profileApi.changePassword).mockResolvedValue();

    const { result } = renderHook(() => useChangePassword(), { wrapper });
    result.current.mutate({
      currentPassword: 'old',
      newPassword: 'newpass1',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(profileApi.changePassword).toHaveBeenCalledWith({
      currentPassword: 'old',
      newPassword: 'newpass1',
    });
    expect(notifySuccess).toHaveBeenCalled();
  });

  it('notifies error on failure', async () => {
    vi.mocked(profileApi.changePassword).mockRejectedValueOnce(
      new Error('bad'),
    );

    const { result } = renderHook(() => useChangePassword(), { wrapper });
    result.current.mutate({ currentPassword: 'x', newPassword: 'y' });

    await waitFor(() => expect(notifyError).toHaveBeenCalled());
  });
});
