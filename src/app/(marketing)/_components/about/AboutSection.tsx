import { AnimatedTitle } from './AnimatedTitle';
import { ChampionCard } from './ChampionCard';
import { CtaSection } from './CtaSection';
import { RevealOnScroll } from './RevealOnScroll';

export function AboutSection() {
  return (
    <div className="w-full" style={{ background: '#3a1606' }}>
      <div className="mx-auto max-w-[1400px] px-5 sm:px-10 lg:px-14 py-28 sm:py-36 flex flex-col gap-28 sm:gap-36">

        <AnimatedTitle line1="SOBRE" line2="ALPHAGOAT." />

        <RevealOnScroll>
          <ChampionCard />
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <CtaSection />
        </RevealOnScroll>

      </div>
    </div>
  );
}
