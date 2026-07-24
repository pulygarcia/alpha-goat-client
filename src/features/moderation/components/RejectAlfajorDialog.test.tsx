import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RejectAlfajorDialog } from './RejectAlfajorDialog';

const onConfirm = vi.fn();
const onOpenChange = vi.fn();

function renderDialog(isPending = false) {
  return render(
    <RejectAlfajorDialog
      alfajorNombre="Capitán del Espacio"
      open
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      isPending={isPending}
    />,
  );
}

beforeEach(() => {
  onConfirm.mockClear();
  onOpenChange.mockClear();
});

describe('RejectAlfajorDialog', () => {
  it('submits the trimmed reason', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(
      screen.getByLabelText('Motivo del rechazo'),
      '  Duplicado  ',
    );
    await user.click(screen.getByRole('button', { name: 'Confirmar rechazo' }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith('Duplicado'));
  });

  it('shows an inline error and does not submit when the reason is empty', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Confirmar rechazo' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Contanos por qué lo rechazás',
    );
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('disables the submit button while the mutation is pending', () => {
    renderDialog(true);

    expect(screen.getByRole('button', { name: 'Rechazando…' })).toBeDisabled();
  });

  it('resets the form and notifies the parent when closed', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText('Motivo del rechazo'), 'Duplicado');
    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
