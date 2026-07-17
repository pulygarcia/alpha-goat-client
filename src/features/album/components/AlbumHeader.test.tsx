import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlbumHeader } from './AlbumHeader';

describe('AlbumHeader', () => {
  it('shows the owner handle and global progress', () => {
    render(
      <AlbumHeader
        owner={{ id: 'u1', username: 'pulyg', avatarUrl: null }}
        stats={{ collected: 29, total: 50, pct: 58 }}
        isOwnAlbum={false}
      />,
    );

    expect(screen.getByText('29/50')).toBeInTheDocument();
    expect(screen.getByText('58% completo')).toBeInTheDocument();
  });

  it('links the @handle to the owner profile', () => {
    render(
      <AlbumHeader
        owner={{ id: 'u1', username: 'pulyg', avatarUrl: null }}
        stats={{ collected: 29, total: 50, pct: 58 }}
        isOwnAlbum={false}
      />,
    );

    expect(screen.getByRole('link', { name: '@pulyg' })).toHaveAttribute(
      'href',
      '/u/pulyg',
    );
  });

  it('links the avatar to the owner profile', () => {
    render(
      <AlbumHeader
        owner={{ id: 'u1', username: 'pulyg', avatarUrl: null }}
        stats={{ collected: 29, total: 50, pct: 58 }}
        isOwnAlbum={false}
      />,
    );

    expect(screen.getByRole('link', { name: 'pulyg' })).toHaveAttribute(
      'href',
      '/u/pulyg',
    );
  });

  it('shows "Tu Álbum" when it belongs to the current user', () => {
    render(
      <AlbumHeader
        owner={{ id: 'u1', username: 'pulyg', avatarUrl: null }}
        stats={{ collected: 29, total: 50, pct: 58 }}
        isOwnAlbum
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Tu Álbum' }),
    ).toBeInTheDocument();
  });

  it('shows "Álbum" for someone else\'s album', () => {
    render(
      <AlbumHeader
        owner={{ id: 'u1', username: 'pulyg', avatarUrl: null }}
        stats={{ collected: 29, total: 50, pct: 58 }}
        isOwnAlbum={false}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Álbum' })).toBeInTheDocument();
  });
});
