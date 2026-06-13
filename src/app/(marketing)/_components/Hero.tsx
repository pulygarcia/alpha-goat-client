import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Nav } from './Nav';
import { AlfajorReviews } from './AlfajorReviews';
import { AlfajorFloat } from './AlfajorFloat';
import { WebGLLiquid } from '@/shared/components/ui/webgl-liquid';

export function Hero() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden">
      <WebGLLiquid
        title=""
        subtitle=""
        description=""
        colorDeep="#3a1606"
        colorMid="#6e2f11"
        colorHighlight="#a85820"
        speed={0.85}
        flowStrength={1.1}
        grain={0.04}
        contrast={1.15}
        opacity={0.9}
        revealDuration={1.4}
        className="absolute inset-0 min-h-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black/45"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(244,160,43,0.08), transparent 70%)',
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

      <AlfajorFloat />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Nav />

        <div className="flex flex-1 flex-col items-center px-6 pt-6 pb-12 text-center sm:pt-10">
          <p className="eyebrow fade-up text-curry">
            El índice nacional del alfajor
          </p>

          <h1
            className="h-mega fade-up mt-6"
            style={{ animationDelay: '120ms' }}
          >
            EL ALFAJOR
            <span className="h-sub mt-2 block">NO SE DISCUTE.</span>
          </h1>

          <p
            className="coda fade-up text-curry mt-8 flex items-center gap-3"
            style={{ animationDelay: '300ms' }}
          >
            <span className="pulse-dot bg-curry inline-block h-1.5 w-1.5 rounded-full" />
            Ahora se puntúa, ningún chamuyo
          </p>

          <div className="fade-up w-full" style={{ animationDelay: '460ms' }}>
            <AlfajorReviews />
          </div>

          <Link
            href="/register"
            className="btn-curry-lg fade-up mt-10 gap-2"
            style={{ animationDelay: '620ms' }}
          >
            Dejá tus reseñas
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
