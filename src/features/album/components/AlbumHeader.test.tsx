import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlbumHeader } from './AlbumHeader';

describe('AlbumHeader', () => {
  it('shows the owner handle and global progress', () => {
    render(
      <AlbumHeader
        owner={{ id: 'u1', username: 'pulyg', avatarUrl: null }}
        stats={{ collected: 29, total: 50, pct: 58 }}
      />,
    );

    expect(screen.getByText('Álbum de @pulyg')).toBeInTheDocument();
    expect(screen.getByText('29/50')).toBeInTheDocument();
    expect(screen.getByText('58% completo')).toBeInTheDocument();
  });
});
