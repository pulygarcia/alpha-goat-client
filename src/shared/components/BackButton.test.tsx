import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackButton } from './BackButton';

describe('BackButton', () => {
  it('renders a link when given an href', () => {
    render(<BackButton href="/alfajores">Volver al catálogo</BackButton>);
    expect(
      screen.getByRole('link', { name: /volver al catálogo/i }),
    ).toHaveAttribute('href', '/alfajores');
  });

  it('renders a button that calls onClick when given no href', () => {
    const onClick = vi.fn();
    render(<BackButton onClick={onClick}>Atrás</BackButton>);

    fireEvent.click(screen.getByRole('button', { name: /atrás/i }));
    expect(onClick).toHaveBeenCalled();
  });
});
