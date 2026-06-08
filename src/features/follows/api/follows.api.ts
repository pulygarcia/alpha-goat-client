import { apiClient } from '@/shared/lib/api-client';

export const followsApi = {
  /** PUT /follows/:userId — seguir a un usuario. Resuelve con 204 No Content. */
  follow: async (userId: string): Promise<void> => {
    await apiClient.put(`/follows/${userId}`);
  },

  /** DELETE /follows/:userId — dejar de seguir a un usuario. Resuelve con 204 No Content. */
  unfollow: async (userId: string): Promise<void> => {
    await apiClient.delete(`/follows/${userId}`);
  },
};
