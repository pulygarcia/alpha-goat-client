import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlfajorReviewCard } from './AlfajorReviewCard';
import type { ReviewCardVM } from '../lib/reviewCardVM';

vi.mock('./LikeButton', () => ({
  LikeButton: ({ likes }: { likes: number }) => (
    <button type="button">{likes}</button>
  ),
}));
vi.mock('./ReviewDetailModal', () => ({ ReviewDetailModal: () => null }));

const VM: ReviewCardVM = {
  id: 'r1',
  author: {
    id: 'u1',
    username: 'martu.ba',
    avatarUrl: null,
    isFollowing: false,
  },
  alfajor: null,
  marca: null,
  quote: 'La cobertura es gruesa y el bizcochuelo se mantiene húmedo.',
  photoUrl: null,
  overall: 9,
  axes: {
    dulzor: 7,
    cantidadDDL: 9,
    calidadBano: 8,
    ratioTapaRelleno: 7,
    textura: 8,
  },
  likes: 24,
  isLiked: false,
  commentsCount: 3,
  createdAt: '2026-07-14T12:00:00.000Z',
};

describe('AlfajorReviewCard', () => {
  it('renders the author, the score and the comment', () => {
    render(<AlfajorReviewCard vm={VM} />);
    expect(screen.getByText('@martu.ba')).toBeInTheDocument();
    expect(screen.getByTestId('review-overall')).toHaveTextContent('9.0');
    expect(screen.getByText(/La cobertura es gruesa/)).toBeInTheDocument();
  });

  it('renders the five axes with their values', () => {
    render(<AlfajorReviewCard vm={VM} />);
    expect(screen.getByText('Dulzor')).toBeInTheDocument();
    expect(screen.getByText('DDL')).toBeInTheDocument();
    expect(screen.getByText('Baño')).toBeInTheDocument();
    expect(screen.getByText('Tapa/rell.')).toBeInTheDocument();
    expect(screen.getByText('Textura')).toBeInTheDocument();
    expect(screen.getByTestId('axis-fill-cantidadDDL')).toHaveStyle({
      width: '90%',
    });
  });

  it('shows the no-comment line instead of an empty quote', () => {
    render(<AlfajorReviewCard vm={{ ...VM, quote: null }} />);
    expect(screen.getByText('Cató sin dejar comentario')).toBeInTheDocument();
  });

  it('renders the review photo only when there is one', () => {
    const { rerender } = render(<AlfajorReviewCard vm={VM} />);
    expect(screen.queryByAltText('Foto de la reseña')).not.toBeInTheDocument();
    rerender(<AlfajorReviewCard vm={{ ...VM, photoUrl: 'https://x/p.jpg' }} />);
    expect(screen.getByAltText('Foto de la reseña')).toBeInTheDocument();
  });

  it('pluralises the comment counter', () => {
    const { rerender } = render(<AlfajorReviewCard vm={VM} />);
    expect(screen.getByText('3 comentarios')).toBeInTheDocument();
    rerender(<AlfajorReviewCard vm={{ ...VM, commentsCount: 1 }} />);
    expect(screen.getByText('1 comentario')).toBeInTheDocument();
    rerender(<AlfajorReviewCard vm={{ ...VM, commentsCount: 0 }} />);
    expect(screen.getByText('Sin comentarios')).toBeInTheDocument();
  });

  it('links the author to their profile', () => {
    render(<AlfajorReviewCard vm={VM} />);
    expect(screen.getByRole('link', { name: '@martu.ba' })).toHaveAttribute(
      'href',
      '/u/martu.ba',
    );
  });
});
