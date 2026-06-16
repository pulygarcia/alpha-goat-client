import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useRevealOnScroll } from './useRevealOnScroll';

type IOCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

let lastCallback: IOCallback | null = null;
const observe = vi.fn();
const disconnect = vi.fn();

class MockIntersectionObserver {
  constructor(cb: IOCallback) {
    lastCallback = cb;
  }
  observe = observe;
  disconnect = disconnect;
  unobserve = vi.fn();
  takeRecords = vi.fn();
}

function setReducedMotion(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduced,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  }));
}

function Probe() {
  const { ref, revealed, animate } = useRevealOnScroll<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-testid="probe"
      data-revealed={revealed}
      data-animate={animate}
    />
  );
}

// Reproduce el caso del FeedHero: el nodo observado aparece DESPUÉS del primer
// render (mientras tanto se muestra otra cosa, p. ej. un estado de carga).
function DeferredProbe({ show }: { show: boolean }) {
  const { ref, revealed } = useRevealOnScroll<HTMLDivElement>();
  if (!show) return <span>cargando</span>;
  return <div ref={ref} data-testid="probe" data-revealed={revealed} />;
}

function read(container: HTMLElement) {
  const el = container.querySelector('[data-testid="probe"]')!;
  return {
    revealed: el.getAttribute('data-revealed') === 'true',
    animate: el.getAttribute('data-animate') === 'true',
  };
}

describe('useRevealOnScroll', () => {
  beforeEach(() => {
    lastCallback = null;
    observe.mockClear();
    disconnect.mockClear();
    setReducedMotion(false);
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts hidden and observes the element', () => {
    const { container } = render(<Probe />);
    expect(read(container).revealed).toBe(false);
    expect(read(container).animate).toBe(false);
    expect(observe).toHaveBeenCalledOnce();
  });

  it('reveals and animates when the element intersects', () => {
    const { container } = render(<Probe />);

    act(() => {
      lastCallback?.([{ isIntersecting: true }]);
    });

    expect(read(container).revealed).toBe(true);
    expect(read(container).animate).toBe(true);
    expect(disconnect).toHaveBeenCalled();
  });

  it('stays hidden while the element is not intersecting', () => {
    const { container } = render(<Probe />);

    act(() => {
      lastCallback?.([{ isIntersecting: false }]);
    });

    expect(read(container).revealed).toBe(false);
  });

  it('reveals without animating when reduced motion is preferred', () => {
    setReducedMotion(true);
    const { container } = render(<Probe />);

    act(() => {
      lastCallback?.([{ isIntersecting: true }]);
    });

    expect(read(container).revealed).toBe(true);
    expect(read(container).animate).toBe(false);
  });

  it('observes the element even if it mounts after the first render', () => {
    const { rerender, container } = render(<DeferredProbe show={false} />);
    // Nodo aún no montado: nada que observar.
    expect(observe).not.toHaveBeenCalled();

    rerender(<DeferredProbe show={true} />);
    expect(observe).toHaveBeenCalledOnce();

    act(() => {
      lastCallback?.([{ isIntersecting: true }]);
    });
    expect(read(container).revealed).toBe(true);
  });

  it('reveals immediately when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { container } = render(<Probe />);
    expect(read(container).revealed).toBe(true);
  });
});
