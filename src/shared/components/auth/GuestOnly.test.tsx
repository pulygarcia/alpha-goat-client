import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GuestOnly } from './GuestOnly';

const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

const authState = { user: null as unknown, isAuthenticated: false, isLoading: false, logout: vi.fn() };

vi.mock('@/shared/providers/AuthProvider', () => ({
  useAuth: () => authState,
}));

describe('GuestOnly', () => {
  beforeEach(() => {
    replaceMock.mockReset();
    authState.isAuthenticated = false;
    authState.isLoading = false;
  });

  it('renders children when not authenticated', () => {
    render(<GuestOnly><div>signup</div></GuestOnly>);
    expect(screen.getByText('signup')).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('redirects to /feed when already authenticated', async () => {
    authState.isAuthenticated = true;
    render(<GuestOnly><div>signup</div></GuestOnly>);
    expect(screen.queryByText('signup')).not.toBeInTheDocument();
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/feed'));
  });
});
