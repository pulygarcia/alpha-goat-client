import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarcaIndex } from './MarcaIndex';
import type { AlbumHoja } from '../types/album.types';

const HOJAS: AlbumHoja[] = [
  { marca: { id: 'm1', nombre: 'Águila', provincia: 'Córdoba' }, stats: { collected: 4, total: 4, pct: 100 }, alfajores: [] },
  { marca: { id: 'm2', nombre: 'Havanna', provincia: 'CABA' }, stats: { collected: 4, total: 6, pct: 67 }, alfajores: [] },
];

describe('MarcaIndex', () => {
  it('renders one pill per hoja with its completion percentage', () => {
    render(<MarcaIndex hojas={HOJAS} activeMarcaId="m2" onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Águila.*100%/s })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Havanna.*67%/s })).toBeInTheDocument();
  });

  it('marks the active pill and calls onSelect with the marca id on click', async () => {
    const onSelect = vi.fn();
    render(<MarcaIndex hojas={HOJAS} activeMarcaId="m2" onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: /Havanna/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Águila/ })).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(screen.getByRole('button', { name: /Águila/ }));
    expect(onSelect).toHaveBeenCalledWith('m1');
  });
});
