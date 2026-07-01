import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileAvatarModal } from './ProfileAvatarModal';

describe('ProfileAvatarModal', () => {
  it('renders the avatar as a clickable trigger', () => {
    render(<ProfileAvatarModal avatarUrl="puly.png" username="puly" />);
    expect(
      screen.getByRole('button', { name: /ver la foto de puly/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens a dialog with the enlarged photo when the avatar is clicked', () => {
    render(<ProfileAvatarModal avatarUrl="puly.png" username="puly" />);

    fireEvent.click(
      screen.getByRole('button', { name: /ver la foto de puly/i }),
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // trigger + imagen ampliada dentro del modal comparten el alt = username.
    expect(screen.getAllByAltText('puly').length).toBeGreaterThanOrEqual(2);
  });
});
