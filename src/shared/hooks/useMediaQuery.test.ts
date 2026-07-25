import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

afterEach(() => vi.unstubAllGlobals());

function stubMatchMedia(matches: boolean) {
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches, addEventListener, removeEventListener }),
  );
  return { addEventListener, removeEventListener };
}

describe('useMediaQuery', () => {
  it('devuelve si la query matchea', () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(true);
  });

  it('devuelve false cuando no matchea', () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(false);
  });

  it('se desuscribe al desmontar', () => {
    const { removeEventListener } = stubMatchMedia(true);
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 767px)'));

    unmount();
    expect(removeEventListener).toHaveBeenCalled();
  });

  it('cae a false sin matchMedia (jsdom pelado, WebViews viejas)', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));
    expect(result.current).toBe(false);
  });
});
