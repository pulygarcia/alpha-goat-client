import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFeedTourSeen } from './useFeedTourSeen';

const TOUR_KEY = 'ag-feed-fab-tour-seen';

beforeEach(() => {
  window.localStorage.clear();
});

describe('useFeedTourSeen', () => {
  it('resuelve a no-visto cuando no hay flag en localStorage', async () => {
    const { result } = renderHook(() => useFeedTourSeen());

    await waitFor(() => expect(result.current.seen).toBe(false));
  });

  it('resuelve a visto cuando el flag ya está en localStorage', async () => {
    window.localStorage.setItem(TOUR_KEY, '1');
    const { result } = renderHook(() => useFeedTourSeen());

    await waitFor(() => expect(result.current.seen).toBe(true));
  });

  it('markSeen persiste el flag y actualiza el estado', async () => {
    const { result } = renderHook(() => useFeedTourSeen());
    await waitFor(() => expect(result.current.seen).toBe(false));

    act(() => result.current.markSeen());

    expect(result.current.seen).toBe(true);
    expect(window.localStorage.getItem(TOUR_KEY)).toBe('1');
  });
});
