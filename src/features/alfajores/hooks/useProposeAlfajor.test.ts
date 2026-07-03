import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProposeAlfajor } from './useProposeAlfajor';
import { alfajoresApi } from '../api/alfajores.api';

vi.mock('../api/alfajores.api', () => ({
  alfajoresApi: { create: vi.fn(), uploadImage: vi.fn() },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

const input = { nombre: 'Tatín Negro', marcaId: 'm1', tipo: 'NEGRO' as const };
const foto = new File(['x'], 'alfajor.png', { type: 'image/png' });

describe('useProposeAlfajor', () => {
  beforeEach(() => {
    vi.mocked(alfajoresApi.create).mockReset();
    vi.mocked(alfajoresApi.uploadImage).mockReset();
  });

  it('creates the alfajor without uploading when no photo is given', async () => {
    vi.mocked(alfajoresApi.create).mockResolvedValue({ id: 'a1' } as never);

    const { result } = renderHook(() => useProposeAlfajor(), { wrapper });
    result.current.mutate({ input });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(alfajoresApi.create).toHaveBeenCalledWith(input);
    expect(alfajoresApi.uploadImage).not.toHaveBeenCalled();
    expect(result.current.data?.fotoUploaded).toBe(true);
  });

  it('uploads the photo with the created id when given', async () => {
    vi.mocked(alfajoresApi.create).mockResolvedValue({ id: 'a1' } as never);
    vi.mocked(alfajoresApi.uploadImage).mockResolvedValue({} as never);

    const { result } = renderHook(() => useProposeAlfajor(), { wrapper });
    result.current.mutate({ input, foto });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(alfajoresApi.uploadImage).toHaveBeenCalledWith('a1', foto);
    expect(result.current.data?.fotoUploaded).toBe(true);
  });

  it('still succeeds with fotoUploaded=false when the upload fails', async () => {
    vi.mocked(alfajoresApi.create).mockResolvedValue({ id: 'a1' } as never);
    vi.mocked(alfajoresApi.uploadImage).mockRejectedValue(new Error('cloud'));

    const { result } = renderHook(() => useProposeAlfajor(), { wrapper });
    result.current.mutate({ input, foto });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.fotoUploaded).toBe(false);
  });

  it('surfaces the error state when the create fails', async () => {
    vi.mocked(alfajoresApi.create).mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useProposeAlfajor(), { wrapper });
    result.current.mutate({ input, foto });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(alfajoresApi.uploadImage).not.toHaveBeenCalled();
  });
});
