import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlbumHoja } from './AlbumHoja';
import type { AlbumHoja as AlbumHojaType } from '../types/album.types';

const HOJA_LLENA: AlbumHojaType = {
  marca: { id: 'm1', nombre: 'Havanna', provincia: 'Buenos Aires' },
  stats: { collected: 2, total: 3, pct: 67 },
  alfajores: [
    { id: 'a1', nombre: '70% Cacao', tipo: 'Chocolate negro', imagenUrl: null, avgRating: 4.6, collected: true, myRating: 8.5, reviewId: 'r1' },
    { id: 'a2', nombre: 'Clásico', tipo: 'Chocolate', imagenUrl: null, avgRating: 4.4, collected: true, myRating: 9, reviewId: 'r2' },
    { id: 'a3', nombre: 'Blanco DDL', tipo: 'Chocolate blanco', imagenUrl: null, avgRating: 4.1, collected: false, myRating: null, reviewId: null },
  ],
};

const HOJA_FLACA: AlbumHojaType = {
  marca: { id: 'm2', nombre: 'Grido', provincia: 'Córdoba' },
  stats: { collected: 1, total: 2, pct: 50 },
  alfajores: [
    { id: 'a4', nombre: 'Helado DDL', tipo: 'Helado', imagenUrl: null, avgRating: 3.8, collected: true, myRating: 7, reviewId: 'r4' },
    { id: 'a5', nombre: 'Bombón', tipo: 'Chocolate', imagenUrl: null, avgRating: null, collected: false, myRating: null, reviewId: null },
  ],
};

describe('AlbumHoja', () => {
  it('shows the brand name, sheet number and progress', () => {
    render(<AlbumHoja hoja={HOJA_LLENA} index={3} />);

    expect(screen.getByText('Havanna')).toBeInTheDocument();
    expect(screen.getByText('Hoja 03 · Buenos Aires')).toBeInTheDocument();
    expect(screen.getByText('2/3')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('adds a FichaMarca filler when the sheet has 2 or fewer figuritas', () => {
    render(<AlbumHoja hoja={HOJA_FLACA} index={7} />);

    expect(screen.getByText(/2 figuritas en catálogo/)).toBeInTheDocument();
  });

  it('does not add a filler when the sheet has 3 or more figuritas', () => {
    render(<AlbumHoja hoja={HOJA_LLENA} index={3} />);

    expect(screen.queryByText(/figuritas en catálogo/)).not.toBeInTheDocument();
  });
});
