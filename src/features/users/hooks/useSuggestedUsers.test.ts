import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSuggestedUsers } from './useSuggestedUsers';
import { usersApi } from '../api/users.api';
import type { PaginatedUserSearchResults } from '../types/users.types';

vi.mock('../api/users.api', () => ({
  usersApi: { search: vi.fn() },
}));

const PAGE: PaginatedUserSearchResults = {
  items: [{ id: 'u1', username: 'pulyg', avatarUrl: null, isFollowing: false }],
  total: 1,
  page: 1,
  limit: 6,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useSuggestedUsers', () => {
  beforeEach(() => {
    vi.mocked(usersApi.search).mockReset();
    vi.mocked(usersApi.search).mockResolvedValue(PAGE);
  });

  it('fetches up to 6 suggested users when enabled', async () => {
    const { result } = renderHook(() => useSuggestedUsers(true), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(PAGE.items));
    expect(usersApi.search).toHaveBeenCalledWith('', { limit: 6 });
  });

  it('does not fetch when disabled', () => {
    renderHook(() => useSuggestedUsers(false), { wrapper });

    expect(usersApi.search).not.toHaveBeenCalled();
  });
});
