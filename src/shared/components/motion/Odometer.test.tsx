import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Odometer } from './Odometer';

const reduceMock = vi.fn();
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return { ...actual, useReducedMotion: () => reduceMock() };
});

describe('Odometer', () => {
  it('renders the final value as plain text with reduced motion', () => {
    reduceMock.mockReturnValue(true);
    render(<Odometer value={140} />);
    expect(screen.getByText('140')).toBeInTheDocument();
  });

  it('exposes the full value accessibly while animating', () => {
    reduceMock.mockReturnValue(false);
    render(<Odometer value={57} />);
    expect(screen.getByText('57')).toBeInTheDocument();
  });

  it('formats decimals', () => {
    reduceMock.mockReturnValue(false);
    render(<Odometer value={7.8} decimals={1} />);
    expect(screen.getByText('7.8')).toBeInTheDocument();
  });
});
