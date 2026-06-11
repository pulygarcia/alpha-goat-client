'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface Testimonial {
  name: string;
  text: string;
  avatar: string;
  role?: string;
  username?: string;
  profileLink?: string;
}

export interface TestimonialMarqueeProps {
  items: Testimonial[];
  variant?: 'default' | 'stacked' | 'dual' | 'flush' | 'flush-dual';
  className?: string;
  speed?: number;
  containerClassName?: string;
}

const MarqueeStyles = React.memo(() => (
  <style>
    {`
        @keyframes marquee-left {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-100%, 0, 0); }
        }
        @keyframes marquee-right {
          from { transform: translate3d(-100%, 0, 0); }
          to { transform: translate3d(0, 0, 0); }
        }
        .animate-marquee-left {
           animation: marquee-left var(--duration) linear infinite;
        }
        .animate-marquee-right {
           animation: marquee-right var(--duration) linear infinite;
        }
        .group:hover .marquee-pause-on-hover {
           animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-left, .animate-marquee-right { animation: none; }
        }
        `}
  </style>
));
MarqueeStyles.displayName = 'MarqueeStyles';

const MarqueeRow = React.memo(
  ({
    children,
    direction = 'left',
    speed = 40,
    className,
    pauseOnHover = true,
  }: {
    children: React.ReactNode;
    direction?: 'left' | 'right';
    speed?: number;
    className?: string;
    pauseOnHover?: boolean;
  }) => {
    return (
      <div
        className={cn('group flex overflow-hidden p-2 [--gap:1rem]', className)}
      >
        <div
          className={cn(
            'flex min-w-full shrink-0 justify-start [gap:var(--gap)] pr-[var(--gap)] will-change-transform [backface-visibility:hidden]',
            direction === 'left'
              ? 'animate-marquee-left'
              : 'animate-marquee-right',
            pauseOnHover && 'marquee-pause-on-hover',
          )}
          style={
            {
              '--duration': `${speed}s`,
            } as React.CSSProperties
          }
        >
          {children}
        </div>
        <div
          aria-hidden="true"
          className={cn(
            'flex min-w-full shrink-0 justify-start [gap:var(--gap)] pr-[var(--gap)] will-change-transform [backface-visibility:hidden]',
            direction === 'left'
              ? 'animate-marquee-left'
              : 'animate-marquee-right',
            pauseOnHover && 'marquee-pause-on-hover',
          )}
          style={
            {
              '--duration': `${speed}s`,
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      </div>
    );
  },
);
MarqueeRow.displayName = 'MarqueeRow';

const TestimonialCard = React.memo(
  ({
    item,
    variant = 'default',
  }: {
    item: Testimonial;
    variant?: 'default' | 'flush';
  }) => {
    if (variant === 'flush') {
      return (
        <div className="group border-border relative flex h-auto w-[350px] shrink-0 transform-gpu flex-col justify-between overflow-hidden rounded-none border-r bg-black/5 p-6 transition-all [backface-visibility:hidden] hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-white/5" />

          <div className="relative z-10 flex flex-col gap-4">
            <p className="text-muted-foreground line-clamp-4 text-sm leading-relaxed">
              &quot;{item.text}&quot;
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="border-border h-10 w-10 shrink-0 overflow-hidden rounded-full border">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-foreground text-sm font-medium">
                  {item.name}
                </span>
                {item.username && (
                  <span className="text-muted-foreground text-xs">
                    @{item.username}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="group border-border relative flex h-auto w-[350px] shrink-0 transform-gpu flex-col justify-between overflow-hidden rounded-2xl border bg-black/5 p-6 transition-all [backface-visibility:hidden] hover:-translate-y-1 hover:bg-black/10 hover:shadow-xl hover:shadow-black/5 dark:bg-white/5 dark:hover:bg-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-white/5" />

        <div className="relative z-10 flex flex-col gap-4">
          <p className="text-muted-foreground line-clamp-4 text-sm leading-relaxed">
            &quot;{item.text}&quot;
          </p>

          <div className="flex items-center gap-3 pt-2">
            <div className="border-border h-10 w-10 shrink-0 overflow-hidden rounded-full border">
              <img
                src={item.avatar}
                alt={item.name}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-sm font-medium">
                {item.name}
              </span>
              {item.username && (
                <span className="text-muted-foreground text-xs">
                  @{item.username}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
TestimonialCard.displayName = 'TestimonialCard';

export function TestimonialMarquee({
  items,
  variant = 'default',
  className,
  speed = 30,
  containerClassName,
}: TestimonialMarqueeProps) {
  // Combine custom className with container styling if needed
  const cnContainer = cn(containerClassName, className);

  const itemsToDisplay = React.useMemo(() => {
    let result = [...items];
    // Ensure we have enough items to fill the width for smooth animation
    // 10 items is a safe heuristic for most screen sizes with 350px cards
    while (result.length < 10) {
      result = [...result, ...items];
    }
    return result;
  }, [items]);

  return (
    <React.Fragment>
      <MarqueeStyles />
      {variant === 'dual' ? (
        <div
          className={cn(
            'flex flex-col gap-4 overflow-hidden py-8',
            containerClassName,
          )}
        >
          <MarqueeRow speed={speed} direction="left">
            {itemsToDisplay
              .slice(0, Math.ceil(itemsToDisplay.length / 2))
              .map((item, i) => (
                <TestimonialCard key={`row1-${i}`} item={item} />
              ))}
          </MarqueeRow>
          <MarqueeRow speed={speed} direction="right">
            {itemsToDisplay
              .slice(Math.ceil(itemsToDisplay.length / 2))
              .map((item, i) => (
                <TestimonialCard key={`row2-${i}`} item={item} />
              ))}
          </MarqueeRow>
        </div>
      ) : variant === 'stacked' ? (
        <div
          className={cn(
            'flex h-[600px] scale-110 rotate-[-2deg] flex-col justify-center gap-2 overflow-hidden py-8',
            containerClassName,
          )}
        >
          <div className="from-background to-background pointer-events-none absolute inset-0 z-10 bg-gradient-to-r via-transparent" />
          <MarqueeRow
            speed={speed * 1.5}
            direction="left"
            className="[--gap:0.75rem]"
          >
            {itemsToDisplay
              .slice(0, Math.ceil(itemsToDisplay.length / 3))
              .map((item, i) => (
                <TestimonialCard key={`s-row1-${i}`} item={item} />
              ))}
          </MarqueeRow>
          <MarqueeRow
            speed={speed * 1.2}
            direction="right"
            className="[--gap:0.75rem]"
          >
            {itemsToDisplay
              .slice(
                Math.ceil(itemsToDisplay.length / 3),
                Math.ceil(itemsToDisplay.length / 3) * 2,
              )
              .map((item, i) => (
                <TestimonialCard key={`s-row2-${i}`} item={item} />
              ))}
          </MarqueeRow>
          <MarqueeRow
            speed={speed * 1.5}
            direction="left"
            className="[--gap:0.75rem]"
          >
            {itemsToDisplay
              .slice(Math.ceil(itemsToDisplay.length / 3) * 2)
              .map((item, i) => (
                <TestimonialCard key={`s-row3-${i}`} item={item} />
              ))}
          </MarqueeRow>
        </div>
      ) : variant === 'flush' ? (
        <div
          className={cn(
            'border-border bg-background relative overflow-hidden border-y',
            cnContainer,
          )}
        >
          <MarqueeRow
            speed={speed}
            direction="left"
            className="p-0 [--gap:0rem]"
          >
            {itemsToDisplay.map((item, i) => (
              <TestimonialCard key={`flush-${i}`} item={item} variant="flush" />
            ))}
          </MarqueeRow>
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r to-transparent"></div>
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l to-transparent"></div>
        </div>
      ) : variant === 'flush-dual' ? (
        <div
          className={cn(
            'border-border bg-background relative flex flex-col overflow-hidden border-y',
            containerClassName,
          )}
        >
          <MarqueeRow
            speed={speed}
            direction="left"
            className="border-border border-b p-0 [--gap:0rem]"
          >
            {itemsToDisplay
              .slice(0, Math.ceil(itemsToDisplay.length / 2))
              .map((item, i) => (
                <TestimonialCard
                  key={`fd-row1-${i}`}
                  item={item}
                  variant="flush"
                />
              ))}
          </MarqueeRow>
          <MarqueeRow
            speed={speed}
            direction="right"
            className="p-0 [--gap:0rem]"
          >
            {itemsToDisplay
              .slice(Math.ceil(itemsToDisplay.length / 2))
              .map((item, i) => (
                <TestimonialCard
                  key={`fd-row2-${i}`}
                  item={item}
                  variant="flush"
                />
              ))}
          </MarqueeRow>
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-1/3 bg-gradient-to-r to-transparent"></div>
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-1/3 bg-gradient-to-l to-transparent"></div>
        </div>
      ) : (
        <div className={cn('overflow-hidden py-8', cnContainer)}>
          <MarqueeRow speed={speed} direction="left">
            {itemsToDisplay.map((item, i) => (
              <TestimonialCard key={`default-${i}`} item={item} />
            ))}
          </MarqueeRow>
        </div>
      )}
    </React.Fragment>
  );
}
