import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StaggerItem } from './StaggerItem';

const useReducedMotionMock = vi.fn();

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    useReducedMotion: () => useReducedMotionMock(),
  };
});

describe('StaggerItem', () => {
  it('renders children without animation wrapper when reduced motion is preferred', () => {
    useReducedMotionMock.mockReturnValue(true);
    render(
      <StaggerItem index={0}>
        <span>contenido</span>
      </StaggerItem>,
    );

    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('wraps children in the staggered motion.div otherwise', () => {
    useReducedMotionMock.mockReturnValue(false);
    render(
      <StaggerItem index={2}>
        <span>contenido</span>
      </StaggerItem>,
    );

    expect(screen.getByText('contenido')).toBeInTheDocument();
  });
});
