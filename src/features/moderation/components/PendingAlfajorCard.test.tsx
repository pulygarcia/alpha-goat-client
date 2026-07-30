import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PendingAlfajorCard } from './PendingAlfajorCard';
import { useModerateAlfajor } from '../hooks/useModerateAlfajor';
import type { Alfajor } from '@/features/alfajores/types/alfajores.types';

vi.mock('../hooks/useModerateAlfajor', () => ({
  useModerateAlfajor: vi.fn(),
}));

// El combobox es del dominio marcas (pega a la API y tiene su propio test):
// acá lo reemplazamos por un control mínimo, como en el ProposeAlfajorModal.
vi.mock('@/features/marcas/components/MarcaCombobox', () => ({
  MarcaCombobox: ({
    onChange,
  }: {
    onChange: (value: { kind: 'catalogo'; marca: { id: string } }) => void;
  }) => (
    <button
      type="button"
      onClick={() => onChange({ kind: 'catalogo', marca: { id: 'm9' } })}
    >
      elegir marca
    </button>
  ),
}));

const ALFAJOR: Alfajor = {
  id: 'a1',
  nombre: 'Capitán del Espacio',
  marcaId: 'm1',
  marca: { id: 'm1', nombre: 'CDE', provincia: 'Buenos Aires', logoUrl: null },
  tipo: 'CHOCOLATE',
  descripcion: null,
  imagenUrl: null,
  status: 'PENDING',
  rejectionReason: null,
  createdById: 'u1',
  createdAt: '2026-07-01T00:00:00.000Z',
};

const mutate = vi.fn();

function mockMutation(isPending = false) {
  vi.mocked(useModerateAlfajor).mockReturnValue({
    mutate,
    isPending,
  } as never);
}

beforeEach(() => {
  mutate.mockClear();
});

describe('PendingAlfajorCard', () => {
  it('renders the alfajor data', () => {
    mockMutation();
    render(<PendingAlfajorCard alfajor={ALFAJOR} />);

    expect(screen.getByText('Capitán del Espacio')).toBeInTheDocument();
    expect(
      screen.getByText(/CDE · Buenos Aires · Chocolate/),
    ).toBeInTheDocument();
  });

  it('approves on Aprobar click', async () => {
    const user = userEvent.setup();
    mockMutation();
    render(<PendingAlfajorCard alfajor={ALFAJOR} />);

    await user.click(screen.getByRole('button', { name: 'Aprobar' }));

    expect(mutate).toHaveBeenCalledWith({ id: 'a1', action: 'approve' });
  });

  it('opens the reject dialog and submits the reason', async () => {
    const user = userEvent.setup();
    mockMutation();
    render(<PendingAlfajorCard alfajor={ALFAJOR} />);

    await user.click(screen.getByRole('button', { name: 'Rechazar' }));
    await user.type(
      await screen.findByLabelText('Motivo del rechazo'),
      'Duplicado',
    );
    await user.click(screen.getByRole('button', { name: 'Confirmar rechazo' }));

    expect(mutate).toHaveBeenCalledWith(
      { id: 'a1', action: 'reject', rejectionReason: 'Duplicado' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    const { onSuccess } = mutate.mock.calls[0][1];
    act(() => onSuccess());
    expect(
      screen.queryByLabelText('Motivo del rechazo'),
    ).not.toBeInTheDocument();
  });

  describe('with a free-text marca', () => {
    const LIBRE: Alfajor = {
      ...ALFAJOR,
      marcaId: null,
      marca: null,
      marcaNombrePropuesto: 'Dulcinea',
    };

    it('shows the proposed name instead of a marca', () => {
      mockMutation();
      render(<PendingAlfajorCard alfajor={LIBRE} />);

      expect(screen.getByText('Marca nueva')).toBeInTheDocument();
      expect(screen.getByText(/“Dulcinea” · Chocolate/)).toBeInTheDocument();
    });

    it('approves without a marcaId: the back resolves the proposed name', async () => {
      const user = userEvent.setup();
      mockMutation();
      render(<PendingAlfajorCard alfajor={LIBRE} />);

      await user.click(screen.getByRole('button', { name: 'Aprobar' }));

      expect(mutate).toHaveBeenCalledWith({ id: 'a1', action: 'approve' });
    });

    it('links the proposal to an existing marca from the dialog', async () => {
      const user = userEvent.setup();
      mockMutation();
      render(<PendingAlfajorCard alfajor={LIBRE} />);

      await user.click(screen.getByRole('button', { name: 'Vincular' }));
      expect(
        await screen.findByText(/Vincular “Dulcinea”/),
      ).toBeInTheDocument();
      // Sin marca elegida no se puede confirmar: mandar el approve sin id es
      // lo que ya hace el botón Aprobar.
      expect(
        screen.getByRole('button', { name: /Aprobar con esta marca/ }),
      ).toBeDisabled();

      await user.click(screen.getByRole('button', { name: 'elegir marca' }));
      await user.click(
        screen.getByRole('button', { name: /Aprobar con esta marca/ }),
      );

      expect(mutate).toHaveBeenCalledWith(
        { id: 'a1', action: 'approve', marcaId: 'm9' },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it('does not offer Vincular when the marca is already resolved', () => {
      mockMutation();
      render(<PendingAlfajorCard alfajor={ALFAJOR} />);

      expect(
        screen.queryByRole('button', { name: 'Vincular' }),
      ).not.toBeInTheDocument();
    });
  });

  it('disables both actions while a mutation is in flight', () => {
    mockMutation(true);
    render(<PendingAlfajorCard alfajor={ALFAJOR} />);

    expect(screen.getByRole('button', { name: 'Aprobar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeDisabled();
  });
});
