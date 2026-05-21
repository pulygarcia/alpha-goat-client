'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Search } from 'lucide-react';

import { useAuth } from '@/shared/providers/AuthProvider';

const NAV_ITEMS = [
  { href: '/feed', label: 'Feed' },
  { href: '/ranking', label: 'Ranking' },
  { href: '/comparar', label: 'Comparar' },
  { href: '/marcas', label: 'Marcas' },
  { href: '/mi-huella', label: 'Mi huella' },
] as const;

function initialsFromUsername(username: string): string {
  const clean = username.replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length === 0) return '?';
  if (clean.length === 1) return clean[0].toUpperCase();
  return (clean[0] + clean[clean.length - 1]).toUpperCase();
}

export function FeedTopbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const initials = user ? initialsFromUsername(user.username) : '?';

  return (
    <div className="relative flex items-center gap-[18px] border-b border-[rgba(74,30,8,0.22)] bg-paper-raised px-6 py-4">
      <div className="flex items-center gap-[10px] border-r border-[rgba(74,30,8,0.14)] pr-[18px]">
        <div
          className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-ink text-curry"
          style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 11,
            letterSpacing: '-0.04em',
          }}
        >
          α
        </div>
        <div
          className="text-ink"
          style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 19,
            letterSpacing: '-0.035em',
          }}
        >
          AlphaGoat<span className="text-curry-deep">.</span>
        </div>
      </div>

      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/feed'
              ? pathname === '/feed'
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative whitespace-nowrap rounded-lg px-[11px] py-2 text-[14.5px] font-medium transition-colors ${
                isActive
                  ? 'bg-paper-sunken text-ink after:absolute after:bottom-[-17px] after:left-[11px] after:right-[11px] after:h-[3px] after:rounded-t-[2px] after:bg-curry-deep after:content-[""]'
                  : 'text-sienna hover:bg-paper-sunken hover:text-ink'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <label
        className="flex h-10 w-[220px] items-center gap-2 rounded-[10px] border-[1.5px] border-[rgba(74,30,8,0.22)] bg-paper-sunken pl-3 pr-[10px] shadow-[inset_0_1px_2px_rgba(74,30,8,0.06)] transition-colors hover:border-cinnamon"
      >
        <Search className="h-4 w-4 text-cinnamon" strokeWidth={2} />
        <input
          type="text"
          placeholder="Buscar alfajor o marca"
          className="h-full flex-1 bg-transparent p-0 text-[14px] leading-none text-ink placeholder:text-[rgba(44,18,9,0.62)] focus:outline-none"
        />
      </label>

      <Link
        href="/resenar"
        className="inline-flex h-10 items-center gap-[6px] whitespace-nowrap rounded-[10px] bg-gradient-to-br from-[#a86432] to-[#3a1808] px-[14px] text-[13px] font-semibold uppercase tracking-[0.04em] leading-none text-paper transition-[filter] hover:brightness-110"
      >
        <Plus className="h-4 w-4" strokeWidth={2.4} />
        Reseñar
      </Link>

      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-sienna bg-gradient-to-br from-cinnamon to-curry text-[13px] font-bold text-sienna"
        title={user?.username ?? ''}
      >
        {initials}
      </div>
    </div>
  );
}
