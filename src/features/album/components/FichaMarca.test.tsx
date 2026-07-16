import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FichaMarca } from './FichaMarca';

describe('FichaMarca', () => {
  it('shows the brand initials, catalog size and provincia', () => {
    render(<FichaMarca marca={{ id: 'm1', nombre: 'Grido', provincia: 'Córdoba' }} total={2} />);

    expect(screen.getByText('GR')).toBeInTheDocument();
    expect(screen.getByText(/2 figuritas en catálogo/)).toBeInTheDocument();
    expect(screen.getByText('CÓRDOBA · AR')).toBeInTheDocument();
  });

  it('omits the provincia line when the brand has none', () => {
    render(<FichaMarca marca={{ id: 'm2', nombre: 'Jorgito', provincia: null }} total={1} />);

    expect(screen.queryByText(/· AR/)).not.toBeInTheDocument();
  });
});
