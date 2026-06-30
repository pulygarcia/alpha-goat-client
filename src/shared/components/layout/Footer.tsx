'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Globe } from 'lucide-react';

type FooterLink = { href: string; label: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Explorar',
    links: [
      { href: '/feed', label: 'Feed' },
      { href: '/alfajores', label: 'Alfajores' },
      { href: '/ranking', label: 'Ranking' },
    ],
  },
  {
    title: 'Herramientas',
    links: [{ href: '/marcas', label: 'Marcas' }],
  },
];

const PORTFOLIO_URL = 'https://pp-v5.vercel.app';
const LINKEDIN_URL = 'https://www.linkedin.com/in/jose-ignacio-robledo/';

const EMAIL_RE = /.+@.+\..+/;

export function Footer() {
  const year = new Date().getFullYear();
  const reduce = useReducedMotion();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = EMAIL_RE.test(email);
    setStatus(
      ok
        ? { ok: true, message: '¡Listo! Te sumaste al alfajorímetro 🎉' }
        : { ok: false, message: 'Ingresá un email válido.' },
    );
    // TODO: conectar al endpoint real de suscripción (módulo notifications en backlog).
  }

  return (
    <footer
      className="relative w-full overflow-hidden text-[#f0ddd0]"
      style={{
        background:
          'radial-gradient(135% 125% at 14% 6%, #cd9069 0%, #9a5532 26%, #5c2f1a 52%, #2c1509 78%, #1b0d06 100%)',
      }}
    >
      {/* viñeta inferior para dar profundidad */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{
          background:
            'radial-gradient(80% 60% at 50% 120%, rgba(0,0,0,0.45), transparent 70%)',
        }}
      />

      {/* Hero: alfajor a la izquierda + wordmark semitransparente solapado */}
      <div className="relative mx-auto h-[190px] max-w-[1280px] px-6 sm:h-[300px] sm:px-12">
        {/* Alfajor (PNG del hero) con glow dorado detrás */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-0 h-[84px] w-[84px] -translate-y-1/2 sm:left-6 sm:h-[200px] sm:w-[200px]"
        >
          <div
            className="absolute inset-[-18%] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(244,160,43,0.28) 0%, rgba(184,96,21,0.12) 45%, transparent 70%)',
            }}
          />
          <Image
            src="/alfajor-hero.png"
            alt=""
            width={400}
            height={400}
            className="relative h-full w-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
          />
        </div>

        {/* Wordmark superpuesto, un poco transparente → el alfajor asoma */}
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-[58px] -translate-y-1/2 font-[family-name:var(--font-archivo)] text-[clamp(2.25rem,12vw,210px)] leading-none font-bold tracking-[-0.04em] whitespace-nowrap opacity-100 sm:left-[150px]"
          style={{
            background:
              'linear-gradient(95deg, #f6d2b5 0%, #e0aa82 30%, #b06a44 62%, #8a4f30 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          alphagoat
        </span>
      </div>

      {/* Body */}
      <div className="relative mx-auto max-w-[1280px] px-6 pt-4 sm:px-12">
        <div className="flex flex-wrap items-start justify-between gap-x-16 gap-y-12">
          {/* Newsletter */}
          <div className="max-w-[420px] flex-1 basis-[340px]">
            <h3 className="font-[family-name:var(--font-archivo)] text-[24px] tracking-[-0.01em] text-[#fbe9dc]">
              Seguí el ranking de cerca
            </h3>
            <p className="mt-3 max-w-[330px] text-[15px] leading-[1.55] text-[rgba(240,221,208,0.62)]">
              Enterate cuando se sumen alfajores nuevos para puntuar y cuando se
              actualice el TOP 3 del ranking. Directo a tu inbox, sin spam.
            </p>
            <form
              aria-label="Newsletter"
              onSubmit={onSubmit}
              className="mt-6 flex w-full max-w-[330px] items-center gap-2 rounded-[13px] border border-[rgba(244,221,208,0.16)] bg-white/[0.04] py-[7px] pr-[7px] pl-[18px]"
            >
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus(null);
                }}
                type="email"
                aria-label="Email"
                placeholder="Ingresá tu email"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[#f6e7da] outline-none placeholder:text-[rgba(240,221,208,0.45)]"
              />
              <motion.button
                type="submit"
                aria-label="Suscribirse"
                whileHover={reduce ? undefined : { scale: 1.06 }}
                whileTap={reduce ? undefined : { scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                className="flex h-[42px] w-[42px] flex-none cursor-pointer items-center justify-center rounded-[9px] text-[18px] font-bold text-[#3a1c0d] transition-[filter] hover:brightness-105"
                style={{
                  background: 'linear-gradient(150deg, #f0bd95, #d2895f)',
                }}
              >
                »
              </motion.button>
            </form>
            <div
              role="status"
              className="mt-[10px] h-[18px] text-[13px] text-[rgba(240,221,208,0.6)]"
            >
              <AnimatePresence mode="wait">
                {status && (
                  <motion.span
                    key={status.message}
                    initial={reduce ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: 6 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className={status.ok ? 'text-[#f6d2b5]' : 'text-[#f0a98a]'}
                  >
                    {status.message}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Columnas de links */}
          <div className="flex flex-wrap gap-x-14 gap-y-10">
            {COLUMNS.map((col) => (
              <nav key={col.title} className="min-w-[128px]">
                <div className="mb-[18px] font-[family-name:var(--font-archivo)] text-[15px] text-[#fbe9dc]">
                  {col.title}
                </div>
                <ul className="flex flex-col gap-[13px]">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[14px] text-[rgba(240,221,208,0.66)] transition-colors hover:text-[#fbe9dc]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Divider + bottom bar */}
        <div className="mt-10 h-px bg-[linear-gradient(90deg,rgba(244,221,208,0.18),rgba(244,221,208,0.04))]" />
        <div className="flex flex-wrap items-center justify-between gap-[18px] py-6 pb-8">
          <span className="text-[13.5px] text-[rgba(240,221,208,0.55)]">
            © {year} alphagoat
          </span>
          <div className="flex items-center gap-4">
            <span className="text-[13.5px] font-semibold text-[rgba(240,221,208,0.8)]">
              Made by pulyG
            </span>
            <div className="flex items-center gap-[10px]">
              <a
                href={PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Portfolio"
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[rgba(244,221,208,0.12)] bg-white/[0.06] text-[#f0ddd0] transition-[background,color,transform] hover:-translate-y-0.5 hover:text-[#3a1c0d] hover:[background:linear-gradient(150deg,#f0bd95,#d2895f)]"
              >
                <Globe size={17} strokeWidth={2} />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[rgba(244,221,208,0.12)] bg-white/[0.06] text-[#f0ddd0] transition-[background,color,transform] hover:-translate-y-0.5 hover:text-[#3a1c0d] hover:[background:linear-gradient(150deg,#f0bd95,#d2895f)]"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
