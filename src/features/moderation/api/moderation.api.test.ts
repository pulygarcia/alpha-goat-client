import { describe, it, expect, vi, beforeEach } from 'vitest';
import { moderationApi } from './moderation.api';
import { apiClient } from '@/shared/lib/api-client';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { get: vi.fn(), patch: vi.fn() },
}));

beforeEach(() => {
  vi.mocked(apiClient.get).mockReset();
  vi.mocked(apiClient.patch).mockReset();
});

describe('moderationApi.getPending', () => {
  it('requests the pending queue with pagination params', async () => {
    const data = { items: [], total: 0, page: 2, limit: 10 };
    vi.mocked(apiClient.get).mockResolvedValue({ data } as never);

    const result = await moderationApi.getPending({ page: 2, limit: 10 });

    expect(apiClient.get).toHaveBeenCalledWith('/admin/alfajores/pending', {
      params: { page: 2, limit: 10 },
    });
    expect(result).toEqual(data);
  });
});

describe('moderationApi.approve', () => {
  it('patches the approve endpoint and returns the alfajor', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: { id: 'a1', status: 'APPROVED' },
    } as never);

    const result = await moderationApi.approve('a1');

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/admin/alfajores/a1/approve',
    );
    expect(result).toEqual({ id: 'a1', status: 'APPROVED' });
  });
});

describe('moderationApi.reject', () => {
  it('patches the reject endpoint with the reason', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({
      data: { id: 'a1', status: 'REJECTED' },
    } as never);

    const result = await moderationApi.reject('a1', 'Duplicado de otro');

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/admin/alfajores/a1/reject',
      { rejectionReason: 'Duplicado de otro' },
    );
    expect(result).toEqual({ id: 'a1', status: 'REJECTED' });
  });
});
