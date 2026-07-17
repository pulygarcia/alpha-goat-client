import { describe, it, expect, vi, beforeEach } from 'vitest';
import { albumApi } from './album.api';
import { apiClient } from '@/shared/lib/api-client';
import type { AlbumResponse } from '../types/album.types';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { get: vi.fn() },
}));

const ALBUM: AlbumResponse = {
  owner: { id: 'u1', username: 'puly', avatarUrl: null },
  stats: { collected: 1, total: 2, pct: 50 },
  hojas: [
    {
      marca: { id: 'm1', nombre: 'Havanna', provincia: 'Buenos Aires' },
      stats: { collected: 1, total: 2, pct: 50 },
      alfajores: [
        {
          id: 'a1',
          nombre: '70% Cacao',
          tipo: 'Chocolate negro',
          imagenUrl: null,
          avgRating: 4.6,
          collected: true,
          myRating: 8.5,
          reviewId: 'r1',
        },
        {
          id: 'a2',
          nombre: 'Blanco DDL',
          tipo: 'Chocolate blanco',
          imagenUrl: null,
          avgRating: 4.1,
          collected: false,
          myRating: null,
          reviewId: null,
        },
      ],
    },
  ],
};

describe('albumApi.byUsername', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it('fetches the album by encoded username', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: ALBUM } as never);

    const result = await albumApi.byUsername('puly gil');

    expect(apiClient.get).toHaveBeenCalledWith(
      '/users/by-username/puly%20gil/album',
    );
    expect(result).toEqual(ALBUM);
  });
});
