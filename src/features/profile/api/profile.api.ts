import { apiClient } from '@/shared/lib/api-client';
import type { User } from '@/features/auth/types/auth.types';
import type { Profile } from '../types/profile.types';
import type { PasswordSchema } from '../schemas/editProfile.schema';

/**
 * MOCK TEMPORAL — "Aportes a la comunidad".
 * El back todavía no expone estos 4 campos (ver To do "Back: aportes a la
 * comunidad en el perfil"). Hasta entonces los rellenamos en el front con
 * valores deterministas por username (estables entre recargas) y solo cuando
 * el campo no vino. Cuando el endpoint los mande, este relleno se saltea solo.
 * BORRAR este bloque al integrar el back real.
 */
function seedFrom(username: string): number {
  let h = 0;
  for (const ch of username) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function withMockedContributions(profile: Profile): Profile {
  const s = seedFrom(profile.username);
  return {
    ...profile,
    commentsCount: profile.commentsCount ?? s % 80,
    alfajoresAddedCount: profile.alfajoresAddedCount ?? s % 12,
    likesReceivedCount: profile.likesReceivedCount ?? s % 220,
    avgScore:
      profile.avgScore ??
      (profile.reviewsCount > 0
        ? Math.round((6 + (s % 35) / 10) * 10) / 10
        : null),
  };
}

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
    return withMockedContributions(res.data);
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
