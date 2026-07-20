import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usersApi } from './users.api';
import { apiClient } from '@/shared/lib/api-client';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { get: vi.fn() },
}));

describe('usersApi.search', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        items: [
          { id: 'u1', username: 'pulyg', avatarUrl: null, isFollowing: false },
        ],
        total: 1,
        page: 1,
        limit: 20,
      },
    } as never);
  });

  it('gets /users with the query and returns the paginated result', async () => {
    const result = await usersApi.search('puly');

    expect(apiClient.get).toHaveBeenCalledWith('/users', {
      params: { q: 'puly' },
    });
    expect(result.items).toEqual([
      { id: 'u1', username: 'pulyg', avatarUrl: null, isFollowing: false },
    ]);
  });
});
