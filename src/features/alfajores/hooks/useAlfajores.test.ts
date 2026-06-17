import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAlfajores } from './useAlfajores';
import { alfajoresApi } from '../api/alfajores.api';
import type { PaginatedAlfajores } from '../types/alfajores.types';

vi.mock('../api/alfajores.api', () => ({
  alfajoresApi: { list: vi.fn(), byId: vi.fn() },
}));

const PAGE: PaginatedAlfajores = {
  items: [
    {
      id: 'a1',
      nombre: 'Jorgito',
      marcaId: 'm1',
      marca: {
        id: 'm1',
        nombre: 'Jorgito',
        provincia: 'Córdoba',
        logoUrl: null,
      },
      tipo: 'CHOCOLATE',
      descripcion: null,
      imagenUrl: null,
      status: 'APPROVED',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  total: 1,
  page: 1,
  limit: 24,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useAlfajores', () => {
  beforeEach(() => vi.mocked(alfajoresApi.list).mockReset());

  it('fetches the first page passing the filters', async () => {
    vi.mocked(alfajoresApi.list).mockResolvedValue(PAGE);

    const { result } = renderHook(
      () => useAlfajores({ q: 'jorg', tipo: 'CHOCOLATE' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0]).toEqual(PAGE);
    expect(alfajoresApi.list).toHaveBeenCalledWith({
      q: 'jorg',
      tipo: 'CHOCOLATE',
      page: 1,
      limit: 24,
    });
  });

  it('exposes hasNextPage when more items remain', async () => {
    vi.mocked(alfajoresApi.list).mockResolvedValue({
      ...PAGE,
      total: 50,
      limit: 24,
    });

    const { result } = renderHook(() => useAlfajores(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });

  it('surfaces the error state when the request fails', async () => {
    vi.mocked(alfajoresApi.list).mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useAlfajores(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
