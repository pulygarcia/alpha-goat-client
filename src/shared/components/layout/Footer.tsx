import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

type FooterLink = { href: string; label: string; external?: boolean };

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
    links: [
      { href: '/comparar', label: 'Comparar' },
      { href: '/marcas', label: 'Marcas' },
      { href: '/mi-huella', label: 'Mi huella' },
    ],
  },
  {
    title: 'El proyecto',
    links: [
      { href: '/metodo', label: 'Método' },
      { href: '/', label: 'Sobre el índice' },
    ],
  },
];

const PORTFOLIO_URL = 'https://pp-v5.vercel.app';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[rgba(74,30,8,0.22)] bg-[#fffdf6] text-ink">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:gap-8">
        {/* Marca */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-[10px]">
            <span
              className="bg-ink text-curry flex h-[26px] w-[26px] items-center justify-center rounded-full"
              style={{
                fontFamily: 'var(--font-archivo)',
                fontSize: 11,
                letterSpacing: '-0.04em',
              }}
            >
              α
            </span>
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
          </div>
          <p className="max-w-[240px] text-[14px] leading-relaxed text-[rgba(44,18,9,0.66)]">
            El índice nacional del alfajor. Reseñá cualquier alfajor argentino en
            5 ejes.
          </p>
        </div>

        {/* Columnas de links */}
        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-4">
            <h3 className="text-[11px] font-bold tracking-[0.14em] text-[rgba(44,18,9,0.5)] uppercase">
              {col.title}
            </h3>
            <ul className="flex flex-col gap-[10px]">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sienna hover:text-ink text-[14.5px] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Barra inferior */}
      <div className="border-t border-[rgba(74,30,8,0.14)]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-6 py-6 text-[13px] sm:flex-row sm:px-8">
          <span className="text-[rgba(44,18,9,0.6)]">
            © {year} AlphaGoat
          </span>
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-curry-deep hover:text-cinnamon inline-flex items-center gap-1 font-semibold transition-colors"
          >
            Made by pulyG
            <ArrowUpRight className="h-[15px] w-[15px]" strokeWidth={2.2} />
          </a>
        </div>
      </div>
    </footer>
  );
}
