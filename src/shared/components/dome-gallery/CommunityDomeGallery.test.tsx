import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommunityDomeGallery } from './CommunityDomeGallery';
import { useUsersGallery } from '@/features/stats/hooks/useUsersGallery';
import { useAlfajoresGallery } from '@/features/stats/hooks/useAlfajoresGallery';
import type { DomeImage } from './DomeGallery';

vi.mock('@/features/stats/hooks/useUsersGallery', () => ({
  useUsersGallery: vi.fn(),
}));
vi.mock('@/features/stats/hooks/useAlfajoresGallery', () => ({
  useAlfajoresGallery: vi.fn(),
}));
vi.mock('./DomeGallery', () => ({
  default: ({ images }: { images: DomeImage[] }) => (
    <ul>
      {images.map((img) => (
        <li key={img.src}>{img.alt}</li>
      ))}
    </ul>
  ),
}));

const users = vi.mocked(useUsersGallery);
const alfajores = vi.mocked(useAlfajoresGallery);

function loading() {
  return { isLoading: true, data: undefined } as never;
}
function loaded(data: unknown) {
  return { isLoading: false, data } as never;
}

describe('CommunityDomeGallery', () => {
  it('shows a loading state while either query is in flight', () => {
    users.mockReturnValue(loading());
    alfajores.mockReturnValue(loaded({ items: [] }));
    render(<CommunityDomeGallery />);

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('interleaves users and alfajores, skipping alfajores without image', () => {
    users.mockReturnValue(
      loaded({
        items: [
          {
            id: 'u1',
            username: 'pepe',
            avatarUrl: 'p.png',
            isFollowing: false,
          },
          { id: 'u2', username: 'ana', avatarUrl: null, isFollowing: false },
        ],
      }),
    );
    alfajores.mockReturnValue(
      loaded({
        items: [
          { id: 'a1', nombre: 'Águila', imagenUrl: 'a.png' },
          { id: 'a2', nombre: 'Sin foto', imagenUrl: null },
        ],
      }),
    );
    render(<CommunityDomeGallery />);

    const items = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toEqual(['pepe', 'Águila', 'ana']);
  });

  it('renders nothing when there are no images at all', () => {
    users.mockReturnValue(loaded({ items: [] }));
    alfajores.mockReturnValue(loaded({ items: [] }));
    const { container } = render(<CommunityDomeGallery />);

    expect(container).toBeEmptyDOMElement();
  });
});
