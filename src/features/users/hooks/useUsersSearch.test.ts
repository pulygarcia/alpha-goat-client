import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUsersSearch } from './useUsersSearch';
import { usersApi } from '../api/users.api';
import type { PaginatedUserSearchResults } from '../types/users.types';

vi.mock('../api/users.api', () => ({
  usersApi: { search: vi.fn() },
}));

const PAGE: PaginatedUserSearchResults = {
  items: [
    { id: 'u1', username: 'pulyg', avatarUrl: null, isFollowing: false },
  ],
  total: 1,
  page: 1,
  limit: 20,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useUsersSearch', () => {
  beforeEach(() => {
    vi.mocked(usersApi.search).mockReset();
    vi.mocked(usersApi.search).mockResolvedValue(PAGE);
  });

  it('returns the users for the given query', async () => {
    const { result } = renderHook(() => useUsersSearch('puly'), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(PAGE.items));
    expect(usersApi.search).toHaveBeenCalledWith('puly');
  });

  it('does not search when the query is empty (returns empty list)', async () => {
    const { result } = renderHook(() => useUsersSearch(''), { wrapper });

    expect(result.current.data).toEqual([]);
    expect(usersApi.search).not.toHaveBeenCalled();
  });
});
