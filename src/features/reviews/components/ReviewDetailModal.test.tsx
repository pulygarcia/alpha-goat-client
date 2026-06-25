import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewDetailModal } from './ReviewDetailModal';
import type { ReviewCardVM } from '../lib/reviewCardVM';

vi.mock('@/shared/providers/AuthProvider', () => ({
  useAuth: () => ({ user: { username: 'yo', avatarUrl: null } }),
}));
vi.mock('@/features/comments/components/CommentList', () => ({
  CommentList: ({ reviewId }: { reviewId: string }) => (
    <div>comment-list-{reviewId}</div>
  ),
}));
vi.mock('@/features/comments/components/CommentForm', () => ({
  CommentForm: ({ reviewId }: { reviewId: string }) => (
    <div>comment-form-{reviewId}</div>
  ),
}));
vi.mock('./LikeButton', () => ({
  LikeButton: ({
    reviewId,
    likes,
    isLiked,
  }: {
    reviewId: string;
    likes: number;
    isLiked: boolean;
  }) => (
    <div>
      like-button-{reviewId}-{likes}-{String(isLiked)}
    </div>
  ),
}));

const vm: ReviewCardVM = {
  id: 'r1',
  author: { id: 'u1', username: 'pepe', avatarUrl: null, isFollowing: false },
  alfajor: null,
  marca: null,
  quote: 'estaba muy rico',
  photoUrl: null,
  overall: 8.5,
  axes: {
    dulzor: 7,
    cantidadDDL: 9,
    calidadBano: 8,
    ratioTapaRelleno: 6,
    textura: 8,
  },
  likes: 0,
  isLiked: false,
  commentsCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function setup(over: Partial<ReviewCardVM> = {}) {
  render(
    <ReviewDetailModal vm={{ ...vm, ...over }} open onOpenChange={() => {}} />,
  );
}

describe('ReviewDetailModal', () => {
  it('shows the author and the overall rating', () => {
    setup();
    expect(screen.getByText('Pepe')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
  });

  it('lists the 5 axes with their labels and values', () => {
    setup();
    expect(screen.getByText('Dulzor')).toBeInTheDocument();
    expect(screen.getByText('Cantidad de DDL')).toBeInTheDocument();
    expect(screen.getByText('Calidad del baño')).toBeInTheDocument();
    expect(screen.getByText('Tapa / Relleno')).toBeInTheDocument();
    expect(screen.getByText('Textura')).toBeInTheDocument();
    // valor de un eje (cantidadDDL = 9)
    expect(screen.getByText('9.0')).toBeInTheDocument();
  });

  it('shows the comentario when present', () => {
    setup();
    expect(screen.getByText(/estaba muy rico/)).toBeInTheDocument();
  });

  it('mounts the comments thread (list + form) for the review', () => {
    setup();
    expect(screen.getByText('comment-list-r1')).toBeInTheDocument();
    expect(screen.getByText('comment-form-r1')).toBeInTheDocument();
  });

  it('renders the author avatar image when present', () => {
    setup({
      author: { ...vm.author, avatarUrl: 'pepe.png' },
    });
    expect(screen.getByRole('img', { name: 'pepe' })).toHaveAttribute(
      'src',
      'pepe.png',
    );
  });

  it('omits the comentario block when there is no quote', () => {
    setup({ quote: null });
    expect(screen.queryByText(/estaba muy rico/)).toBeNull();
  });

  it('links the alfajor when present (profile context)', () => {
    setup({
      alfajor: { id: 'al9', nombre: 'Jorgito', tipo: 'CHOCOLATE' },
      marca: { nombre: 'Jorgito', provincia: 'Córdoba' },
    });
    const link = screen.getByRole('link', { name: /jorgito/i });
    expect(link).toHaveAttribute('href', '/alfajores/al9');
  });

  it('omits the alfajor line when not present (alfajor detail)', () => {
    setup({ alfajor: null, marca: null });
    expect(screen.queryByRole('link', { name: /alfajor/i })).toBeNull();
  });

  it('renders the review photo when present', () => {
    setup({ photoUrl: 'foto.png' });
    expect(
      screen.getByRole('img', { name: /foto de la reseña/i }),
    ).toHaveAttribute('src', 'foto.png');
  });

  it('omits the photo when there is none', () => {
    setup({ photoUrl: null });
    expect(
      screen.queryByRole('img', { name: /foto de la reseña/i }),
    ).toBeNull();
  });

  it('renders an actionable like button wired to the review', () => {
    setup({ likes: 5, isLiked: true });
    expect(screen.getByText('like-button-r1-5-true')).toBeInTheDocument();
  });

  it('shows the comments count', () => {
    setup({ commentsCount: 3 });
    expect(screen.getByLabelText('3 comentarios')).toBeInTheDocument();
  });
});
