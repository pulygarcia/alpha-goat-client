import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewWizardForm } from './ReviewWizardForm';
import { useMyAlfajorReview } from '../hooks/useMyAlfajorReview';
import { useSubmitReview } from '../hooks/useSubmitReview';
import { useUploadReviewPhoto } from '../hooks/useUploadReviewPhoto';
import type { Review } from '../types/reviews.types';
import type { Alfajor } from '@/features/alfajores/types/alfajores.types';

vi.mock('../hooks/useMyAlfajorReview', () => ({ useMyAlfajorReview: vi.fn() }));
vi.mock('../hooks/useSubmitReview', () => ({ useSubmitReview: vi.fn() }));
vi.mock('../hooks/useUploadReviewPhoto', () => ({
  useUploadReviewPhoto: vi.fn(),
}));

const myReview = vi.mocked(useMyAlfajorReview);
const submit = vi.mocked(useSubmitReview);
const uploadPhoto = vi.mocked(useUploadReviewPhoto);

beforeAll(() => {
  // jsdom no implementa createObjectURL/revokeObjectURL.
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview');
  globalThis.URL.revokeObjectURL = vi.fn();
});

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

/** Submit cuyo `mutate` resuelve invocando `onSuccess` con la reseña dada. */
function mockSubmitSuccess(review: Partial<Review>) {
  const mutate = vi.fn(
    (_payload, opts?: { onSuccess?: (data: Review) => void }) =>
      opts?.onSuccess?.(review as Review),
  );
  return mockSubmit(mutate);
}

function mockUpload(mutate = vi.fn()) {
  uploadPhoto.mockReturnValue({ mutate, isPending: false } as never);
  return mutate;
}

function pickPhoto(file: File) {
  const input = screen.getByLabelText(/foto de la reseña/i);
  fireEvent.change(input, { target: { files: [file] } });
}

describe('ReviewWizardForm', () => {
  beforeEach(() => {
    myReview.mockReset();
    submit.mockReset();
    uploadPhoto.mockReset();
    mockUpload();
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

  it('uploads the picked photo with the created review id after publishing', async () => {
    mockMyReview(null);
    mockSubmitSuccess({ id: 'r1' });
    const upload = mockUpload();
    const onDone = vi.fn();
    render(<ReviewWizardForm alfajor={ALFAJOR} onDone={onDone} />);

    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    const file = new File(['x'], 'foto.png', { type: 'image/png' });
    pickPhoto(file);
    fireEvent.click(screen.getByRole('button', { name: /publicar/i }));

    await waitFor(() => expect(upload).toHaveBeenCalled());
    expect(upload.mock.calls[0][0]).toEqual({ reviewId: 'r1', file });
  });

  it('publishes without uploading when no photo is picked', async () => {
    mockMyReview(null);
    mockSubmitSuccess({ id: 'r1' });
    const upload = mockUpload();
    const onDone = vi.fn();
    render(<ReviewWizardForm alfajor={ALFAJOR} onDone={onDone} />);

    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    fireEvent.click(screen.getByRole('button', { name: /publicar/i }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(upload).not.toHaveBeenCalled();
  });

  it('rejects an invalid file and does not upload it', async () => {
    mockMyReview(null);
    mockSubmitSuccess({ id: 'r1' });
    const upload = mockUpload();
    render(<ReviewWizardForm alfajor={ALFAJOR} onDone={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    const bad = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    pickPhoto(bad);

    expect(screen.getByText(/formato no válido/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /publicar/i }));
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: /publicar/i }),
      ).toBeInTheDocument(),
    );
    expect(upload).not.toHaveBeenCalled();
  });

  it('clears the picked photo and shows the picker again', () => {
    mockMyReview(null);
    mockSubmit();
    render(<ReviewWizardForm alfajor={ALFAJOR} onDone={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    pickPhoto(new File(['x'], 'foto.png', { type: 'image/png' }));
    expect(screen.getByAltText(/vista previa/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /quitar foto/i }));
    expect(screen.queryByAltText(/vista previa/i)).not.toBeInTheDocument();
    expect(screen.getByText(/subí una foto del alfajor/i)).toBeInTheDocument();
  });

  it('ignores an empty file selection', () => {
    mockMyReview(null);
    mockSubmit();
    render(<ReviewWizardForm alfajor={ALFAJOR} onDone={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    const input = screen.getByLabelText(/foto de la reseña/i);
    fireEvent.change(input, { target: { files: [] } });

    expect(screen.queryByAltText(/vista previa/i)).not.toBeInTheDocument();
  });
});
