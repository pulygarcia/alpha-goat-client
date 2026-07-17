import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FiguritaCard } from './FiguritaCard';
import type { AlbumFigurita } from '../types/album.types';

const COLLECTED: AlbumFigurita = {
  id: 'a1',
  nombre: '70% Cacao',
  tipo: 'Chocolate negro',
  imagenUrl: null,
  avgRating: 4.6,
  collected: true,
  myRating: 8.5,
  reviewId: 'r1',
};

const UNCOLLECTED: AlbumFigurita = {
  id: 'a2',
  nombre: 'Blanco DDL',
  tipo: 'Chocolate blanco',
  imagenUrl: null,
  avgRating: 4.1,
  collected: false,
  myRating: null,
  reviewId: null,
};

describe('FiguritaCard', () => {
  it('shows the name, my rating and links to the alfajor detail when collected', () => {
    render(<FiguritaCard figurita={COLLECTED} />);

    expect(screen.getByText('70% Cacao')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.queryByText('Faltante')).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/alfajores/a1');
  });

  it('shows the "faltante" tag and hides my rating when not collected', () => {
    render(<FiguritaCard figurita={UNCOLLECTED} />);

    expect(screen.getByText('Faltante')).toBeInTheDocument();
    expect(screen.queryByText('8.5')).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/alfajores/a2');
  });
});
