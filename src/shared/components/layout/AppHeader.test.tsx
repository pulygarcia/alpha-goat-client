import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppHeader, menuMotion } from './AppHeader';
import { DEFAULT_AVATAR_SRC } from '@/shared/components/UserAvatar';
import { useAuth } from '@/shared/providers/AuthProvider';
import { useRequireAuth } from '@/shared/hooks/useRequireAuth';
import { usePathname } from 'next/navigation';

vi.mock('@/shared/providers/AuthProvider', () => ({
  useAuth: vi.fn(),
}));
vi.mock('@/shared/hooks/useRequireAuth', () => ({
  useRequireAuth: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));
// El modal trae dependencias pesadas (forms/query) ajenas a este test.
vi.mock('@/features/reviews/components/QuickReviewModal', () => ({
  QuickReviewModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="quick-review-modal" /> : null,
}));

const mockedAuth = vi.mocked(useAuth);
const mockedRequireAuth = vi.mocked(useRequireAuth);
const mockedPathname = vi.mocked(usePathname);

function setAuth(isAuthenticated: boolean, avatarUrl: string | null = null) {
  mockedAuth.mockReturnValue({
    user: isAuthenticated
      ? { username: 'puly', email: 'puly@test.com', avatarUrl }
      : null,
    isAuthenticated,
    logout: vi.fn(),
  } as unknown as ReturnType<typeof useAuth>);
}

// Por defecto el gate corre la acción (usuario autenticado).
function setRequireAuth(authed = true) {
  mockedRequireAuth.mockReturnValue((action: () => void) => {
    if (authed) action();
  });
}

describe('AppHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPathname.mockReturnValue('/feed');
    setAuth(false);
    setRequireAuth(true);
  });

  it('renders the logo and every nav item', () => {
    render(<AppHeader />);
    for (const label of ['Feed', 'Alfajores', 'Ranking', 'Marcas']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it('links the logo to the feed', () => {
    render(<AppHeader />);
    expect(screen.getByRole('link', { name: 'AlphaGoat' })).toHaveAttribute(
      'href',
      '/feed',
    );
  });

  it('no longer renders the removed "Mi huella" nav link or the search box', () => {
    render(<AppHeader />);
    expect(screen.queryByText('Mi huella')).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/buscar alfajor o marca/i),
    ).not.toBeInTheDocument();
  });

  it('shows the "Entrar" CTA and no avatar for an anonymous user', () => {
    render(<AppHeader />);
    expect(screen.getByText('Entrar')).toBeInTheDocument();
    expect(screen.queryByLabelText('Menú de usuario')).not.toBeInTheDocument();
  });

  it('shows the user avatar and no "Entrar" CTA when authenticated', () => {
    setAuth(true);
    render(<AppHeader />);
    expect(screen.getByLabelText('Menú de usuario')).toBeInTheDocument();
    expect(screen.queryByText('Entrar')).not.toBeInTheDocument();
  });

  it('shows the profile picture in the user menu when the user has an avatar', () => {
    setAuth(true, 'https://res.cloudinary.com/x/avatars/puly.jpg');
    render(<AppHeader />);

    const avatar = screen.getByAltText('puly');
    expect(avatar).toHaveAttribute(
      'src',
      'https://res.cloudinary.com/x/avatars/puly.jpg',
    );
  });

  it('falls back to the cat image when the user has no avatar', () => {
    setAuth(true, null);
    render(<AppHeader />);

    expect(screen.getByAltText('puly')).toHaveAttribute(
      'src',
      DEFAULT_AVATAR_SRC,
    );
  });

  it('does not open the review modal for an anonymous user (gated)', () => {
    setRequireAuth(false);
    render(<AppHeader />);
    fireEvent.click(screen.getByRole('button', { name: /Reseñar/i }));
    expect(screen.queryByTestId('quick-review-modal')).not.toBeInTheDocument();
  });

  it('opens the review modal when the gate passes', () => {
    render(<AppHeader />);
    fireEvent.click(screen.getByRole('button', { name: /Reseñar/i }));
    expect(screen.getByTestId('quick-review-modal')).toBeInTheDocument();
  });

  it('animates the drawer nav items by default and flat with reduced motion', () => {
    const normal = menuMotion(false);
    expect(normal.item.hidden).toMatchObject({ opacity: 0, x: -10 });
    expect(normal.container.show.transition.staggerChildren).toBeGreaterThan(0);

    const reduced = menuMotion(true);
    expect(reduced.item.hidden).toMatchObject({ opacity: 1 });
    expect(reduced.container.show.transition.staggerChildren).toBe(0);
    expect(reduced.item.show.transition.duration).toBe(0);
  });

  it('marks the matching nav item as active from the pathname', () => {
    mockedPathname.mockReturnValue('/alfajores');
    render(<AppHeader />);
    // El item activo lleva el texto "ink"; basta con que exista en la nav de desktop.
    const alfajoresLinks = screen.getAllByRole('link', { name: 'Alfajores' });
    expect(alfajoresLinks.some((el) => el.className.includes('text-ink'))).toBe(
      true,
    );
  });
});
