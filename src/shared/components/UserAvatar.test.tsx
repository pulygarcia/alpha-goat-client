import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserAvatar, DEFAULT_AVATAR_SRC } from './UserAvatar';

describe('UserAvatar', () => {
  it('renders the user avatar when present', () => {
    render(<UserAvatar avatarUrl="https://cdn/x.png" username="pepe" />);
    expect(screen.getByRole('img', { name: 'pepe' })).toHaveAttribute(
      'src',
      'https://cdn/x.png',
    );
  });

  it('falls back to the cat image when there is no avatar', () => {
    render(<UserAvatar avatarUrl={null} username="pepe" />);
    expect(screen.getByRole('img', { name: 'pepe' })).toHaveAttribute(
      'src',
      DEFAULT_AVATAR_SRC,
    );
  });

  it('passes the className through to the image', () => {
    render(<UserAvatar avatarUrl={null} username="pepe" className="h-9 w-9" />);
    expect(screen.getByRole('img', { name: 'pepe' })).toHaveClass('h-9', 'w-9');
  });
});
