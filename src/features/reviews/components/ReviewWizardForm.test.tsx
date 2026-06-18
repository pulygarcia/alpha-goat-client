import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewWizardForm } from './ReviewWizardForm';
import { useMyAlfajorReview } from '../hooks/useMyAlfajorReview';
import { useSubmitReview } from '../hooks/useSubmitReview';
import type { Review } from '../types/reviews.types';
import type { Alfajor } from '@/features/alfajores/types/alfajores.types';

vi.mock('../hooks/useMyAlfajorReview', () => ({ useMyAlfajorReview: vi.fn() }));
vi.mock('../hooks/useSubmitReview', () => ({ useSubmitReview: vi.fn() }));

const myReview = vi.mocked(useMyAlfajorReview);
const submit = vi.mocked(useSubmitReview);

const ALFAJOR = {
  id: 'a1',
  nombre: 'Jorgito',
  marca: { id: 'm1', nombre: 'Jorgito', provincia: null, logoUrl: null },
} as Alfajor;

const MINE = {
  id: 'r1',
  alfajorId: 'a1',
  ratingGeneral: 8,
  dulzor: 7,
  cantidadDDL: 9,
  calidadBano: 8,
  ratioTapaRelleno: 6,
  textura: 8,
  comentario: 'rico',
} as Review;

function mockMyReview(data: Review | null) {
  myReview.mockReturnValue({ data, isLoading: false } as never);
}
function mockSubmit(mutate = vi.fn()) {
  submit.mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
  } as never);
  return mutate;
}

describe('ReviewWizardForm', () => {
  beforeEach(() => {
    myReview.mockReset();
    submit.mockReset();
  });

  it('starts on the comment step', () => {
    mockMyReview(null);
    mockSubmit();
    render(<ReviewWizardForm alfajor={ALFAJOR} onDone={vi.fn()} />);
    expect(screen.getByLabelText(/tu reseña/i)).toBeInTheDocument();
  });

  it('advances to the ratings step and submits a create payload', async () => {
    mockMyReview(null);
    const mutate = mockSubmit();
    render(<ReviewWizardForm alfajor={ALFAJOR} onDone={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(screen.getByText('General')).toBeInTheDocument();

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
    render(<ReviewWizardForm alfajor={ALFAJOR} onDone={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => expect(mutate).toHaveBeenCalled());
    expect(mutate.mock.calls[0][0]).toMatchObject({
      mode: 'edit',
      reviewId: 'r1',
      input: { ratingGeneral: 8, comentario: 'rico' },
    });
  });
});
