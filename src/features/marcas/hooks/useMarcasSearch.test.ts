import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useMarcasSearch } from './useMarcasSearch';
import { marcasApi } from '../api/marcas.api';
import type { PaginatedMarcas } from '../types/marcas.types';

vi.mock('../api/marcas.api', () => ({
  marcasApi: { search: vi.fn() },
}));

const PAGE: PaginatedMarcas = {
  items: [{ id: 'm1', nombre: 'Havanna', provincia: null, logoUrl: null }],
  total: 1,
  page: 1,
  limit: 10,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useMarcasSearch', () => {
  beforeEach(() => {
    vi.mocked(marcasApi.search).mockReset();
    vi.mocked(marcasApi.search).mockResolvedValue(PAGE);
  });

  it('returns the marcas for the given query', async () => {
    const { result } = renderHook(() => useMarcasSearch('hava'), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(PAGE.items));
    expect(marcasApi.search).toHaveBeenCalledWith('hava');
  });

  it('does not search when the query is empty (returns empty list)', async () => {
    const { result } = renderHook(() => useMarcasSearch(''), { wrapper });

    expect(result.current.data).toEqual([]);
    expect(marcasApi.search).not.toHaveBeenCalled();
  });
});
