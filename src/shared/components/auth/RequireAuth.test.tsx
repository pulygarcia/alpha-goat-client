import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RequireAuth } from './RequireAuth';

const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => '/perfil',
}));

const authState = {
  user: null as unknown,
  isAuthenticated: false,
  isLoading: false,
  logout: vi.fn(),
};

vi.mock('@/shared/providers/AuthProvider', () => ({
  useAuth: () => authState,
}));

describe('RequireAuth', () => {
  beforeEach(() => {
    replaceMock.mockReset();
    authState.user = null;
    authState.isAuthenticated = false;
    authState.isLoading = false;
  });

  it('renders children when authenticated', () => {
    authState.isAuthenticated = true;
    render(
      <RequireAuth>
        <div>secret</div>
      </RequireAuth>,
    );
    expect(screen.getByText('secret')).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('redirects to /login with next param when not authenticated', async () => {
    render(
      <RequireAuth fallback={<div>loading</div>}>
        <div>secret</div>
      </RequireAuth>,
    );
    expect(screen.getByText('loading')).toBeInTheDocument();
    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith('/login?next=%2Fperfil'),
    );
  });

  it('shows fallback while loading and does not redirect', () => {
    authState.isLoading = true;
    render(
      <RequireAuth fallback={<div>loading</div>}>
        <div>secret</div>
      </RequireAuth>,
    );
    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
