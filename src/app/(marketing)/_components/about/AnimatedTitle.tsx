'use client';

import { useEffect, useRef } from 'react';

interface AnimatedTitleProps {
  line1: string;
  line2: string;
}

export function AnimatedTitle({ line1, line2 }: AnimatedTitleProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = 'true';
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .anim-title-word {
          display: inline-block;
          overflow: hidden;
          vertical-align: bottom;
        }
        .anim-title-inner {
          display: inline-block;
          transform: translateY(110%);
          transition: transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
        }
        [data-visible="true"] .anim-title-inner {
          transform: translateY(0);
        }
        [data-visible="true"] .anim-title-inner:nth-child(1) { transition-delay: 0ms; }
        [data-visible="true"] .anim-title-inner:nth-child(2) { transition-delay: 80ms; }
        [data-visible="true"] .anim-title-inner:nth-child(3) { transition-delay: 160ms; }
        [data-visible="true"] .anim-title-inner:nth-child(4) { transition-delay: 240ms; }
        [data-visible="true"] .anim-title-inner:nth-child(5) { transition-delay: 320ms; }
        [data-visible="true"] .anim-title-inner:nth-child(6) { transition-delay: 400ms; }
      `}</style>
      <div ref={ref} className="h-sub text-center" style={{ lineHeight: '0.92', letterSpacing: '-0.035em' }}>
        <div className="mb-1">
          {line1.split(' ').map((word, i) => (
            <span key={i} className="anim-title-word mr-[0.25em]">
              <span className="anim-title-inner" style={{ transitionDelay: `${i * 80}ms` }}>
                {word}
              </span>
            </span>
          ))}
        </div>
        <div>
          {line2.split(' ').map((word, i) => (
            <span key={i} className="anim-title-word mr-[0.25em]">
              <span
                className="anim-title-inner text-curry"
                style={{ transitionDelay: `${(line1.split(' ').length + i) * 80}ms` }}
              >
                {word}
              </span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
