import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAlbum } from './useAlbum';
import { albumApi } from '../api/album.api';
import type { AlbumResponse } from '../types/album.types';

vi.mock('../api/album.api', () => ({
  albumApi: { byUsername: vi.fn() },
}));

const ALBUM: AlbumResponse = {
  owner: { id: 'u1', username: 'puly', avatarUrl: null },
  stats: { collected: 0, total: 0, pct: 0 },
  hojas: [],
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useAlbum', () => {
  beforeEach(() => vi.mocked(albumApi.byUsername).mockReset());

  it('fetches the album by username', async () => {
    vi.mocked(albumApi.byUsername).mockResolvedValue(ALBUM);

    const { result } = renderHook(() => useAlbum('puly'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(ALBUM);
    expect(albumApi.byUsername).toHaveBeenCalledWith('puly');
  });

  it('is disabled when no username is provided', () => {
    const { result } = renderHook(() => useAlbum(''), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(albumApi.byUsername).not.toHaveBeenCalled();
  });

  it('surfaces the error state when the request fails', async () => {
    vi.mocked(albumApi.byUsername).mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useAlbum('ghost'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
