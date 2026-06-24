import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewCard } from './ReviewCard';
import type { ReviewCardVM } from '../lib/reviewCardVM';

vi.mock('@/features/follows/components/FollowButton', () => ({
  FollowButton: () => <button type="button">follow</button>,
}));
vi.mock('./LikeButton', () => ({
  LikeButton: () => <button type="button">like</button>,
}));
vi.mock('./ReviewDetailModal', () => ({
  ReviewDetailModal: ({ open }: { open: boolean }) =>
    open ? <div>detail-modal-open</div> : null,
}));

const feedVM: ReviewCardVM = {
  id: 'r1',
  author: { id: 'u1', username: 'pepe', avatarUrl: null, isFollowing: false },
  alfajor: { id: 'al1', nombre: 'Águila', tipo: 'CHOCOLATE' },
  marca: { nombre: 'Águila', provincia: 'Córdoba' },
  quote: 'muy rico',
  photoUrl: null,
  overall: 8.5,
  axes: {
    dulzor: 7,
    cantidadDDL: 9,
    calidadBano: 8,
    ratioTapaRelleno: 6,
    textura: 8,
  },
  likes: 2,
  isLiked: false,
  commentsCount: 3,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const alfajorVM: ReviewCardVM = { ...feedVM, alfajor: null, marca: null };

describe('ReviewCard', () => {
  it('renders author, overall rating and quote', () => {
    render(<ReviewCard vm={feedVM} context="feed" />);
    expect(screen.getByText('pepe')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText(/muy rico/)).toBeInTheDocument();
  });

  it('links the alfajor name in feed context', () => {
    render(<ReviewCard vm={feedVM} context="feed" />);
    const link = screen.getByRole('link', { name: 'Águila' });
    expect(link).toHaveAttribute('href', '/alfajores/al1');
  });

  it('links the author username to their profile', () => {
    render(<ReviewCard vm={feedVM} context="feed" />);
    const link = screen.getByRole('link', { name: 'pepe' });
    expect(link).toHaveAttribute('href', '/u/pepe');
  });

  it('hides the alfajor (redundant) in alfajor context', () => {
    render(<ReviewCard vm={alfajorVM} context="alfajor" />);
    expect(screen.queryByRole('link', { name: 'Águila' })).toBeNull();
  });

  it('opens the detail modal when the card is clicked', () => {
    render(<ReviewCard vm={feedVM} context="feed" />);
    expect(screen.queryByText('detail-modal-open')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /ver reseña/i }));
    expect(screen.getByText('detail-modal-open')).toBeInTheDocument();
  });

  it('does not open the modal when an inner action (like) is clicked', () => {
    render(<ReviewCard vm={feedVM} context="feed" />);
    fireEvent.click(screen.getByRole('button', { name: 'like' }));
    expect(screen.queryByText('detail-modal-open')).toBeNull();
  });

  it('opens the detail modal with the Enter key', () => {
    render(<ReviewCard vm={feedVM} context="feed" />);
    fireEvent.keyDown(screen.getByRole('button', { name: /ver reseña/i }), {
      key: 'Enter',
    });
    expect(screen.getByText('detail-modal-open')).toBeInTheDocument();
  });

  it('renders the alfajor photo when present in feed context', () => {
    render(
      <ReviewCard vm={{ ...feedVM, photoUrl: 'foto.png' }} context="feed" />,
    );
    expect(screen.getByRole('img', { name: 'Águila' })).toHaveAttribute(
      'src',
      'foto.png',
    );
  });

  it('renders the author avatar image when present', () => {
    render(
      <ReviewCard
        vm={{ ...feedVM, author: { ...feedVM.author, avatarUrl: 'a.png' } }}
        context="feed"
      />,
    );
    expect(screen.getByRole('img', { name: 'pepe' })).toHaveAttribute(
      'src',
      'a.png',
    );
  });
});
