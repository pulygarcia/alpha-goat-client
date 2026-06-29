import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlfajorImageUploader } from './AlfajorImageUploader';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useUploadAlfajorImage } from '../hooks/useUploadAlfajorImage';

vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}));
vi.mock('../hooks/useUploadAlfajorImage', () => ({
  useUploadAlfajorImage: vi.fn(),
}));

const mutate = vi.fn();

function mockUser(role: 'USER' | 'ADMIN' | null) {
  vi.mocked(useCurrentUser).mockReturnValue({
    data: role ? { id: 'u1', role } : null,
  } as ReturnType<typeof useCurrentUser>);
}

function imageFile(type = 'image/png', size = 1024): File {
  const file = new File(['x'], 'alfajor', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function renderUploader() {
  return render(
    <AlfajorImageUploader
      alfajorId="a1"
      imagenUrl={null}
      nombre="Jorgito"
      placeholder="Negro"
    />,
  );
}

beforeEach(() => {
  vi.mocked(useUploadAlfajorImage).mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUploadAlfajorImage>);
  mutate.mockReset();
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview');
  globalThis.URL.revokeObjectURL = vi.fn();
});

describe('AlfajorImageUploader', () => {
  it('hides the upload control for non-admins', () => {
    mockUser('USER');
    renderUploader();
    expect(screen.queryByLabelText(/foto del alfajor/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /cambiar foto/i })).toBeNull();
  });

  it('hides the upload control for anonymous visitors', () => {
    mockUser(null);
    renderUploader();
    expect(screen.queryByLabelText(/foto del alfajor/i)).toBeNull();
  });

  it('shows the upload control for admins', () => {
    mockUser('ADMIN');
    renderUploader();
    expect(screen.getByLabelText(/foto del alfajor/i)).toBeInTheDocument();
  });

  it('previews a chosen image and uploads it on confirm', () => {
    mockUser('ADMIN');
    renderUploader();
    fireEvent.change(screen.getByLabelText(/foto del alfajor/i), {
      target: { files: [imageFile()] },
    });
    expect(screen.getByRole('button', { name: /guardar foto/i })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: /guardar foto/i }));
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid file and does not offer to save', () => {
    mockUser('ADMIN');
    renderUploader();
    fireEvent.change(screen.getByLabelText(/foto del alfajor/i), {
      target: { files: [imageFile('image/gif')] },
    });
    expect(screen.queryByRole('button', { name: /guardar foto/i })).toBeNull();
    expect(screen.getByText(/formato no válido/i)).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('cancels the preview without uploading', () => {
    mockUser('ADMIN');
    renderUploader();
    fireEvent.change(screen.getByLabelText(/foto del alfajor/i), {
      target: { files: [imageFile()] },
    });
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByRole('button', { name: /guardar foto/i })).toBeNull();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('does nothing when the picker is dismissed without a file', () => {
    mockUser('ADMIN');
    renderUploader();
    fireEvent.change(screen.getByLabelText(/foto del alfajor/i), {
      target: { files: [] },
    });
    expect(screen.queryByRole('button', { name: /guardar foto/i })).toBeNull();
  });

  it('clears the preview after a successful upload', () => {
    mockUser('ADMIN');
    mutate.mockImplementation((_file, opts) => opts?.onSuccess?.());
    renderUploader();
    fireEvent.change(screen.getByLabelText(/foto del alfajor/i), {
      target: { files: [imageFile()] },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar foto/i }));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
    expect(screen.queryByRole('button', { name: /guardar foto/i })).toBeNull();
  });

  it('shows the uploading state while the request is in flight', () => {
    mockUser('ADMIN');
    vi.mocked(useUploadAlfajorImage).mockReturnValue({
      mutate,
      isPending: true,
    } as unknown as ReturnType<typeof useUploadAlfajorImage>);
    renderUploader();
    fireEvent.change(screen.getByLabelText(/foto del alfajor/i), {
      target: { files: [imageFile()] },
    });
    const save = screen.getByRole('button', { name: /subiendo/i });
    expect(save).toBeDisabled();
  });
});
