import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditProfileModal } from './EditProfileModal';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useChangePassword } from '../hooks/useChangePassword';
import { useUploadAvatar } from '../hooks/useUploadAvatar';

vi.mock('../hooks/useUpdateProfile', () => ({ useUpdateProfile: vi.fn() }));
vi.mock('../hooks/useChangePassword', () => ({ useChangePassword: vi.fn() }));
vi.mock('../hooks/useUploadAvatar', () => ({ useUploadAvatar: vi.fn() }));

const updateMutate = vi.fn();
const passwordMutate = vi.fn();
const avatarMutate = vi.fn();

beforeEach(() => {
  updateMutate.mockReset();
  passwordMutate.mockReset();
  avatarMutate.mockReset();
  vi.mocked(useUpdateProfile).mockReturnValue({
    mutate: updateMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateProfile>);
  vi.mocked(useChangePassword).mockReturnValue({
    mutate: passwordMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useChangePassword>);
  vi.mocked(useUploadAvatar).mockReturnValue({
    mutate: avatarMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUploadAvatar>);
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview');
  globalThis.URL.revokeObjectURL = vi.fn();
});

function renderModal(avatarUrl: string | null = null) {
  return render(
    <EditProfileModal
      open
      onOpenChange={vi.fn()}
      username="puly"
      avatarUrl={avatarUrl}
    />,
  );
}

function imageFile(type = 'image/png', size = 1024) {
  const file = new File(['x'], 'avatar', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
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

  it('previews a chosen image and uploads it on confirm', async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText(/foto de perfil/i), {
      target: { files: [imageFile()] },
    });

    const save = await screen.findByRole('button', { name: /guardar foto/i });
    fireEvent.click(save);

    await waitFor(() => expect(avatarMutate).toHaveBeenCalled());
    expect(avatarMutate.mock.calls[0][0]).toBeInstanceOf(File);
  });

  it('rejects an invalid file and does not offer to save', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText(/foto de perfil/i), {
      target: { files: [imageFile('image/gif')] },
    });

    expect(screen.getByText(/formato no válido/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /guardar foto/i }),
    ).not.toBeInTheDocument();
    expect(avatarMutate).not.toHaveBeenCalled();
  });

  it('cancels the preview without uploading', async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText(/foto de perfil/i), {
      target: { files: [imageFile()] },
    });

    fireEvent.click(await screen.findByRole('button', { name: /cancelar/i }));

    expect(
      screen.queryByRole('button', { name: /guardar foto/i }),
    ).not.toBeInTheDocument();
    expect(avatarMutate).not.toHaveBeenCalled();
  });
});
