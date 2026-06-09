import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFeaturedMarcas } from './useFeaturedMarcas';
import { marcasApi } from '../api/marcas.api';
import type { FeaturedMarca } from '../types/marcas.types';

vi.mock('../api/marcas.api', () => ({
  marcasApi: { featured: vi.fn() },
}));

const MARCAS: FeaturedMarca[] = [
  {
    id: 'm1',
    nombre: 'Cachafaz',
    provincia: 'Buenos Aires',
    logoUrl: null,
    productCount: 14,
    avgScore: 7.8,
  },
  {
    id: 'm2',
    nombre: 'Tatín',
    provincia: null,
    logoUrl: 'https://cdn.example/tatin.png',
    productCount: 9,
    avgScore: 7.6,
  },
];

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useFeaturedMarcas', () => {
  beforeEach(() => {
    vi.mocked(marcasApi.featured).mockReset();
  });

  it('returns the featured marcas from GET /marcas/featured', async () => {
    vi.mocked(marcasApi.featured).mockResolvedValue(MARCAS);

    const { result } = renderHook(() => useFeaturedMarcas(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(MARCAS);
    expect(marcasApi.featured).toHaveBeenCalledTimes(1);
  });

  it('surfaces the error state when the request fails', async () => {
    vi.mocked(marcasApi.featured).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useFeaturedMarcas(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
