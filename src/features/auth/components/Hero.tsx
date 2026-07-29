import ParticleWords from './ParticleWords';

export default function Hero() {
  return (
    <aside
      className="relative hidden overflow-hidden rounded-3xl lg:flex lg:w-[52%] lg:shrink-0 lg:flex-col"
      style={{
        background: '#1a0c05',
        boxShadow: '0 30px 80px -30px rgba(0,0,0,0.7)',
      }}
    >
      <ParticleWords />

      {/* Made by */}
      <a
        href="https://pp-v5.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-curry-soft absolute bottom-6 left-8 z-10 w-fit font-mono text-[0.65rem] tracking-[0.2em] uppercase transition-all duration-200"
        style={{
          color:
            'color-mix(in oklab, var(--color-curry-soft) 60%, transparent)',
          textShadow: '0 0 12px rgba(200,122,32,0.4)',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          textDecorationColor:
            'color-mix(in oklab, var(--color-ambar) 30%, transparent)',
        }}
      >
        made by Ignacio (Puly) G.
      </a>
    </aside>
  );
}
