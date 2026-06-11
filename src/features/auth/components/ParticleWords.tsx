'use client';

import { CursorDrivenParticleTypography } from '@/shared/components/ui/cursor-driven-particle-typography';

const words = ['Probá.', 'Opiná.', 'Puntuá.'];

export default function ParticleWords() {
  return (
    <div className="absolute inset-0 flex flex-col">
      {words.map((word) => (
        <CursorDrivenParticleTypography
          key={word}
          text={word}
          fontSize={400}
          fontFamily="'Archivo Black', sans-serif"
          color="#c87a20"
          particleSize={1.8}
          particleDensity={4}
          dispersionStrength={22}
          returnSpeed={0.05}
          className="min-h-0 flex-1"
        />
      ))}
    </div>
  );
}
