import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HojaPager } from './HojaPager';
import type { AlbumHoja } from '../types/album.types';

const HOJAS: AlbumHoja[] = [
  {
    marca: { id: 'm1', nombre: 'Águila', provincia: 'Córdoba' },
    stats: { collected: 4, total: 4, pct: 100 },
    alfajores: [],
  },
  {
    marca: { id: 'm2', nombre: 'Havanna', provincia: 'CABA' },
    stats: { collected: 4, total: 6, pct: 67 },
    alfajores: [],
  },
  {
    marca: { id: 'm3', nombre: 'Cachafaz', provincia: null },
    stats: { collected: 1, total: 3, pct: 33 },
    alfajores: [],
  },
];

describe('HojaPager', () => {
  it('shows one indicator dot per hoja, marking the active one', () => {
    render(<HojaPager hojas={HOJAS} activeIndex={1} onNavigate={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Ir a la hoja de Havanna' }),
    ).toHaveAttribute('aria-current', 'true');
    expect(
      screen.getByRole('button', { name: 'Ir a la hoja de Águila' }),
    ).toHaveAttribute('aria-current', 'false');
  });

  it('navigates when an indicator dot is clicked', async () => {
    const onNavigate = vi.fn();
    render(<HojaPager hojas={HOJAS} activeIndex={1} onNavigate={onNavigate} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Ir a la hoja de Cachafaz' }),
    );
    expect(onNavigate).toHaveBeenCalledWith('m3');
  });

  it('navigates to the next hoja via the arrow button', async () => {
    const onNavigate = vi.fn();
    render(<HojaPager hojas={HOJAS} activeIndex={1} onNavigate={onNavigate} />);

    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(onNavigate).toHaveBeenCalledWith('m3');
  });

  it('disables the previous button on the first hoja', () => {
    render(<HojaPager hojas={HOJAS} activeIndex={0} onNavigate={vi.fn()} />);

    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled();
  });

  it('disables the next button on the last hoja', () => {
    render(<HojaPager hojas={HOJAS} activeIndex={2} onNavigate={vi.fn()} />);

    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled();
  });
});
