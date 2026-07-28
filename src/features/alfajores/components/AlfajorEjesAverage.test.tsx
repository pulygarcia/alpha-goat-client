import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlfajorEjesAverage } from './AlfajorEjesAverage';

const EJES = {
  dulzor: 8.3,
  cantidadDDL: 8.8,
  calidadBano: 7.9,
  ratioTapaRelleno: 7.4,
  textura: 8.6,
};

describe('AlfajorEjesAverage', () => {
  it('renders every axis with its label and value', () => {
    render(<AlfajorEjesAverage avgEjes={EJES} />);
    expect(screen.getByText('Dulzor')).toBeInTheDocument();
    expect(screen.getByText('Dulce de leche')).toBeInTheDocument();
    expect(screen.getByText('Calidad del baño')).toBeInTheDocument();
    expect(screen.getByText('Tapa / relleno')).toBeInTheDocument();
    expect(screen.getByText('Textura')).toBeInTheDocument();
    expect(screen.getByText('8.3')).toBeInTheDocument();
    expect(screen.getByText('8.8')).toBeInTheDocument();
  });

  it('sizes each bar as a percentage of 10', () => {
    render(<AlfajorEjesAverage avgEjes={EJES} />);
    expect(screen.getByTestId('eje-fill-dulzor')).toHaveStyle({ width: '83%' });
    expect(screen.getByTestId('eje-fill-textura')).toHaveStyle({
      width: '86%',
    });
  });

  it('renders the dimmed state with no values when avgEjes is missing', () => {
    render(<AlfajorEjesAverage avgEjes={null} />);
    expect(screen.getByText('Dulzor')).toBeInTheDocument();
    expect(screen.queryByTestId('eje-fill-dulzor')).not.toBeInTheDocument();
    expect(screen.getByTestId('ejes-average')).toHaveAttribute(
      'data-empty',
      'true',
    );
  });

  it('treats an absent prop the same as null', () => {
    render(<AlfajorEjesAverage />);
    expect(screen.getByTestId('ejes-average')).toHaveAttribute(
      'data-empty',
      'true',
    );
  });
});
