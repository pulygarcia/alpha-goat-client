import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminGuard } from './AdminGuard';
import { useAuth } from '@/shared/providers/AuthProvider';
import { notFound } from 'next/navigation';

vi.mock('@/shared/providers/AuthProvider', () => ({
  useAuth: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

function mockAuth(value: {
  user: { role: string } | null;
  isLoading: boolean;
}) {
  vi.mocked(useAuth).mockReturnValue(value as never);
}

beforeEach(() => {
  vi.mocked(notFound).mockClear();
});

describe('AdminGuard', () => {
  it('shows a skeleton while the session resolves', () => {
    mockAuth({ user: null, isLoading: true });

    render(<AdminGuard>secret</AdminGuard>);

    expect(screen.getByTestId('admin-guard-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });

  it('renders children for an ADMIN user', () => {
    mockAuth({ user: { role: 'ADMIN' }, isLoading: false });

    render(<AdminGuard>secret</AdminGuard>);

    expect(screen.getByText('secret')).toBeInTheDocument();
    expect(notFound).not.toHaveBeenCalled();
  });

  it('triggers notFound for a regular user', () => {
    mockAuth({ user: { role: 'USER' }, isLoading: false });

    expect(() => render(<AdminGuard>secret</AdminGuard>)).toThrow(
      'NEXT_NOT_FOUND',
    );
    expect(notFound).toHaveBeenCalled();
  });

  it('triggers notFound for an anonymous visitor', () => {
    mockAuth({ user: null, isLoading: false });

    expect(() => render(<AdminGuard>secret</AdminGuard>)).toThrow(
      'NEXT_NOT_FOUND',
    );
  });
});
