import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import { notifySuccess, notifyError } from './toast';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('toast helper', () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockReset();
    vi.mocked(toast.error).mockReset();
  });

  it('notifySuccess delega en toast.success con el mensaje', () => {
    notifySuccess('Reseña publicada');
    expect(toast.success).toHaveBeenCalledWith('Reseña publicada');
  });

  it('notifyError delega en toast.error con el mensaje', () => {
    notifyError('Algo falló');
    expect(toast.error).toHaveBeenCalledWith('Algo falló');
  });
});
