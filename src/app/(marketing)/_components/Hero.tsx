import Link from 'next/link';
import { Search, BarChart3, ArrowRight } from 'lucide-react';
import { Nav } from './Nav';
import { AlfajorHero } from './AlfajorHero';
import { ScorePill } from './ScorePill';
import { BotanicalBg } from './BotanicalBg';

export function Hero() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden">
      <BotanicalBg />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(255,180,80,0.08), transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-72"
        style={{
          background:
            'radial-gradient(ellipse at bottom, rgba(0,0,0,0.30), transparent 70%)',
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Nav />

        <div className="flex flex-1 flex-col items-center px-6 pb-12 pt-6 text-center sm:pt-10">
          <p className="eyebrow text-curry-soft">
            El índice nacional del alfajor
          </p>

          <h1 className="h-mega mt-6">
            EL ALFAJOR
            <span className="h-sub mt-2 block">NO SE DISCUTE.</span>
          </h1>

          <p className="coda mt-8 flex items-center gap-3 text-curry-soft">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-curry" />
            Ahora se puntúa · 5 ejes · ningún chamuyo
          </p>

          <div className="relative mt-12 flex items-center justify-center">
            <AlfajorHero />
            <div className="absolute right-[-12px] top-[-8px] sm:right-[-32px] sm:top-[-16px]">
              <ScorePill />
            </div>
            <p
              className="absolute -bottom-2 left-1/2 hidden -translate-x-1/2 text-[0.7rem] uppercase tracking-[0.24em] text-curry-soft sm:block"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Reseñado 1.247 veces
            </p>
          </div>

          <div className="mt-20 flex w-full max-w-3xl flex-col items-center justify-between gap-8 sm:flex-row sm:items-end sm:text-left">
            <p className="max-w-sm text-[0.85rem] uppercase leading-relaxed tracking-[0.14em] text-curry-soft">
              Reseñá cualquier alfajor en 5 ejes — dulzor, DDL, baño, ratio y
              textura. Te devolvemos un radar y un puesto en el ranking.
            </p>

            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="btn-curry-lg gap-2"
                aria-label="Empezar a calificar"
              >
                Empezar a calificar
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
              <button
                type="button"
                className="icon-btn"
                aria-label="Buscar alfajor"
              >
                <Search size={18} strokeWidth={2.25} />
              </button>
              <Link
                href="/ranking"
                className="icon-btn"
                aria-label="Ver ranking"
              >
                <BarChart3 size={18} strokeWidth={2.25} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
