import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecommendedForYou } from './RecommendedForYou';
import { useRecommendations } from '../hooks/useRecommendations';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { RecommendationItem } from '../types/recommendations.types';
import type { User } from '@/features/auth/types/auth.types';

vi.mock('../hooks/useRecommendations', () => ({
  useRecommendations: vi.fn(),
}));

const mocked = vi.mocked(useRecommendations);

const USER: User = {
  id: '1',
  email: 'a@b.com',
  username: 'a',
  avatarUrl: null,
  role: 'USER',
  createdAt: '2026-01-01T00:00:00.000Z',
};

function makeItem(over: Partial<RecommendationItem> = {}): RecommendationItem {
  return {
    id: 'a1',
    nombre: 'Havanna Mixto',
    tipo: 'CHOCOLATE',
    matchPct: 92,
    score: 8.9,
    marca: { id: 'm1', nombre: 'Havanna', logoUrl: null },
    ...over,
  };
}

function baseReturn(over: Partial<ReturnType<typeof useRecommendations>> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    ...over,
  } as unknown as ReturnType<typeof useRecommendations>;
}

describe('RecommendedForYou', () => {
  beforeEach(() => {
    mocked.mockReset();
    useAuthStore.setState({ user: USER });
  });

  it('renders a row per recommendation with name, marca and affinity', () => {
    mocked.mockReturnValue(
      baseReturn({
        data: [
          makeItem(),
          makeItem({
            id: 'a2',
            nombre: 'Guaymallén Negro',
            matchPct: 81,
            marca: { id: 'm2', nombre: 'Guaymallén', logoUrl: null },
          }),
        ],
      }),
    );
    render(<RecommendedForYou />);

    expect(screen.getByText('Havanna Mixto')).toBeInTheDocument();
    expect(screen.getByText('Havanna')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('Guaymallén Negro')).toBeInTheDocument();
    expect(screen.getByText('81%')).toBeInTheDocument();
  });

  it('omits the affinity figure on cold start (matchPct null)', () => {
    mocked.mockReturnValue(
      baseReturn({ data: [makeItem({ matchPct: null })] }),
    );
    render(<RecommendedForYou />);

    expect(screen.getByText('Havanna Mixto')).toBeInTheDocument();
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/null/i)).not.toBeInTheDocument();
  });

  it('shows an error message on failure', () => {
    mocked.mockReturnValue(baseReturn({ isError: true }));
    render(<RecommendedForYou />);
    expect(
      screen.getByText(/no pudimos cargar tus recomendaciones/i),
    ).toBeInTheDocument();
  });

  it('shows the empty state when there are no recommendations', () => {
    mocked.mockReturnValue(baseReturn({ data: [] }));
    render(<RecommendedForYou />);
    expect(screen.getByText(/reseñá algunos alfajores/i)).toBeInTheDocument();
  });

  it('renders nothing for a guest (no session)', () => {
    useAuthStore.setState({ user: null });
    mocked.mockReturnValue(baseReturn({ data: [makeItem()] }));
    const { container } = render(<RecommendedForYou />);
    expect(container).toBeEmptyDOMElement();
  });
});
