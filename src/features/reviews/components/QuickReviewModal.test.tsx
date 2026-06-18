import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickReviewModal } from './QuickReviewModal';
import { useAlfajores } from '@/features/alfajores/hooks/useAlfajores';
import type { Alfajor } from '@/features/alfajores/types/alfajores.types';

vi.mock('@/features/alfajores/hooks/useAlfajores', () => ({
  useAlfajores: vi.fn(),
}));
vi.mock('@/shared/hooks/useDebouncedValue', () => ({
  useDebouncedValue: (v: unknown) => v,
}));
// Wizard mockeado: solo marca qué alfajor recibió.
vi.mock('./ReviewWizardForm', () => ({
  ReviewWizardForm: ({ alfajor }: { alfajor: Alfajor }) => (
    <div>wizard-{alfajor.id}</div>
  ),
}));

const mocked = vi.mocked(useAlfajores);

function makeAlfajor(id: string, nombre: string): Alfajor {
  return {
    id,
    nombre,
    marcaId: 'm1',
    marca: { id: 'm1', nombre: 'Havanna', provincia: 'CABA', logoUrl: null },
    tipo: 'CHOCOLATE',
    descripcion: null,
    imagenUrl: null,
    status: 'APPROVED',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function baseReturn(over: Partial<ReturnType<typeof useAlfajores>> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    ...over,
  } as never;
}

function pages(items: Alfajor[]) {
  return {
    pages: [{ items, total: items.length, page: 1, limit: 24 }],
  } as never;
}

describe('QuickReviewModal', () => {
  beforeEach(() => mocked.mockReset());

  it('shows the picker (search + add CTA) when open with no preselection', () => {
    mocked.mockReturnValue(baseReturn({ data: pages([]) }));
    render(<QuickReviewModal open onOpenChange={vi.fn()} />);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByText(/solicitá agregarlo/i)).toBeInTheDocument();
  });

  it('passes the search text to the alfajores query', () => {
    mocked.mockReturnValue(baseReturn({ data: pages([]) }));
    render(<QuickReviewModal open onOpenChange={vi.fn()} />);

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'jorg' },
    });
    expect(mocked).toHaveBeenLastCalledWith({ q: 'jorg' });
  });

  it('shows the review wizard after picking an alfajor', () => {
    mocked.mockReturnValue(
      baseReturn({ data: pages([makeAlfajor('a1', 'Jorgito')]) }),
    );
    render(<QuickReviewModal open onOpenChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /jorgito/i }));

    expect(screen.getByText('wizard-a1')).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('skips the picker and shows the wizard when an alfajor is preselected', () => {
    mocked.mockReturnValue(baseReturn({ data: pages([]) }));
    render(
      <QuickReviewModal
        open
        onOpenChange={vi.fn()}
        alfajor={makeAlfajor('a9', 'Guaymallén')}
      />,
    );

    expect(screen.getByText('wizard-a9')).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });
});
