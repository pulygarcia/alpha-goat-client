import Link from 'next/link';

/** Header mínimo del catálogo público (sin el shell auth-only del feed). */
export function CatalogHeader() {
  return (
    <header className="bg-paper-raised flex items-center justify-between border-b border-[rgba(74,30,8,0.22)] px-5 py-4 md:px-8">
      <Link href="/" className="flex items-center gap-[10px]">
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
      </Link>

      <Link
        href="/login"
        className="text-sienna hover:bg-paper-sunken hover:text-ink rounded-[10px] px-3 py-2 text-[14px] font-medium transition-colors"
      >
        Entrar
      </Link>
    </header>
  );
}
