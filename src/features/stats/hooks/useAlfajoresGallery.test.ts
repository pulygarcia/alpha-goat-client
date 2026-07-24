import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAlfajoresGallery } from './useAlfajoresGallery';
import { alfajoresApi } from '@/features/alfajores/api/alfajores.api';
import type { PaginatedAlfajores } from '@/features/alfajores/types/alfajores.types';

vi.mock('@/features/alfajores/api/alfajores.api', () => ({
  alfajoresApi: { list: vi.fn() },
}));

const PAGE: PaginatedAlfajores = {
  items: [
    {
      id: 'a1',
      nombre: 'Águila',
      tipo: 'CHOCOLATE',
      imagenUrl: 'a.png',
      marca: null,
    },
  ],
  total: 1,
  page: 1,
  limit: 100,
} as unknown as PaginatedAlfajores;

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useAlfajoresGallery', () => {
  beforeEach(() => {
    vi.mocked(alfajoresApi.list).mockReset();
    vi.mocked(alfajoresApi.list).mockResolvedValue(PAGE);
  });

  it('fetches a batch of alfajores for the dome gallery', async () => {
    const { result } = renderHook(() => useAlfajoresGallery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(PAGE));
    expect(alfajoresApi.list).toHaveBeenCalledWith({ limit: 100 });
  });
});
