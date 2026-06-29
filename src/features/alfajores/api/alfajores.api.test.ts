import { describe, it, expect, vi, beforeEach } from 'vitest';
import { alfajoresApi } from './alfajores.api';
import { apiClient } from '@/shared/lib/api-client';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { post: vi.fn() },
}));

describe('alfajoresApi.uploadImage', () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { id: 'a1' },
    } as never);
  });

  it('posts the file as multipart FormData to the alfajor image endpoint', async () => {
    const file = new File(['x'], 'alfajor.png', { type: 'image/png' });

    await alfajoresApi.uploadImage('a1', file);

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    const [url, body, config] = vi.mocked(apiClient.post).mock.calls[0];
    expect(url).toBe('/alfajores/a1/imagen');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('file')).toBe(file);
    expect(
      (config as { headers?: Record<string, string> })?.headers?.[
        'Content-Type'
      ],
    ).toBe('multipart/form-data');
  });
});
