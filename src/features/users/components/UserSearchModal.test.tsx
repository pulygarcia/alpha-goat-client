import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserSearchModal } from './UserSearchModal';
import { useUsersSearch } from '../hooks/useUsersSearch';
import { useSuggestedUsers } from '../hooks/useSuggestedUsers';
import type { UserSearchResult } from '../types/users.types';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('../hooks/useUsersSearch');
vi.mock('../hooks/useSuggestedUsers');
vi.mock('@/shared/hooks/useDebouncedValue', () => ({
  useDebouncedValue: (v: unknown) => v,
}));
vi.mock('@/features/follows/components/FollowButton', () => ({
  FollowButton: () => <button type="button">follow</button>,
}));

const PULYG: UserSearchResult = {
  id: 'u1',
  username: 'pulyg',
  avatarUrl: null,
  isFollowing: false,
};

function mockSearch(items: UserSearchResult[], isLoading = false) {
  vi.mocked(useUsersSearch).mockReturnValue({
    data: items,
    isLoading,
  } as never);
}

describe('UserSearchModal', () => {
  beforeEach(() => {
    push.mockReset();
    vi.mocked(useUsersSearch).mockReset();
    mockSearch([]);
    vi.mocked(useSuggestedUsers).mockReturnValue({
      data: [],
    } as never);
  });

  it('prompts to type when the query is empty', () => {
    render(<UserSearchModal open onOpenChange={vi.fn()} />);

    expect(
      screen.getByText('Escribí un nombre de usuario para buscar.'),
    ).toBeInTheDocument();
  });

  it('shows a loading state while searching', async () => {
    mockSearch([], true);
    render(<UserSearchModal open onOpenChange={vi.fn()} />);

    await userEvent.type(
      screen.getByPlaceholderText('Buscá por nombre de usuario'),
      'puly',
    );

    expect(screen.getByText('Buscando...')).toBeInTheDocument();
  });

  it('shows an empty state when there are no matches', async () => {
    mockSearch([]);
    render(<UserSearchModal open onOpenChange={vi.fn()} />);

    await userEvent.type(
      screen.getByPlaceholderText('Buscá por nombre de usuario'),
      'nadie',
    );

    expect(screen.getByText('No encontramos “nadie”.')).toBeInTheDocument();
  });

  it('lists matches and navigates to the profile on click, closing the modal', async () => {
    mockSearch([PULYG]);
    const onOpenChange = vi.fn();
    render(<UserSearchModal open onOpenChange={onOpenChange} />);

    await userEvent.type(
      screen.getByPlaceholderText('Buscá por nombre de usuario'),
      'puly',
    );
    await userEvent.click(screen.getByText('pulyg'));

    expect(push).toHaveBeenCalledWith('/u/pulyg');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows suggested users when the query is empty', () => {
    vi.mocked(useSuggestedUsers).mockReturnValue({
      data: [PULYG],
    } as never);
    render(<UserSearchModal open onOpenChange={vi.fn()} />);

    expect(screen.getByText('Sugeridos')).toBeInTheDocument();
    expect(screen.getByText('pulyg')).toBeInTheDocument();
  });

  it('renders a FollowButton per result', async () => {
    mockSearch([PULYG]);
    render(<UserSearchModal open onOpenChange={vi.fn()} />);

    await userEvent.type(
      screen.getByPlaceholderText('Buscá por nombre de usuario'),
      'puly',
    );

    expect(screen.getByText('follow')).toBeInTheDocument();
  });
});
