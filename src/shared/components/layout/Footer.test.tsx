import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('links the explore routes to real pages', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute(
      'href',
      '/feed',
    );
    expect(screen.getByRole('link', { name: 'Alfajores' })).toHaveAttribute(
      'href',
      '/alfajores',
    );
    expect(screen.getByRole('link', { name: 'Ranking' })).toHaveAttribute(
      'href',
      '/ranking',
    );
    expect(screen.getByRole('link', { name: 'Marcas' })).toHaveAttribute(
      'href',
      '/marcas',
    );
    expect(screen.getByRole('link', { name: 'Método' })).toHaveAttribute(
      'href',
      '/metodo',
    );
  });

  it('points the portfolio icon to the portfolio', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /portfolio/i })).toHaveAttribute(
      'href',
      'https://pp-v5.vercel.app',
    );
  });

  it('shows an error when subscribing with an invalid email', () => {
    render(<Footer />);
    fireEvent.change(screen.getByPlaceholderText(/ingresá tu email/i), {
      target: { value: 'not-an-email' },
    });
    fireEvent.submit(screen.getByRole('form', { name: /newsletter/i }));
    expect(screen.getByText(/email válido/i)).toBeInTheDocument();
  });

  it('confirms the subscription with a valid email', () => {
    render(<Footer />);
    fireEvent.change(screen.getByPlaceholderText(/ingresá tu email/i), {
      target: { value: 'puly@alfajores.com' },
    });
    fireEvent.submit(screen.getByRole('form', { name: /newsletter/i }));
    expect(screen.getByText(/te sumaste/i)).toBeInTheDocument();
  });

  it('shows only portfolio and linkedin, no social networks', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /instagram/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /tiktok/i })).toBeNull();
  });
});
