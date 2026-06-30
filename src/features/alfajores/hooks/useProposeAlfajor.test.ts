import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProposeAlfajor } from './useProposeAlfajor';
import { alfajoresApi } from '../api/alfajores.api';

vi.mock('../api/alfajores.api', () => ({
  alfajoresApi: { create: vi.fn() },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

const input = { nombre: 'Tatín Negro', marcaId: 'm1', tipo: 'NEGRO' as const };

describe('useProposeAlfajor', () => {
  beforeEach(() => {
    vi.mocked(alfajoresApi.create).mockReset();
  });

  it('creates the alfajor with the given input', async () => {
    vi.mocked(alfajoresApi.create).mockResolvedValue({ id: 'a1' } as never);

    const { result } = renderHook(() => useProposeAlfajor(), { wrapper });
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(alfajoresApi.create).toHaveBeenCalledWith(input);
  });

  it('surfaces the error state when the request fails', async () => {
    vi.mocked(alfajoresApi.create).mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useProposeAlfajor(), { wrapper });
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
