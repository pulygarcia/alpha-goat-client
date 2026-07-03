'use client';

import { notFound } from 'next/navigation';
import { useAuth } from '@/shared/providers/AuthProvider';

/**
 * Gate client-side del panel admin. Mientras la sesión se resuelve muestra un
 * skeleton; si el visitante no es ADMIN dispara el 404 de Next para no revelar
 * que la ruta existe. Es solo UX: el back igual rechaza con 401/403.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="mx-auto max-w-4xl px-4 py-10"
        data-testid="admin-guard-skeleton"
      >
        <div className="bg-paper-sunken h-8 w-56 animate-pulse rounded-lg" />
        <div className="mt-6 space-y-4">
          <div className="bg-paper-sunken h-28 animate-pulse rounded-[14px]" />
          <div className="bg-paper-sunken h-28 animate-pulse rounded-[14px]" />
        </div>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') notFound();

  return <>{children}</>;
}
