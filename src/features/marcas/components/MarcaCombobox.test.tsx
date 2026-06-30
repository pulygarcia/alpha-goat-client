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

    expect(onChange).toHaveBeenCalledWith(HAVANNA);
  });

  it('shows the selected marca name', () => {
    render(<MarcaCombobox value={HAVANNA} onChange={vi.fn()} />);

    expect(screen.getByRole('combobox')).toHaveValue('Havanna');
  });
});
