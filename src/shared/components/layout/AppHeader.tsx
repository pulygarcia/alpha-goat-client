'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Sticker,
  User,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import { QuickReviewModal } from '@/features/reviews/components/QuickReviewModal';
import { UserSearchModal } from '@/features/users/components/UserSearchModal';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { useAuth } from '@/shared/providers/AuthProvider';
import { useRequireAuth } from '@/shared/hooks/useRequireAuth';

const NAV_ITEMS = [
  { href: '/feed', label: 'Feed' },
  { href: '/alfajores', label: 'Alfajores' },
  { href: '/ranking', label: 'Ranking' },
  { href: '/stats', label: 'Números' },
] as const;

/**
 * Variantes del stagger de entrada del nav del drawer (mobile). Con
 * `prefers-reduced-motion` los items aparecen sin desplazamiento ni delay.
 */
export function menuMotion(reduce: boolean) {
  return {
    container: {
      hidden: {},
      show: {
        transition: {
          staggerChildren: reduce ? 0 : 0.05,
          delayChildren: reduce ? 0 : 0.06,
        },
      },
    },
    item: {
      hidden: reduce ? { opacity: 1 } : { opacity: 0, x: -10 },
      show: {
        opacity: 1,
        x: 0,
        transition: {
          duration: reduce ? 0 : 0.25,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      },
    },
  };
}

export function AppHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [quickOpen, setQuickOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const requireAuth = useRequireAuth();
  const reduceMotion = useReducedMotion();
  const menu = menuMotion(!!reduceMotion);

  return (
    <div className="bg-blanco border-gris-50 sticky top-0 z-40 flex items-center gap-3 border-b px-4 py-4 sm:gap-[18px] sm:px-6">
      <Link
        href="/feed"
        aria-label="AlphaGoat"
        className="border-gris-50 flex items-center gap-[10px] border-r pr-[18px] transition-opacity hover:opacity-80"
      >
        <Image
          src="/alphagoat-logo.png"
          alt=""
          width={26}
          height={26}
          priority
          className="h-[26px] w-[26px] rounded-full object-cover"
        />
        <span
          className="text-ink"
          style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 19,
            letterSpacing: '-0.035em',
          }}
        >
          AlphaGoat<span className="text-curry-deep">.</span>
        </span>
      </Link>

      {/* Hamburguesa: nav colapsada en tablet/mobile (<lg) como drawer. */}
      <Sheet>
        <SheetTrigger
          aria-label="Abrir menú de navegación"
          className="text-gris-400 hover:bg-gris-25 hover:text-ink flex h-9 w-9 items-center justify-center rounded-lg transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px]">
          <SheetHeader>
            <SheetTitle>Navegación</SheetTitle>
          </SheetHeader>
          <motion.nav
            className="mt-2 flex flex-col gap-1"
            initial="hidden"
            animate="show"
            variants={menu.container}
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/feed'
                  ? pathname === '/feed'
                  : pathname?.startsWith(item.href);
              return (
                <motion.div key={item.href} variants={menu.item}>
                  <SheetClose asChild>
                    <Link
                      href={item.href}
                      className={`block rounded-[8px] px-3 py-[10px] text-[15px] font-medium transition-colors ${
                        isActive
                          ? 'bg-gris-25 text-ink'
                          : 'text-gris-400 hover:bg-gris-25 hover:text-ink'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                </motion.div>
              );
            })}
          </motion.nav>
        </SheetContent>
      </Sheet>

      <nav className="hidden items-center gap-1 lg:flex">
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
                  ? 'bg-gris-25 text-ink'
                  : 'text-gris-400 hover:bg-gris-25 hover:text-ink'
              }`}
            >
              {item.label}
              {isActive && (
                <motion.span
                  layoutId="appheader-underline"
                  className="bg-curry-deep absolute right-[11px] bottom-[-17px] left-[11px] h-[3px] rounded-t-[2px]"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 480, damping: 38 }
                  }
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <button
        type="button"
        aria-label="Buscar usuario"
        onClick={() => requireAuth(() => setSearchOpen(true))}
        className="text-gris-400 hover:bg-gris-25 hover:text-ink flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>

      <UserSearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      <button
        type="button"
        onClick={() => requireAuth(() => setQuickOpen(true))}
        className="btn-solid hidden h-10 items-center gap-[6px] rounded-[10px] px-[14px] text-[13px] leading-none font-semibold tracking-[0.04em] whitespace-nowrap uppercase sm:inline-flex"
      >
        <Plus className="h-4 w-4" strokeWidth={2.4} />
        Reseñar
      </button>

      <QuickReviewModal open={quickOpen} onOpenChange={setQuickOpen} />

      {isAuthenticated ? (
        // `modal={false}`: este dropdown no tiene overlay de pantalla completa,
        // así que el scroll-lock por defecto de Radix (padding-right en el
        // body para compensar la scrollbar) queda al descubierto como una
        // franja del bg del body. Sin overlay que la tape, no lo necesitamos.
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            aria-label="Menú de usuario"
            className="border-gris-100 from-gris-25 to-gris-100 text-gris-400 flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-[1.5px] bg-gradient-to-br text-[13px] font-bold transition-[filter] hover:brightness-110"
          >
            <UserAvatar
              avatarUrl={user?.avatarUrl ?? null}
              username={user?.username ?? ''}
              className="h-full w-full object-cover"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={10}
            className="bg-blanco text-ink border-gris-50 shadow-menu min-w-[224px] rounded-[12px] p-1.5"
          >
            <DropdownMenuLabel className="px-[10px] py-2">
              <span className="block text-[14px] leading-tight font-semibold">
                {user?.username}
              </span>
              <span className="text-gris-400 mt-0.5 block text-[12.5px] font-normal">
                {user?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gris-50" />
            <DropdownMenuItem
              asChild
              className="focus:bg-gris-25 focus:text-ink cursor-pointer rounded-[8px] px-[10px] py-2 text-[14px] font-medium"
            >
              <Link href={`/u/${user?.username}`}>
                <User className="h-4 w-4" strokeWidth={2} />
                Mi perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="focus:bg-gris-25 focus:text-ink cursor-pointer rounded-[8px] px-[10px] py-2 text-[14px] font-medium"
            >
              <Link href={`/u/${user?.username}/album`}>
                <Sticker className="h-4 w-4" strokeWidth={2} />
                Álbum
              </Link>
            </DropdownMenuItem>
            {user?.role === 'ADMIN' && (
              <DropdownMenuItem
                asChild
                className="focus:bg-gris-25 focus:text-ink cursor-pointer rounded-[8px] px-[10px] py-2 text-[14px] font-medium"
              >
                <Link href="/admin">
                  <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                  Moderación
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onSelect={logout}
              className="focus:bg-gris-25 focus:text-ink cursor-pointer rounded-[8px] px-[10px] py-2 text-[14px] font-medium"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link
          href="/login?next=/feed"
          className="btn-solid inline-flex h-9 flex-shrink-0 items-center rounded-[10px] px-[14px] text-[13px] font-semibold tracking-[0.04em] whitespace-nowrap uppercase"
        >
          Entrar
        </Link>
      )}
    </div>
  );
}
