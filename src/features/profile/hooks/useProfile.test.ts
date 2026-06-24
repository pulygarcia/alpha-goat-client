import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProfile } from './useProfile';
import { profileApi } from '../api/profile.api';
import type { Profile } from '../types/profile.types';

vi.mock('../api/profile.api', () => ({
  profileApi: { getByUsername: vi.fn() },
}));

const PROFILE: Profile = {
  id: 'u1',
  username: 'puly',
  avatarUrl: null,
  role: 'USER',
  createdAt: '2026-01-01T00:00:00.000Z',
  followersCount: 3,
  followingCount: 2,
  reviewsCount: 5,
  isFollowing: false,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useProfile', () => {
  beforeEach(() => vi.mocked(profileApi.getByUsername).mockReset());

  it('fetches the profile by username', async () => {
    vi.mocked(profileApi.getByUsername).mockResolvedValue(PROFILE);

    const { result } = renderHook(() => useProfile('puly'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(PROFILE);
    expect(profileApi.getByUsername).toHaveBeenCalledWith('puly');
  });

  it('is disabled when no username is provided', () => {
    const { result } = renderHook(() => useProfile(''), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(profileApi.getByUsername).not.toHaveBeenCalled();
  });

  it('surfaces the error state when the request fails', async () => {
    vi.mocked(profileApi.getByUsername).mockRejectedValueOnce(
      new Error('boom'),
    );

    const { result } = renderHook(() => useProfile('ghost'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
