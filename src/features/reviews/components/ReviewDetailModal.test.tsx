import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ReviewDetailModal } from './ReviewDetailModal';
import { reviewsApi } from '../api/reviews.api';
import type { ReviewCardVM } from '../lib/reviewCardVM';

let mockUser: { id?: string; username: string; avatarUrl: string | null; role?: string } = {
  username: 'yo',
  avatarUrl: null,
};
vi.mock('@/shared/providers/AuthProvider', () => ({
  useAuth: () => ({ user: mockUser }),
}));
vi.mock('../api/reviews.api', () => ({
  reviewsApi: { remove: vi.fn() },
}));
vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
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

function setup(
  over: Partial<ReviewCardVM> = {},
  onOpenChange: (open: boolean) => void = () => {},
) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={qc}>
      <ReviewDetailModal
        vm={{ ...vm, ...over }}
        open
        onOpenChange={onOpenChange}
      />
    </QueryClientProvider>,
  );
}

describe('ReviewDetailModal', () => {
  beforeEach(() => {
    mockUser = { username: 'yo', avatarUrl: null };
    vi.clearAllMocks();
  });

  it('shows the author and the overall rating', async () => {
    setup();
    expect(screen.getByText('Pepe')).toBeInTheDocument();
    // El puntaje va dos veces: en la barra de contexto y en el encabezado.
    expect((await screen.findAllByText('8.5')).length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it('lists the 5 axes with their labels and values', () => {
    setup();
    expect(screen.getByTestId('axes-breakdown')).toBeInTheDocument();
    expect(screen.getByText('Dulzor')).toBeInTheDocument();
    expect(screen.getByText('Cantidad de DDL')).toBeInTheDocument();
    expect(screen.getByText('Calidad del baño')).toBeInTheDocument();
    expect(screen.getByText('Tapa / Relleno')).toBeInTheDocument();
    expect(screen.getByText('Textura')).toBeInTheDocument();

    expect(screen.getByTestId('axis-value-dulzor')).toHaveTextContent('7.0');
    expect(screen.getByTestId('axis-value-cantidadDDL')).toHaveTextContent(
      '9.0',
    );
    expect(screen.getByTestId('axis-value-calidadBano')).toHaveTextContent(
      '8.0',
    );
    expect(screen.getByTestId('axis-value-ratioTapaRelleno')).toHaveTextContent(
      '6.0',
    );
    expect(screen.getByTestId('axis-value-textura')).toHaveTextContent('8.0');
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
    // Aparece en la barra de contexto y en el encabezado.
    for (const img of screen.getAllByRole('img', { name: 'pepe' })) {
      expect(img).toHaveAttribute('src', 'pepe.png');
    }
  });

  it('links the author name and avatar to their profile', () => {
    setup();
    const toProfile = screen
      .getAllByRole('link')
      .filter((el) => el.getAttribute('href') === '/u/pepe');
    expect(toProfile.length).toBeGreaterThanOrEqual(2);
  });

  it('omits the comentario block when there is no quote', () => {
    setup({ quote: null });
    expect(screen.queryByText(/estaba muy rico/)).toBeNull();
  });

  it('links the alfajor when present (profile context)', () => {
    setup({
      alfajor: {
        id: 'al9',
        nombre: 'Jorgito',
        tipo: 'CHOCOLATE',
        imagenUrl: null,
      },
      marca: { nombre: 'Jorgito', provincia: 'Córdoba' },
    });
    const links = screen
      .getAllByRole('link')
      .filter((el) => el.getAttribute('href') === '/alfajores/al9');
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveTextContent(/jorgito/i);
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

  it('hides the delete action for someone who is neither author nor admin', () => {
    setup();
    expect(screen.queryByLabelText('Borrar reseña')).toBeNull();
  });

  it('shows the delete action for the author', () => {
    mockUser = { id: 'u1', username: 'pepe', avatarUrl: null };
    setup();
    expect(screen.getByLabelText('Borrar reseña')).toBeInTheDocument();
  });

  it('shows the delete action for an admin', () => {
    mockUser = { id: 'other', username: 'mod', avatarUrl: null, role: 'ADMIN' };
    setup();
    expect(screen.getByLabelText('Borrar reseña')).toBeInTheDocument();
  });

  it('asks to confirm inline before deleting, and "No" cancels', () => {
    mockUser = { id: 'u1', username: 'pepe', avatarUrl: null };
    setup();
    fireEvent.click(screen.getByLabelText('Borrar reseña'));
    expect(screen.getByText('¿Borrar?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('No'));
    expect(screen.queryByText('¿Borrar?')).toBeNull();
    expect(screen.getByLabelText('Borrar reseña')).toBeInTheDocument();
  });

  it('deletes the review and closes the modal on confirm', async () => {
    mockUser = { id: 'u1', username: 'pepe', avatarUrl: null };
    vi.mocked(reviewsApi.remove).mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    setup({}, onOpenChange);

    fireEvent.click(screen.getByLabelText('Borrar reseña'));
    fireEvent.click(screen.getByText('Sí'));

    await waitFor(() =>
      expect(reviewsApi.remove).toHaveBeenCalledWith('r1'),
    );
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});
