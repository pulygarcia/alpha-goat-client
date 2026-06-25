import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CountUp } from './CountUp';

const reduceMock = vi.fn();
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return { ...actual, useReducedMotion: () => reduceMock() };
});

describe('CountUp', () => {
  it('renders the final value immediately with reduced motion', () => {
    reduceMock.mockReturnValue(true);
    render(<CountUp value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('animates up to the final value', async () => {
    reduceMock.mockReturnValue(false);
    render(<CountUp value={7} durationMs={50} />);
    await waitFor(() => expect(screen.getByText('7')).toBeInTheDocument());
  });

  it('formats with decimals when configured', async () => {
    reduceMock.mockReturnValue(false);
    render(<CountUp value={7.8} durationMs={50} decimals={1} />);
    await waitFor(() => expect(screen.getByText('7.8')).toBeInTheDocument());
  });
});
