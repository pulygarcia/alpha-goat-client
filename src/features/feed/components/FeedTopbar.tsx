'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Plus, Search } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
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
  const { user, logout } = useAuth();
  const initials = user ? initialsFromUsername(user.username) : '?';

  return (
    <div className="bg-paper-raised relative flex items-center gap-[18px] border-b border-[rgba(74,30,8,0.22)] px-6 py-4">
      <div className="flex items-center gap-[10px] border-r border-[rgba(74,30,8,0.14)] pr-[18px]">
        <div
          className="bg-ink text-curry flex h-[26px] w-[26px] items-center justify-center rounded-full"
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
              className={`relative rounded-lg px-[11px] py-2 text-[14.5px] font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-paper-sunken text-ink after:bg-curry-deep after:absolute after:right-[11px] after:bottom-[-17px] after:left-[11px] after:h-[3px] after:rounded-t-[2px] after:content-[""]'
                  : 'text-sienna hover:bg-paper-sunken hover:text-ink'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <label className="bg-paper-sunken hover:border-cinnamon flex h-10 w-[220px] items-center gap-2 rounded-[10px] border-[1.5px] border-[rgba(74,30,8,0.22)] pr-[10px] pl-3 shadow-[inset_0_1px_2px_rgba(74,30,8,0.06)] transition-colors">
        <Search className="text-cinnamon h-4 w-4" strokeWidth={2} />
        <input
          type="text"
          placeholder="Buscar alfajor o marca"
          className="text-ink h-full flex-1 bg-transparent p-0 text-[14px] leading-none placeholder:text-[rgba(44,18,9,0.62)] focus:outline-none"
        />
      </label>

      <Link
        href="/resenar"
        className="text-paper inline-flex h-10 items-center gap-[6px] rounded-[10px] bg-gradient-to-br from-[#a86432] to-[#3a1808] px-[14px] text-[13px] leading-none font-semibold tracking-[0.04em] whitespace-nowrap uppercase transition-[filter] hover:brightness-110"
      >
        <Plus className="h-4 w-4" strokeWidth={2.4} />
        Reseñar
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Menú de usuario"
          className="border-sienna from-cinnamon to-curry text-sienna flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] bg-gradient-to-br text-[13px] font-bold transition-[filter] hover:brightness-110"
        >
          {initials}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="bg-paper-raised text-ink min-w-[224px] rounded-[12px] border-[rgba(74,30,8,0.22)] p-1.5 shadow-[0_18px_40px_-18px_rgba(44,18,9,0.5)]"
        >
          <DropdownMenuLabel className="px-[10px] py-2">
            <span className="block text-[14px] leading-tight font-semibold">
              {user?.username}
            </span>
            <span className="mt-0.5 block text-[12.5px] font-normal text-[rgba(44,18,9,0.62)]">
              {user?.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[rgba(74,30,8,0.14)]" />
          <DropdownMenuItem
            onSelect={logout}
            className="focus:bg-paper-sunken focus:text-ink cursor-pointer rounded-[8px] px-[10px] py-2 text-[14px] font-medium"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
