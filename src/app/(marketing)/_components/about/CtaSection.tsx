import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const ghostStyle = `
  .btn-ghost {
    display: inline-flex;
    align-items: center;
    border-radius: 9999px;
    padding: 16px 32px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 700;
    border: 1.5px solid rgba(244,160,43,0.35);
    color: #f4a02b;
    transition: background 0.2s, color 0.2s;
  }
  .btn-ghost:hover {
    background: #f4a02b;
    color: #5a2208;
  }
`;

export function CtaSection() {
  return (
    <section className="flex flex-col items-center text-center gap-8">
      <style>{ghostStyle}</style>
      <div>
        <p
          style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(32px, 5vw, 68px)',
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            color: '#f5ead6',
          }}
        >
          DEJÁ DE DISCUTIR.
        </p>
        <p
          style={{
            fontFamily: 'var(--font-archivo)',
            fontSize: 'clamp(32px, 5vw, 68px)',
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            color: '#f4a02b',
          }}
        >
          EMPEZÁ A PUNTUAR.
        </p>
      </div>

      <p className="max-w-md text-sm leading-relaxed" style={{ color: 'rgba(255,240,200,0.85)' }}>
        Te lleva 30 segundos. Cinco sliders, una reseña, listo. Tu opinión cambia el ranking.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
        <Link href="/register" className="btn-curry-lg gap-2">
          Calificá tu primer alfajor
          <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
        <Link href="/ranking" className="btn-ghost">
          Ver ranking completo
        </Link>
      </div>

      <p
        className="mt-6"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,240,200,0.5)' }}
      >
        Hecho en Argentina, sin azúcar agregada al algoritmo
      </p>
    </section>
  );
}
