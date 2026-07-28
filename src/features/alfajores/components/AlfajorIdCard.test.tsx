import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlfajorIdCard } from './AlfajorIdCard';
import type { Alfajor } from '../types/alfajores.types';

vi.mock('./AlfajorImageUploader', () => ({
  AlfajorImageUploader: () => <div data-testid="uploader" />,
}));

const ALFAJOR: Alfajor = {
  id: 'a1',
  nombre: 'Minitorta Águila Clásica',
  marcaId: 'm1',
  marca: {
    id: 'm1',
    nombre: 'Águila',
    provincia: 'Buenos Aires',
    logoUrl: null,
  },
  tipo: 'CHOCOLATE',
  descripcion: null,
  imagenUrl: null,
  status: 'APPROVED',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('AlfajorIdCard', () => {
  it('renders name, brand, province and type', () => {
    render(<AlfajorIdCard alfajor={ALFAJOR} />);
    expect(
      screen.getByRole('heading', { name: 'Minitorta Águila Clásica' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Águila')).toBeInTheDocument();
    expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
    expect(screen.getByText('Chocolate')).toBeInTheDocument();
  });

  it('falls back when there is no brand', () => {
    render(<AlfajorIdCard alfajor={{ ...ALFAJOR, marca: null }} />);
    expect(screen.getByText('Marca desconocida')).toBeInTheDocument();
    expect(screen.queryByText('Buenos Aires')).not.toBeInTheDocument();
  });

  it('hides the province when the brand has none', () => {
    render(
      <AlfajorIdCard
        alfajor={{ ...ALFAJOR, marca: { ...ALFAJOR.marca!, provincia: null } }}
      />,
    );
    expect(screen.getByText('Águila')).toBeInTheDocument();
    expect(screen.queryByText('Buenos Aires')).not.toBeInTheDocument();
  });

  it('keeps the image uploader as the photo slot', () => {
    render(<AlfajorIdCard alfajor={ALFAJOR} />);
    expect(screen.getByTestId('uploader')).toBeInTheDocument();
  });
});
