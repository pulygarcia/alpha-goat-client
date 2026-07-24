'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export function StatCounter({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!isInView || reduceMotion) return;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value, reduceMotion]);

  return (
    <div ref={ref} className="text-center">
      <div
        className="text-curry-deep text-[22px] leading-none font-bold sm:text-[30px] md:text-[36px]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {display.toLocaleString('es-AR')}
      </div>
      <div className="text-cinnamon mt-1.5 flex items-center justify-center gap-1 sm:mt-2">
        <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2} />
        <span
          className="text-sienna text-[0.5rem] whitespace-nowrap sm:text-[0.62rem]"
          style={{
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
