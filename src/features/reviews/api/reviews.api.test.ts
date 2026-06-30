import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reviewsApi } from './reviews.api';
import { apiClient } from '@/shared/lib/api-client';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { post: vi.fn() },
}));

describe('reviewsApi.uploadPhoto', () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { id: 'r1' },
    } as never);
  });

  it('posts the file as multipart FormData to the review photo endpoint', async () => {
    const file = new File(['x'], 'review.png', { type: 'image/png' });

    await reviewsApi.uploadPhoto('r1', file);

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    const [url, body, config] = vi.mocked(apiClient.post).mock.calls[0];
    expect(url).toBe('/reviews/r1/foto');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('file')).toBe(file);
    expect(
      (config as { headers?: Record<string, string> })?.headers?.[
        'Content-Type'
      ],
    ).toBe('multipart/form-data');
  });
});
