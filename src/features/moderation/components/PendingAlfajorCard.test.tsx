import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PendingAlfajorCard } from './PendingAlfajorCard';
import { useModerateAlfajor } from '../hooks/useModerateAlfajor';
import type { Alfajor } from '@/features/alfajores/types/alfajores.types';

vi.mock('../hooks/useModerateAlfajor', () => ({
  useModerateAlfajor: vi.fn(),
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
  });

  it('disables both actions while a mutation is in flight', () => {
    mockMutation(true);
    render(<PendingAlfajorCard alfajor={ALFAJOR} />);

    expect(screen.getByRole('button', { name: 'Aprobar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Rechazar' })).toBeDisabled();
  });
});
