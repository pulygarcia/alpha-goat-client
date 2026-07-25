import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuggestedUsersGroup } from './SuggestedUsersGroup';
import type { UserSearchResult } from '../types/users.types';

function makeUsers(count: number): UserSearchResult[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `u${i}`,
    username: `user${i}`,
    avatarUrl: null,
    isFollowing: false,
  }));
}

describe('SuggestedUsersGroup', () => {
  it('apila hasta 5 avatares y colapsa el resto en el contador', () => {
    render(<SuggestedUsersGroup users={makeUsers(8)} onSelect={vi.fn()} />);

    // Los avatares se identifican por el alt de la imagen: en la pila el
    // username no se pinta como texto.
    expect(screen.getAllByRole('img')).toHaveLength(5);
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('no muestra contador cuando entran todos', () => {
    render(<SuggestedUsersGroup users={makeUsers(4)} onSelect={vi.fn()} />);

    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('navega al perfil al clickear un avatar', async () => {
    const onSelect = vi.fn();
    render(<SuggestedUsersGroup users={makeUsers(3)} onSelect={onSelect} />);

    await userEvent.click(screen.getByAltText('user1'));

    expect(onSelect).toHaveBeenCalledWith('user1');
  });

  it('el contador despliega la columna con todos y sus usernames', async () => {
    render(<SuggestedUsersGroup users={makeUsers(8)} onSelect={vi.fn()} />);

    await userEvent.click(screen.getByText('+3'));

    expect(screen.getAllByRole('img')).toHaveLength(8);
    expect(screen.queryByText('+3')).not.toBeInTheDocument();
    // Expandido cada fila muestra el username como texto.
    expect(screen.getByText('user7')).toBeInTheDocument();
  });

  it('muestra al pie el username del avatar apuntado', async () => {
    render(<SuggestedUsersGroup users={makeUsers(3)} onSelect={vi.fn()} />);

    await userEvent.hover(screen.getByAltText('user2'));
    expect(screen.getByText('user2')).toBeInTheDocument();

    await userEvent.unhover(screen.getByAltText('user2'));
    expect(screen.queryByText('user2')).not.toBeInTheDocument();
  });
});
