import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewForm } from './ReviewForm';
import { useMyAlfajorReview } from '../hooks/useMyAlfajorReview';
import { useSubmitReview } from '../hooks/useSubmitReview';
import type { Review } from '../types/reviews.types';

vi.mock('../hooks/useMyAlfajorReview', () => ({
  useMyAlfajorReview: vi.fn(),
}));
vi.mock('../hooks/useSubmitReview', () => ({ useSubmitReview: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const myReview = vi.mocked(useMyAlfajorReview);
const submit = vi.mocked(useSubmitReview);

const MINE = {
  id: 'r1',
  alfajorId: 'a1',
  userId: 'u1',
  author: null,
  ratingGeneral: 8,
  dulzor: 7,
  cantidadDDL: 9,
  calidadBano: 8,
  ratioTapaRelleno: 6,
  textura: 8,
  comentario: 'rico',
  fotoUrl: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as Review;

function mockMyReview(data: Review | null, isLoading = false) {
  myReview.mockReturnValue({ data, isLoading } as never);
}

function mockSubmit(mutate = vi.fn()) {
  submit.mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
    error: null,
  } as never);
  return mutate;
}

describe('ReviewForm', () => {
  beforeEach(() => {
    myReview.mockReset();
    submit.mockReset();
  });

  it('renders the six rating sliders and the comment field', () => {
    mockMyReview(null);
    mockSubmit();
    render(<ReviewForm alfajorId="a1" />);

    ['General', 'Dulzor', 'DDL', 'Baño', 'Tapa/Relleno', 'Textura'].forEach(
      (label) => expect(screen.getByText(label)).toBeInTheDocument(),
    );
    expect(screen.getByLabelText(/comentario/i)).toBeInTheDocument();
  });

  it('submits a create payload when the user has no review yet', async () => {
    mockMyReview(null);
    const mutate = mockSubmit();
    render(<ReviewForm alfajorId="a1" />);

    fireEvent.click(screen.getByRole('button', { name: /publicar/i }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    expect(mutate.mock.calls[0][0]).toMatchObject({
      mode: 'create',
      input: { alfajorId: 'a1', ratingGeneral: 5 },
    });
  });

  it('submits an edit payload prefilled from the existing review', async () => {
    mockMyReview(MINE);
    const mutate = mockSubmit();
    render(<ReviewForm alfajorId="a1" />);

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    expect(mutate.mock.calls[0][0]).toMatchObject({
      mode: 'edit',
      reviewId: 'r1',
      input: { ratingGeneral: 8, dulzor: 7, comentario: 'rico' },
    });
  });
});
