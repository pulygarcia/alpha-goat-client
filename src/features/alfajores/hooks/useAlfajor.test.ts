import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAlfajor } from './useAlfajor';
import { alfajoresApi } from '../api/alfajores.api';
import type { Alfajor } from '../types/alfajores.types';

vi.mock('../api/alfajores.api', () => ({
  alfajoresApi: { list: vi.fn(), byId: vi.fn() },
}));

const ALFAJOR: Alfajor = {
  id: 'a1',
  nombre: 'Jorgito',
  marcaId: 'm1',
  marca: { id: 'm1', nombre: 'Jorgito', provincia: 'Córdoba', logoUrl: null },
  tipo: 'CHOCOLATE',
  descripcion: 'Clásico',
  imagenUrl: null,
  status: 'APPROVED',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useAlfajor', () => {
  beforeEach(() => vi.mocked(alfajoresApi.byId).mockReset());

  it('fetches the alfajor by id', async () => {
    vi.mocked(alfajoresApi.byId).mockResolvedValue(ALFAJOR);

    const { result } = renderHook(() => useAlfajor('a1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(ALFAJOR);
    expect(alfajoresApi.byId).toHaveBeenCalledWith('a1');
  });

  it('does not fetch when the id is empty', async () => {
    const { result } = renderHook(() => useAlfajor(''), { wrapper });

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));
    expect(alfajoresApi.byId).not.toHaveBeenCalled();
  });

  it('surfaces the error state when the request fails', async () => {
    vi.mocked(alfajoresApi.byId).mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useAlfajor('a1'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
