import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlfajorScoreBlock } from './AlfajorScoreBlock';

describe('AlfajorScoreBlock', () => {
  it('shows the average with one decimal and the review count', () => {
    render(
      <AlfajorScoreBlock
        avgRating={8.4}
        reviewsCount={127}
        onReview={vi.fn()}
      />,
    );
    expect(screen.getByText('8.4')).toBeInTheDocument();
    expect(screen.getByText('/ 10.0')).toBeInTheDocument();
    expect(screen.getByText('127 reseñas')).toBeInTheDocument();
  });

  it('uses the singular for a single review', () => {
    render(
      <AlfajorScoreBlock avgRating={9} reviewsCount={1} onReview={vi.fn()} />,
    );
    expect(screen.getByText('1 reseña')).toBeInTheDocument();
  });

  it('shows the unrated state when there is no average', () => {
    render(
      <AlfajorScoreBlock
        avgRating={null}
        reviewsCount={0}
        onReview={vi.fn()}
      />,
    );
    expect(screen.getByText('—.—')).toBeInTheDocument();
    expect(screen.getByText('todavía sin puntaje')).toBeInTheDocument();
  });

  it('calls onReview when the button is pressed', async () => {
    const onReview = vi.fn();
    render(
      <AlfajorScoreBlock
        avgRating={8.4}
        reviewsCount={2}
        onReview={onReview}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Reseñar' }));
    expect(onReview).toHaveBeenCalledOnce();
  });
});
