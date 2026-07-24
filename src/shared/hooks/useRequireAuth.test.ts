import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRequireAuth } from './useRequireAuth';
import { useAuth } from '@/shared/providers/AuthProvider';

const pushMock = vi.fn();

let pathnameMock = '/feed';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock,
}));

vi.mock('@/shared/providers/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

describe('useRequireAuth', () => {
  beforeEach(() => {
    pushMock.mockReset();
    pathnameMock = '/feed';
  });

  it('runs the action when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as never);
    const action = vi.fn();

    const { result } = renderHook(() => useRequireAuth());
    result.current(action);

    expect(action).toHaveBeenCalledTimes(1);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('redirects to login with the current path as next when anonymous', () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false } as never);
    const action = vi.fn();

    const { result } = renderHook(() => useRequireAuth());
    result.current(action);

    expect(action).not.toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/login?next=%2Ffeed');
  });

  it('redirects to plain /login when there is no pathname', () => {
    pathnameMock = '';
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false } as never);
    const action = vi.fn();

    const { result } = renderHook(() => useRequireAuth());
    result.current(action);

    expect(pushMock).toHaveBeenCalledWith('/login');
  });
});
