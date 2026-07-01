'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LogOut, Menu, Plus, User } from 'lucide-react';

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
import { UserAvatar } from '@/shared/components/UserAvatar';
import { useAuth } from '@/shared/providers/AuthProvider';
import { useRequireAuth } from '@/shared/hooks/useRequireAuth';

const NAV_ITEMS = [
  { href: '/feed', label: 'Feed' },
  { href: '/alfajores', label: 'Alfajores' },
  { href: '/ranking', label: 'Ranking' },
  { href: '/marcas', label: 'Marcas' },
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
  const requireAuth = useRequireAuth();
  const reduceMotion = useReducedMotion();
  const menu = menuMotion(!!reduceMotion);

  return (
    <div className="bg-paper-raised relative flex items-center gap-3 border-b border-[rgba(74,30,8,0.22)] px-4 py-4 sm:gap-[18px] sm:px-6">
      <Link
        href="/feed"
        aria-label="AlphaGoat"
        className="flex items-center gap-[10px] border-r border-[rgba(74,30,8,0.14)] pr-[18px] transition-opacity hover:opacity-80"
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
          className="text-sienna hover:bg-paper-sunken hover:text-ink flex h-9 w-9 items-center justify-center rounded-lg transition-colors lg:hidden"
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
                          ? 'bg-paper-sunken text-ink'
                          : 'text-sienna hover:bg-paper-sunken hover:text-ink'
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
                  ? 'bg-paper-sunken text-ink'
                  : 'text-sienna hover:bg-paper-sunken hover:text-ink'
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
        onClick={() => requireAuth(() => setQuickOpen(true))}
        className="text-paper hidden h-10 items-center gap-[6px] rounded-[10px] bg-gradient-to-br from-[#a86432] to-[#3a1808] px-[14px] text-[13px] leading-none font-semibold tracking-[0.04em] whitespace-nowrap uppercase transition-[filter] hover:brightness-110 sm:inline-flex"
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
            className="border-sienna from-cinnamon to-curry text-sienna flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-[1.5px] bg-gradient-to-br text-[13px] font-bold transition-[filter] hover:brightness-110"
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
              asChild
              className="focus:bg-paper-sunken focus:text-ink cursor-pointer rounded-[8px] px-[10px] py-2 text-[14px] font-medium"
            >
              <Link href={`/u/${user?.username}`}>
                <User className="h-4 w-4" strokeWidth={2} />
                Mi perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={logout}
              className="focus:bg-paper-sunken focus:text-ink cursor-pointer rounded-[8px] px-[10px] py-2 text-[14px] font-medium"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link
          href="/login?next=/feed"
          className="text-paper inline-flex h-9 flex-shrink-0 items-center rounded-[10px] bg-gradient-to-br from-[#a86432] to-[#3a1808] px-[14px] text-[13px] font-semibold tracking-[0.04em] whitespace-nowrap uppercase transition-[filter] hover:brightness-110"
        >
          Entrar
        </Link>
      )}
    </div>
  );
}
