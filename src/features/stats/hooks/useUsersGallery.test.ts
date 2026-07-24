import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUsersGallery } from './useUsersGallery';
import { usersApi } from '@/features/users/api/users.api';
import type { PaginatedUserSearchResults } from '@/features/users/types/users.types';

vi.mock('@/features/users/api/users.api', () => ({
  usersApi: { search: vi.fn() },
}));

const PAGE: PaginatedUserSearchResults = {
  items: [{ id: 'u1', username: 'pulyg', avatarUrl: null, isFollowing: false }],
  total: 1,
  page: 1,
  limit: 100,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useUsersGallery', () => {
  beforeEach(() => {
    vi.mocked(usersApi.search).mockReset();
    vi.mocked(usersApi.search).mockResolvedValue(PAGE);
  });

  it('fetches a batch of users (no q) for the dome gallery', async () => {
    const { result } = renderHook(() => useUsersGallery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(PAGE));
    expect(usersApi.search).toHaveBeenCalledWith('', { limit: 100 });
  });
});
