'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';

/**
 * Gate de acciones para el modelo "ver público / actuar autenticado".
 * Devuelve una función que corre `action` si hay sesión; si no, redirige al
 * login conservando la ruta actual en `?next=` para volver tras loguearse.
 * Lo usan los botones de like, seguir, comentar, etc.
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    (action: () => void): void => {
      if (isAuthenticated) {
        action();
        return;
      }
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
      router.push(`/login${next}`);
    },
    [isAuthenticated, pathname, router],
  );
}
