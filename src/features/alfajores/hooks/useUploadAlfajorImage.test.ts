import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUploadAlfajorImage } from './useUploadAlfajorImage';
import { alfajoresApi } from '../api/alfajores.api';
import { notifySuccess, notifyError } from '@/shared/lib/toast';

vi.mock('../api/alfajores.api', () => ({
  alfajoresApi: { uploadImage: vi.fn() },
}));
vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

let client: QueryClient;

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useUploadAlfajorImage', () => {
  beforeEach(() => {
    client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(alfajoresApi.uploadImage).mockReset();
    vi.mocked(notifySuccess).mockReset();
    vi.mocked(notifyError).mockReset();
  });

  it('uploads the file, invalidates alfajores queries and notifies success', async () => {
    vi.mocked(alfajoresApi.uploadImage).mockResolvedValue({
      id: 'a1',
    } as never);
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const file = new File(['x'], 'alfajor.png', { type: 'image/png' });

    const { result } = renderHook(() => useUploadAlfajorImage('a1'), {
      wrapper,
    });
    result.current.mutate(file);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(alfajoresApi.uploadImage).toHaveBeenCalledWith('a1', file);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['alfajores'] });
    expect(notifySuccess).toHaveBeenCalled();
  });

  it('notifies error on failure', async () => {
    vi.mocked(alfajoresApi.uploadImage).mockRejectedValueOnce(
      new Error('boom'),
    );
    const file = new File(['x'], 'alfajor.png', { type: 'image/png' });

    const { result } = renderHook(() => useUploadAlfajorImage('a1'), {
      wrapper,
    });
    result.current.mutate(file);

    await waitFor(() => expect(notifyError).toHaveBeenCalled());
  });
});
