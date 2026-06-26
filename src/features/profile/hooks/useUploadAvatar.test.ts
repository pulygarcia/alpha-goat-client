import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUploadAvatar } from './useUploadAvatar';
import { profileApi } from '../api/profile.api';
import { notifySuccess, notifyError } from '@/shared/lib/toast';

vi.mock('../api/profile.api', () => ({
  profileApi: { uploadAvatar: vi.fn() },
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

describe('useUploadAvatar', () => {
  beforeEach(() => {
    vi.mocked(profileApi.uploadAvatar).mockReset();
    vi.mocked(notifySuccess).mockReset();
    vi.mocked(notifyError).mockReset();
  });

  it('uploads the file and notifies success', async () => {
    vi.mocked(profileApi.uploadAvatar).mockResolvedValue({ id: 'u1' } as never);
    const file = new File(['x'], 'avatar.png', { type: 'image/png' });

    const { result } = renderHook(() => useUploadAvatar(), { wrapper });
    result.current.mutate(file);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(profileApi.uploadAvatar).toHaveBeenCalledWith(file);
    expect(notifySuccess).toHaveBeenCalled();
  });

  it('notifies error on failure', async () => {
    vi.mocked(profileApi.uploadAvatar).mockRejectedValueOnce(new Error('boom'));
    const file = new File(['x'], 'avatar.png', { type: 'image/png' });

    const { result } = renderHook(() => useUploadAvatar(), { wrapper });
    result.current.mutate(file);

    await waitFor(() => expect(notifyError).toHaveBeenCalled());
  });
});
