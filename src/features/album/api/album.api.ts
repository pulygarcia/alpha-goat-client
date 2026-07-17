import { apiClient } from '@/shared/lib/api-client';
import type { AlbumResponse } from '../types/album.types';

export const albumApi = {
  /**
   * GET /users/by-username/:username/album (público, sin auth). 404 si el
   * username no existe. Solo lectura: reseñar es el único modo de "conseguir"
   * una figurita, no hay acción de escritura en el álbum.
   */
  byUsername: async (username: string): Promise<AlbumResponse> => {
    const res = await apiClient.get<AlbumResponse>(
      `/users/by-username/${encodeURIComponent(username)}/album`,
    );
    return res.data;
  },
};
