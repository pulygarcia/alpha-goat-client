import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarcaCombobox } from './MarcaCombobox';
import { useMarcasSearch } from '../hooks/useMarcasSearch';
import type { Marca } from '../types/marcas.types';

vi.mock('../hooks/useMarcasSearch');
vi.mock('@/shared/hooks/useDebouncedValue', () => ({
  useDebouncedValue: (v: unknown) => v,
}));

const HAVANNA: Marca = {
  id: 'm1',
  nombre: 'Havanna',
  provincia: null,
  logoUrl: null,
};

function mockSearch(items: Marca[]) {
  vi.mocked(useMarcasSearch).mockReturnValue({
    data: items,
    isLoading: false,
  } as never);
}

describe('MarcaCombobox', () => {
  beforeEach(() => {
    vi.mocked(useMarcasSearch).mockReset();
    mockSearch([]);
  });

  it('lists matches as the user types and selects one on click', async () => {
    const onChange = vi.fn();
    mockSearch([HAVANNA]);
    render(<MarcaCombobox value={null} onChange={onChange} />);

    await userEvent.type(screen.getByRole('combobox'), 'hav');
    await userEvent.click(screen.getByRole('option', { name: /Havanna/ }));

    expect(onChange).toHaveBeenCalledWith({
      kind: 'catalogo',
      marca: HAVANNA,
    });
  });

  it('shows the selected marca name', () => {
    render(
      <MarcaCombobox
        value={{ kind: 'catalogo', marca: HAVANNA }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('combobox')).toHaveValue('Havanna');
  });

  it('does not offer the free-brand escape unless allowFree is set', async () => {
    render(<MarcaCombobox value={null} onChange={vi.fn()} />);

    await userEvent.type(screen.getByRole('combobox'), 'dulcinea');

    expect(screen.getByText(/No encontramos/)).toBeInTheDocument();
    expect(screen.queryByText(/como marca nueva/)).not.toBeInTheDocument();
  });

  it('offers the typed text as a new marca when allowFree is set', async () => {
    const onChange = vi.fn();
    render(<MarcaCombobox value={null} onChange={onChange} allowFree />);

    await userEvent.type(screen.getByRole('combobox'), 'dulcinea');
    await userEvent.click(screen.getByText(/Usar “dulcinea” como marca nueva/));

    expect(onChange).toHaveBeenCalledWith({
      kind: 'libre',
      nombre: 'dulcinea',
    });
  });

  it('offers the escape even when the search returned matches', async () => {
    mockSearch([HAVANNA]);
    render(<MarcaCombobox value={null} onChange={vi.fn()} allowFree />);

    await userEvent.type(screen.getByRole('combobox'), 'hav');

    expect(screen.getByRole('option', { name: /Havanna/ })).toBeInTheDocument();
    expect(screen.getByText(/Usar “hav” como marca nueva/)).toBeInTheDocument();
  });

  it('hides the escape for text shorter than the back accepts', async () => {
    render(<MarcaCombobox value={null} onChange={vi.fn()} allowFree />);

    await userEvent.type(screen.getByRole('combobox'), 'd');

    expect(screen.queryByText(/como marca nueva/)).not.toBeInTheDocument();
  });

  it('labels a free marca and lets the user drop it', async () => {
    const onChange = vi.fn();
    render(
      <MarcaCombobox
        value={{ kind: 'libre', nombre: 'dulcinea' }}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole('combobox')).toHaveValue('dulcinea');
    expect(screen.getByText('Marca nueva')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Quitar la marca nueva' }),
    );
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
