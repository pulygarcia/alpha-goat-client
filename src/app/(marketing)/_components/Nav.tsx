'use client';

import Link from 'next/link';
import { useAuth } from '@/shared/providers/AuthProvider';
import { LogoMonogram } from './LogoMonogram';

const linkCls =
  'text-[11px] font-bold uppercase tracking-[0.16em] text-curry-soft transition-colors hover:text-curry';

export function Nav() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 py-6 sm:px-10 sm:py-8">
      <div className="flex items-center gap-8">
        <Link href="/ranking" className={linkCls}>
          Ranking
        </Link>
        <Link href="/comparador" className={`${linkCls} hidden sm:inline`}>
          Comparador
        </Link>
        <Link href="/metodo" className={`${linkCls} hidden lg:inline`}>
          Método
        </Link>
      </div>

      <Link href="/" aria-label="Inicio">
        <LogoMonogram />
      </Link>

      <div className="flex items-center justify-end gap-6">
        {isAuthenticated ? (
          <Link href="/feed" className="btn-curry">
            Mi feed
          </Link>
        ) : (
          <>
            <Link href="/login" className={`${linkCls} hidden sm:inline`}>
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn-curry">
              Calificar
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
