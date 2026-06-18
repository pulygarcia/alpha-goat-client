import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentForm } from './CommentForm';
import { useCreateComment } from '../hooks/useCreateComment';
import { useRequireAuth } from '@/shared/hooks/useRequireAuth';

vi.mock('../hooks/useCreateComment', () => ({ useCreateComment: vi.fn() }));
vi.mock('@/shared/hooks/useRequireAuth', () => ({ useRequireAuth: vi.fn() }));

const mockedCreate = vi.mocked(useCreateComment);
const mockedRequireAuth = vi.mocked(useRequireAuth);

function setRequireAuth(authed = true) {
  mockedRequireAuth.mockReturnValue((action: () => void) => {
    if (authed) action();
  });
}

function setCreate(over: Partial<ReturnType<typeof useCreateComment>> = {}) {
  const mutate = vi.fn();
  mockedCreate.mockReturnValue({
    mutate,
    isPending: false,
    ...over,
  } as unknown as ReturnType<typeof useCreateComment>);
  return mutate;
}

async function type(value: string) {
  fireEvent.change(screen.getByLabelText('Comentario'), { target: { value } });
}

describe('CommentForm', () => {
  beforeEach(() => {
    mockedCreate.mockReset();
    mockedRequireAuth.mockReset();
    setRequireAuth();
  });

  it('disables submit while the field is empty', () => {
    setCreate();
    render(<CommentForm reviewId="r1" />);
    expect(screen.getByRole('button', { name: /comentar/i })).toBeDisabled();
  });

  it('submits the comment content when valid', async () => {
    const mutate = setCreate();
    render(<CommentForm reviewId="r1" />);

    await type('qué rico');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /comentar/i })).toBeEnabled(),
    );
    fireEvent.submit(screen.getByLabelText('Comentario').closest('form')!);

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        { contenido: 'qué rico' },
        expect.anything(),
      ),
    );
  });

  it('does not submit for an anonymous user', async () => {
    const mutate = setCreate();
    setRequireAuth(false);
    render(<CommentForm reviewId="r1" />);

    await type('qué rico');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /comentar/i })).toBeEnabled(),
    );
    fireEvent.submit(screen.getByLabelText('Comentario').closest('form')!);

    await waitFor(() => expect(mutate).not.toHaveBeenCalled());
  });

  it('shows a validation error for a whitespace-only comment', async () => {
    setCreate();
    render(<CommentForm reviewId="r1" />);

    await type('   ');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /escribí un comentario/i,
    );
  });
});
