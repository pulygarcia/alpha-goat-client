import 'server-only';

import { cookies } from 'next/headers';
import { env } from '@/config/env';
import type { User } from '../types/auth.types';

/**
 * Resuelve el usuario autenticado en el servidor leyendo la cookie HTTP-only de
 * la request entrante y consultando GET /auth/me. Se usa para hidratar el estado
 * de auth en el primer render (SSR) y evitar el parpadeo "invitado -> autenticado".
 *
 * Devuelve null si no hay cookie de sesión o si el backend responde no-OK.
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookie = (await cookies()).toString();
  if (!cookie) return null;

  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { cookie },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as User;
  } catch {
    return null;
  }
}
