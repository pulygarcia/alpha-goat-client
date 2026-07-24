import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Cookie } from 'lucide-react';
import { StatCounter } from './StatCounter';

const useInViewMock = vi.fn();
const useReducedMotionMock = vi.fn();
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    useInView: () => useInViewMock(),
    useReducedMotion: () => useReducedMotionMock(),
  };
});

describe('StatCounter', () => {
  it('shows the final value immediately with reduced motion', () => {
    useInViewMock.mockReturnValue(true);
    useReducedMotionMock.mockReturnValue(true);
    render(<StatCounter label="Alfajores" value={42} icon={Cookie} />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Alfajores')).toBeInTheDocument();
  });

  it('does not animate before entering view', () => {
    useInViewMock.mockReturnValue(false);
    useReducedMotionMock.mockReturnValue(false);
    render(<StatCounter label="Reseñas" value={10} icon={Cookie} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('counts up to the value once in view', async () => {
    useInViewMock.mockReturnValue(true);
    useReducedMotionMock.mockReturnValue(false);
    render(<StatCounter label="Usuarios" value={7} icon={Cookie} />);

    await waitFor(() => expect(screen.getByText('7')).toBeInTheDocument());
  });
});
