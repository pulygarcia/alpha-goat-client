import { describe, it, expect } from 'vitest';
import { snapSide, clampY } from './fabPosition';

describe('snapSide', () => {
  it('snaps to the left edge when the center is on the left half', () => {
    expect(snapSide(100, 400)).toBe('left');
  });

  it('snaps to the right edge when the center is on the right half', () => {
    expect(snapSide(300, 400)).toBe('right');
  });

  it('snaps to the right edge exactly at the midpoint', () => {
    expect(snapSide(200, 400)).toBe('right');
  });
});

describe('clampY', () => {
  const VH = 800;
  const SIZE = 64;
  const MARGIN = 32;

  it('keeps a value already within bounds', () => {
    expect(clampY(400, VH, SIZE, MARGIN)).toBe(400);
  });

  it('clamps to the top margin when above it', () => {
    expect(clampY(0, VH, SIZE, MARGIN)).toBe(MARGIN);
  });

  it('clamps to the bottom (viewport - size - margin) when below it', () => {
    expect(clampY(10_000, VH, SIZE, MARGIN)).toBe(VH - SIZE - MARGIN);
  });
});
