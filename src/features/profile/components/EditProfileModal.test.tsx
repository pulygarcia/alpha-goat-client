import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditProfileModal } from './EditProfileModal';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useChangePassword } from '../hooks/useChangePassword';

vi.mock('../hooks/useUpdateProfile', () => ({ useUpdateProfile: vi.fn() }));
vi.mock('../hooks/useChangePassword', () => ({ useChangePassword: vi.fn() }));

const updateMutate = vi.fn();
const passwordMutate = vi.fn();

beforeEach(() => {
  updateMutate.mockReset();
  passwordMutate.mockReset();
  vi.mocked(useUpdateProfile).mockReturnValue({
    mutate: updateMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateProfile>);
  vi.mocked(useChangePassword).mockReturnValue({
    mutate: passwordMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useChangePassword>);
});

function renderModal() {
  return render(
    <EditProfileModal open onOpenChange={vi.fn()} username="puly" />,
  );
}

describe('EditProfileModal', () => {
  it('prefills the username field with the current username', () => {
    renderModal();
    expect(screen.getByLabelText(/nombre de usuario/i)).toHaveValue('puly');
  });

  it('submits the username change', async () => {
    renderModal();
    const input = screen.getByLabelText(/nombre de usuario/i);
    fireEvent.change(input, { target: { value: 'pulygarcia' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() =>
      expect(updateMutate).toHaveBeenCalledWith({ username: 'pulygarcia' }),
    );
  });

  it('switches to the password section and submits it', async () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /contraseña/i }));

    fireEvent.change(screen.getByLabelText(/contraseña actual/i), {
      target: { value: 'oldpass1' },
    });
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), {
      target: { value: 'newpass1' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /cambiar contraseña/i }),
    );

    await waitFor(() => expect(passwordMutate).toHaveBeenCalled());
    expect(passwordMutate.mock.calls[0][0]).toEqual({
      currentPassword: 'oldpass1',
      newPassword: 'newpass1',
    });
  });
});
