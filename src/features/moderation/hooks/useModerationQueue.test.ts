import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useModerationQueue } from './useModerationQueue';
import { moderationApi } from '../api/moderation.api';
import type { PaginatedAlfajores } from '@/features/alfajores/types/alfajores.types';

vi.mock('../api/moderation.api', () => ({
  moderationApi: { getPending: vi.fn(), approve: vi.fn(), reject: vi.fn() },
}));

const PAGE: PaginatedAlfajores = {
  items: [
    {
      id: 'a1',
      nombre: 'Capitán del Espacio',
      marcaId: 'm1',
      marca: {
        id: 'm1',
        nombre: 'CDE',
        provincia: 'Buenos Aires',
        logoUrl: null,
      },
      tipo: 'CHOCOLATE',
      descripcion: null,
      imagenUrl: null,
      status: 'PENDING',
      rejectionReason: null,
      createdById: 'u1',
      createdAt: '2026-07-01T00:00:00.000Z',
    },
  ],
  total: 1,
  page: 1,
  limit: 12,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useModerationQueue', () => {
  beforeEach(() => vi.mocked(moderationApi.getPending).mockReset());

  it('fetches the requested page of the pending queue', async () => {
    vi.mocked(moderationApi.getPending).mockResolvedValue(PAGE);

    const { result } = renderHook(() => useModerationQueue(1), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(PAGE);
    expect(moderationApi.getPending).toHaveBeenCalledWith({
      page: 1,
      limit: 12,
    });
  });

  it('keeps the previous page as placeholder while the next one loads', async () => {
    vi.mocked(moderationApi.getPending).mockResolvedValue(PAGE);

    const { result, rerender } = renderHook(
      ({ page }: { page: number }) => useModerationQueue(page),
      { wrapper, initialProps: { page: 1 } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    let resolveNext: (value: PaginatedAlfajores) => void = () => {};
    vi.mocked(moderationApi.getPending).mockReturnValue(
      new Promise<PaginatedAlfajores>((resolve) => {
        resolveNext = resolve;
      }) as never,
    );
    rerender({ page: 2 });

    expect(result.current.data).toEqual(PAGE);
    expect(result.current.isPlaceholderData).toBe(true);

    resolveNext({ ...PAGE, page: 2 });
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false));
  });

  it('surfaces the error state when the request fails', async () => {
    vi.mocked(moderationApi.getPending).mockRejectedValueOnce(
      new Error('boom'),
    );

    const { result } = renderHook(() => useModerationQueue(1), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
