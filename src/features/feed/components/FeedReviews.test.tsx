import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedReviews } from './FeedReviews';
import { useFeedReviews } from '../hooks/useFeedReviews';
import type { FeedItem } from '../types/feed.types';

vi.mock('../hooks/useFeedReviews', () => ({
  useFeedReviews: vi.fn(),
}));

// Evita renderizar Recharts en jsdom: el detalle visual de la fila no se testea.
vi.mock('./ReviewRow', () => ({
  ReviewRow: ({ item }: { item: FeedItem }) => <div>{item.alfajor.nombre}</div>,
}));

const mocked = vi.mocked(useFeedReviews);

function makeItem(id: string, nombre: string): FeedItem {
  return {
    id,
    author: { id: 'u1', username: 'pepe', avatarUrl: null, isFollowing: false },
    alfajor: { id: 'a1', nombre, tipo: 'CHOCOLATE', imagenUrl: null },
    marca: { id: 'm1', nombre: 'Havanna', provincia: 'CABA' },
    quote: null,
    photoUrl: null,
    overall: 8,
    axes: {
      dulzor: 8,
      cantidadDDL: 7,
      calidadBano: 9,
      ratioTapaRelleno: 6,
      textura: 8,
    },
    likes: 10,
    commentsCount: 2,
    createdAt: '2026-05-27T00:00:00.000Z',
  };
}

function baseReturn(over: Partial<ReturnType<typeof useFeedReviews>> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    ...over,
  } as unknown as ReturnType<typeof useFeedReviews>;
}

describe('FeedReviews', () => {
  beforeEach(() => mocked.mockReset());

  it('shows a loading message while fetching', () => {
    mocked.mockReturnValue(baseReturn({ isLoading: true }));
    render(<FeedReviews />);
    expect(screen.getByText(/cargando reseñas/i)).toBeInTheDocument();
  });

  it('shows an error message on failure', () => {
    mocked.mockReturnValue(baseReturn({ isError: true }));
    render(<FeedReviews />);
    expect(screen.getByText(/no pudimos contactar/i)).toBeInTheDocument();
  });

  it('shows an empty message when there are no items', () => {
    mocked.mockReturnValue(
      baseReturn({
        data: { pages: [{ items: [], total: 0, page: 1, limit: 20 }] } as never,
      }),
    );
    render(<FeedReviews />);
    expect(screen.getByText(/todavía no hay reseñas/i)).toBeInTheDocument();
  });

  it('renders one row per item across pages', () => {
    mocked.mockReturnValue(
      baseReturn({
        data: {
          pages: [
            { items: [makeItem('1', 'Jorgito')], total: 2, page: 1, limit: 20 },
            {
              items: [makeItem('2', 'Guaymallén')],
              total: 2,
              page: 2,
              limit: 20,
            },
          ],
        } as never,
      }),
    );
    render(<FeedReviews />);
    expect(screen.getByText('Jorgito')).toBeInTheDocument();
    expect(screen.getByText('Guaymallén')).toBeInTheDocument();
  });

  it('defaults to the "recent" sort and re-renders with the selected sort', () => {
    mocked.mockReturnValue(baseReturn({ data: { pages: [] } as never }));
    render(<FeedReviews />);

    expect(mocked).toHaveBeenLastCalledWith({ sort: 'recent', scope: 'today' });

    fireEvent.click(screen.getByText('Más likes'));
    expect(mocked).toHaveBeenLastCalledWith({ sort: 'likes', scope: 'today' });
  });

  it('calls fetchNextPage when "Cargar más" is clicked', () => {
    const fetchNextPage = vi.fn();
    mocked.mockReturnValue(
      baseReturn({
        data: {
          pages: [{ items: [], total: 50, page: 1, limit: 20 }],
        } as never,
        hasNextPage: true,
        fetchNextPage,
      }),
    );
    render(<FeedReviews />);

    fireEvent.click(screen.getByText('Cargar más'));
    expect(fetchNextPage).toHaveBeenCalled();
  });
});
