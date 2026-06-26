import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileApi } from './profile.api';
import { apiClient } from '@/shared/lib/api-client';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { post: vi.fn() },
}));

describe('profileApi.uploadAvatar', () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
    vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 'u1' } } as never);
  });

  it('posts the file as multipart FormData (overriding the JSON default)', async () => {
    const file = new File(['x'], 'avatar.png', { type: 'image/png' });

    await profileApi.uploadAvatar(file);

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    const [url, body, config] = vi.mocked(apiClient.post).mock.calls[0];
    expect(url).toBe('/users/me/avatar');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('file')).toBe(file);
    expect(
      (config as { headers?: Record<string, string> })?.headers?.[
        'Content-Type'
      ],
    ).toBe('multipart/form-data');
  });
});
