import { describe, it, expect, vi, beforeEach } from 'vitest';
import { marcasApi } from './marcas.api';
import { apiClient } from '@/shared/lib/api-client';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { get: vi.fn() },
}));

describe('marcasApi.search', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { items: [{ id: 'm1', nombre: 'Havanna' }], total: 1 },
    } as never);
  });

  it('gets /marcas with the query and returns the paginated items', async () => {
    const result = await marcasApi.search('hava');

    expect(apiClient.get).toHaveBeenCalledWith('/marcas', {
      params: { q: 'hava' },
    });
    expect(result.items).toEqual([{ id: 'm1', nombre: 'Havanna' }]);
  });
});
