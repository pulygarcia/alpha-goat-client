import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { ProposeAlfajorModal } from './ProposeAlfajorModal';
import { useProposeAlfajor } from '../hooks/useProposeAlfajor';
import { notifyError } from '@/shared/lib/toast';
import type { Marca } from '@/features/marcas/types/marcas.types';

vi.mock('../hooks/useProposeAlfajor');
vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

const MARCA: Marca = {
  id: 'm1',
  nombre: 'Havanna',
  provincia: null,
  logoUrl: null,
};

// Combobox real es del dominio marcas (tiene su propio test): acá lo reemplazamos
// por un control mínimo para enfocar el modal en su lógica de submit.
vi.mock('@/features/marcas/components/MarcaCombobox', () => ({
  MarcaCombobox: ({ onChange }: { onChange: (m: Marca) => void }) => (
    <button type="button" onClick={() => onChange(MARCA)}>
      elegir marca
    </button>
  ),
}));

let mutate: ReturnType<typeof vi.fn>;

function setMutation(impl: (...args: never[]) => void) {
  mutate = vi.fn(impl);
  vi.mocked(useProposeAlfajor).mockReturnValue({
    mutate,
    isPending: false,
  } as never);
}

async function fillForm() {
  await userEvent.type(screen.getByLabelText(/nombre/i), 'Havanna Mixto');
  await userEvent.click(screen.getByText('elegir marca'));
  await userEvent.selectOptions(screen.getByLabelText(/tipo/i), 'NEGRO');
}

function conflict() {
  return new AxiosError('conflict', undefined, undefined, undefined, {
    status: 409,
    data: { message: 'alfajor already exists' },
  } as never);
}

describe('ProposeAlfajorModal', () => {
  beforeEach(() => {
    vi.mocked(useProposeAlfajor).mockReset();
    vi.mocked(notifyError).mockReset();
  });

  it('submits a valid proposal and shows the confirmation view', async () => {
    setMutation((_input, opts: { onSuccess: () => void }) => opts.onSuccess());
    render(<ProposeAlfajorModal open onOpenChange={vi.fn()} />);

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

    expect(mutate).toHaveBeenCalledWith(
      { nombre: 'Havanna Mixto', marcaId: 'm1', tipo: 'NEGRO' },
      expect.anything(),
    );
    expect(
      await screen.findByText(/pendiente de aprobaci/i),
    ).toBeInTheDocument();
  });

  it('shows an inline error on 409 conflict without a toast', async () => {
    setMutation((_input, opts: { onError: (e: unknown) => void }) =>
      opts.onError(conflict()),
    );
    render(<ProposeAlfajorModal open onOpenChange={vi.fn()} />);

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

    expect(await screen.findByText(/ya existe/i)).toBeInTheDocument();
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('notifies a generic error on non-409 failures', async () => {
    setMutation((_input, opts: { onError: (e: unknown) => void }) =>
      opts.onError(new Error('boom')),
    );
    render(<ProposeAlfajorModal open onOpenChange={vi.fn()} />);

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => expect(notifyError).toHaveBeenCalled());
  });

  it('does not submit when required fields are missing', async () => {
    setMutation(() => {});
    render(<ProposeAlfajorModal open onOpenChange={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

    expect(mutate).not.toHaveBeenCalled();
  });
});
