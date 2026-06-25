import { apiClient } from '@/shared/lib/api-client';
import type { User } from '@/features/auth/types/auth.types';
import type { Profile } from '../types/profile.types';
import type { PasswordSchema } from '../schemas/editProfile.schema';

export const profileApi = {
  /**
   * GET /users/by-username/:username (público, auth opcional).
   * Devuelve el perfil enriquecido (counts + isFollowing; email solo si es el
   * propio perfil). 404 si el username no existe.
   */
  getByUsername: async (username: string): Promise<Profile> => {
    const res = await apiClient.get<Profile>(
      `/users/by-username/${encodeURIComponent(username)}`,
    );
    return res.data;
  },

  /** PATCH /users/me (auth) — edita el perfil propio (username). */
  updateMe: async (input: { username: string }): Promise<User> => {
    const res = await apiClient.patch<User>('/users/me', input);
    return res.data;
  },

  /** PATCH /users/me/password (auth) — cambia la contraseña. Resuelve en 204. */
  changePassword: async (input: PasswordSchema): Promise<void> => {
    await apiClient.patch('/users/me/password', input);
  },
};
