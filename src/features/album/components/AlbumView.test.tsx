import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlbumView } from './AlbumView';
import { useAlbum } from '../hooks/useAlbum';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import type { AlbumResponse } from '../types/album.types';

vi.mock('../hooks/useAlbum');
vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}));

const replace = vi.fn();
let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/u/pulyg/album',
  useSearchParams: () => searchParams,
}));

const ALBUM: AlbumResponse = {
  owner: { id: 'u1', username: 'pulyg', avatarUrl: null },
  stats: { collected: 3, total: 5, pct: 60 },
  hojas: [
    {
      marca: { id: 'm1', nombre: 'Águila', provincia: 'Córdoba' },
      stats: { collected: 2, total: 2, pct: 100 },
      alfajores: [
        { id: 'a1', nombre: 'Clásico', tipo: 'Chocolate', imagenUrl: null, avgRating: 4.5, collected: true, myRating: 8, reviewId: 'r1' },
        { id: 'a2', nombre: 'Blanco', tipo: 'Chocolate blanco', imagenUrl: null, avgRating: 4.2, collected: true, myRating: 7, reviewId: 'r2' },
      ],
    },
    {
      marca: { id: 'm2', nombre: 'Havanna', provincia: 'CABA' },
      stats: { collected: 1, total: 3, pct: 33 },
      alfajores: [
        { id: 'a3', nombre: 'Cacao', tipo: 'Chocolate', imagenUrl: null, avgRating: 4.6, collected: true, myRating: 9, reviewId: 'r3' },
        { id: 'a4', nombre: 'Merengue', tipo: 'Merengue', imagenUrl: null, avgRating: null, collected: false, myRating: null, reviewId: null },
        { id: 'a5', nombre: 'Ítalo', tipo: 'Chocolate', imagenUrl: null, avgRating: null, collected: false, myRating: null, reviewId: null },
      ],
    },
  ],
};

describe('AlbumView', () => {
  beforeEach(() => {
    replace.mockReset();
    searchParams = new URLSearchParams();
    vi.mocked(useAlbum).mockReturnValue({
      data: ALBUM,
      isLoading: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useCurrentUser).mockReturnValue({
      data: null,
    } as ReturnType<typeof useCurrentUser>);
  });

  it('renders the first hoja by default', () => {
    render(<AlbumView username="pulyg" />);

    expect(screen.getByRole('heading', { name: 'Águila' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Havanna' })).not.toBeInTheDocument();
  });

  it('opens the hoja from ?marca= when present', () => {
    searchParams = new URLSearchParams('marca=m2');

    render(<AlbumView username="pulyg" />);

    expect(screen.getByRole('heading', { name: 'Havanna' })).toBeInTheDocument();
  });

  it('switches hoja and syncs the URL when a pill is clicked', async () => {
    render(<AlbumView username="pulyg" />);

    // MarcaIndex pill and HojaPager's next button both match /Havanna/;
    // the pill is the first match in DOM order.
    await userEvent.click(screen.getAllByRole('button', { name: /Havanna/ })[0]!);

    expect(screen.getByRole('heading', { name: 'Havanna' })).toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith('/u/pulyg/album?marca=m2', { scroll: false });
  });

  it('resyncs the active hoja when ?marca= changes externally (browser back/forward)', () => {
    const { rerender } = render(<AlbumView username="pulyg" />);

    expect(screen.getByRole('heading', { name: 'Águila' })).toBeInTheDocument();

    // Simulate browser back/forward: the URL changes without any click.
    searchParams = new URLSearchParams('marca=m2');
    rerender(<AlbumView username="pulyg" />);

    expect(screen.getByRole('heading', { name: 'Havanna' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Águila' })).not.toBeInTheDocument();
  });

  it('shows the skeleton while loading', () => {
    vi.mocked(useAlbum).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as never);

    render(<AlbumView username="pulyg" />);

    expect(screen.getByTestId('album-skeleton')).toBeInTheDocument();
  });

  it('shows a not-found message on a 404 error', () => {
    vi.mocked(useAlbum).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { response: { status: 404 } },
    } as never);

    render(<AlbumView username="ghost" />);

    expect(screen.getByText(/no encontramos a este usuario/i)).toBeInTheDocument();
  });

  it('shows a retry message on a non-404 error', () => {
    vi.mocked(useAlbum).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { response: { status: 500 } },
    } as never);

    render(<AlbumView username="pulyg" />);

    expect(screen.getByText(/no pudimos cargar el álbum/i)).toBeInTheDocument();
  });

  it('shows an empty state when the catalog has no hojas', () => {
    vi.mocked(useAlbum).mockReturnValue({
      data: { owner: ALBUM.owner, stats: { collected: 0, total: 0, pct: 0 }, hojas: [] },
      isLoading: false,
      isError: false,
      error: null,
    } as never);

    render(<AlbumView username="pulyg" />);

    expect(screen.getByText(/todavía no hay alfajores en el catálogo/i)).toBeInTheDocument();
  });
});
