# Rediseño de `/alfajores/[id]` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la página de detalle del alfajor por el layout de dos columnas del mockup `AlfajorPage`: ficha lateral sticky con el puntaje promedio como protagonista y columna de reseñas con los 5 ejes de cata visibles en cada card.

**Architecture:** `AlfajorDetail` queda como orquestador: llama `useAlfajor` y `useAlfajorReviews` y compone dos columnas. Cada bloque del aside es un componente presentacional con props explícitas (score, ejes, ficha), y la columna derecha es un único `AlfajorReviewsPanel` dueño de sus cuatro estados. El card de reseña del mockup es un componente nuevo que consume el `ReviewCardVM` ya existente, sin tocar el `ReviewCard` compartido de feed y perfil.

**Tech Stack:** Next 16 (App Router), TypeScript strict, Tailwind v4, TanStack Query, Vitest + React Testing Library. Sin dependencias nuevas: las barras son divs, no hace falta Recharts.

## Global Constraints

- Spec de referencia: `docs/superpowers/specs/2026-07-27-alfajor-page-redesign-design.md`.
- Esta página usa la paleta blanca del mockup, **no** los tokens crema de la app. Los colores viven como CSS vars con scope en el contenedor raíz de la página; no se agregan tokens a `globals.css` ni se tocan otras páginas.
- Tipografías: solo las tres que el proyecto ya carga — `var(--font-archivo)`, Inter (default del body), `var(--font-mono)`.
- Sin dependencias nuevas.
- Server Components por defecto; `'use client'` solo en los componentes que usan hooks o eventos.
- Nunca llamar a la API desde un componente: siempre vía hook.
- Tests: cada componente con lógica tiene su `.test.tsx` hermano. Se mockean los hooks, nunca la red. Umbral de cobertura 85% en las 4 métricas.
- Commits en inglés, conventional commits, atómicos.
- Nada de emojis en código, comentarios ni mensajes de commit.
- Valores de la paleta (exactos):

| Var                | Valor     | Rol                    |
| ------------------ | --------- | ---------------------- |
| `--ap-bg`          | `#fff`    | fondo                  |
| `--ap-ink`         | `#2b1a10` | tinta                  |
| `--ap-ink-2`       | `#3c332b` | texto de cuerpo        |
| `--ap-muted`       | `#5d564e` | texto secundario       |
| `--ap-faint`       | `#8a837b` | eyebrow / terciario    |
| `--ap-faint-2`     | `#9b948b` | fechas / unidades      |
| `--ap-accent`      | `#b86015` | acento                 |
| `--ap-accent-dark` | `#4a3527` | acento oscuro (barras) |
| `--ap-hairline`    | `#eceae6` | separadores            |
| `--ap-border`      | `#ddd8d1` | bordes                 |
| `--ap-inert`       | `#efece7` | riel de barras         |
| `--ap-inert-2`     | `#f4f2ee` | superficie inerte      |

---

### Task 1: Tipo `AlfajorAvgEjes` y componente `AlfajorEjesAverage`

Las 5 barras de "Promedio por eje". El back todavía no manda el dato: el tipo es opcional y el componente renderiza barras grises sin número cuando falta.

**Files:**

- Modify: `src/features/alfajores/types/alfajores.types.ts`
- Create: `src/features/alfajores/components/AlfajorEjesAverage.tsx`
- Test: `src/features/alfajores/components/AlfajorEjesAverage.test.tsx`

**Interfaces:**

- Consumes: nada.
- Produces:
  - `interface AlfajorAvgEjes { dulzor: number; cantidadDDL: number; calidadBano: number; ratioTapaRelleno: number; textura: number }` exportado desde `alfajores.types.ts`.
  - Campo `avgEjes?: AlfajorAvgEjes | null` en `Alfajor`.
  - `function AlfajorEjesAverage({ avgEjes }: { avgEjes?: AlfajorAvgEjes | null }): JSX.Element`

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/alfajores/components/AlfajorEjesAverage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlfajorEjesAverage } from './AlfajorEjesAverage';

const EJES = {
  dulzor: 8.3,
  cantidadDDL: 8.8,
  calidadBano: 7.9,
  ratioTapaRelleno: 7.4,
  textura: 8.6,
};

describe('AlfajorEjesAverage', () => {
  it('renders every axis with its label and value', () => {
    render(<AlfajorEjesAverage avgEjes={EJES} />);
    expect(screen.getByText('Dulzor')).toBeInTheDocument();
    expect(screen.getByText('Dulce de leche')).toBeInTheDocument();
    expect(screen.getByText('Calidad del baño')).toBeInTheDocument();
    expect(screen.getByText('Tapa / relleno')).toBeInTheDocument();
    expect(screen.getByText('Textura')).toBeInTheDocument();
    expect(screen.getByText('8.3')).toBeInTheDocument();
    expect(screen.getByText('8.8')).toBeInTheDocument();
  });

  it('sizes each bar as a percentage of 10', () => {
    render(<AlfajorEjesAverage avgEjes={EJES} />);
    expect(screen.getByTestId('eje-fill-dulzor')).toHaveStyle({ width: '83%' });
    expect(screen.getByTestId('eje-fill-textura')).toHaveStyle({ width: '86%' });
  });

  it('renders the dimmed state with no values when avgEjes is missing', () => {
    render(<AlfajorEjesAverage avgEjes={null} />);
    expect(screen.getByText('Dulzor')).toBeInTheDocument();
    expect(screen.queryByTestId('eje-fill-dulzor')).not.toBeInTheDocument();
    expect(screen.getByTestId('ejes-average')).toHaveAttribute(
      'data-empty',
      'true',
    );
  });

  it('treats an absent prop the same as null', () => {
    render(<AlfajorEjesAverage />);
    expect(screen.getByTestId('ejes-average')).toHaveAttribute(
      'data-empty',
      'true',
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/features/alfajores/components/AlfajorEjesAverage.test.tsx`
Expected: FAIL — no se puede resolver `./AlfajorEjesAverage`.

- [ ] **Step 3: Add the type**

En `src/features/alfajores/types/alfajores.types.ts`, antes de `export interface Alfajor`:

```ts
/**
 * Promedio por eje del alfajor. Campo aditivo pendiente en el back (ver spec
 * 2026-07-27): mientras no lo mande, llega `undefined` y el bloque de barras
 * renderiza su estado apagado, indistinguible de un alfajor sin reseñas.
 */
export interface AlfajorAvgEjes {
  dulzor: number;
  cantidadDDL: number;
  calidadBano: number;
  ratioTapaRelleno: number;
  textura: number;
}
```

Y dentro de `interface Alfajor`, después de `imagenUrl`:

```ts
  /** Promedio general 0-10 (`GET /alfajores/:id`); null sin reseñas. */
  avgRating?: number | null;
  /** Promedio de los 5 ejes; ausente hasta que el back lo implemente. */
  avgEjes?: AlfajorAvgEjes | null;
```

- [ ] **Step 4: Write the component**

```tsx
// src/features/alfajores/components/AlfajorEjesAverage.tsx
import { Fragment } from 'react';
import type { AlfajorAvgEjes } from '../types/alfajores.types';

const EJES: { key: keyof AlfajorAvgEjes; label: string; strong: boolean }[] = [
  { key: 'dulzor', label: 'Dulzor', strong: true },
  { key: 'cantidadDDL', label: 'Dulce de leche', strong: true },
  { key: 'calidadBano', label: 'Calidad del baño', strong: false },
  { key: 'ratioTapaRelleno', label: 'Tapa / relleno', strong: false },
  { key: 'textura', label: 'Textura', strong: false },
];

/**
 * Promedio por eje del alfajor: 5 barras horizontales. Sin datos (el back
 * todavía no expone `avgEjes`, o el alfajor no tiene reseñas) muestra los
 * rieles vacíos y atenuados en vez de ocultar el bloque, para que la ficha no
 * cambie de alto al llegar la primera reseña.
 */
export function AlfajorEjesAverage({
  avgEjes,
}: {
  avgEjes?: AlfajorAvgEjes | null;
}) {
  const empty = !avgEjes;

  return (
    <div className="flex flex-col gap-3">
      <div
        className="text-[10px] tracking-[0.2em] uppercase"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--ap-faint)' }}
      >
        Promedio por eje
      </div>

      <div
        data-testid="ejes-average"
        data-empty={String(empty)}
        className="grid grid-cols-[104px_1fr_30px] items-center gap-x-3 gap-y-[10px] md:grid-cols-[132px_1fr_34px]"
        style={empty ? { opacity: 0.55 } : undefined}
      >
        {EJES.map(({ key, label, strong }) => (
          <Fragment key={key}>
            <span
              className="text-[13px]"
              style={{ color: 'var(--ap-ink-2)' }}
            >
              {label}
            </span>
            <div
              className="h-[10px] overflow-hidden rounded-[2px]"
              style={{ background: empty ? '#f1efeb' : 'var(--ap-inert)' }}
            >
              {avgEjes && (
                <i
                  data-testid={`eje-fill-${key}`}
                  className="block h-full"
                  style={{
                    width: `${avgEjes[key] * 10}%`,
                    background: strong
                      ? 'var(--ap-accent)'
                      : 'var(--ap-accent-dark)',
                  }}
                />
              )}
            </div>
            <span
              className="text-right text-[12px]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {avgEjes ? avgEjes[key].toFixed(1) : ''}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run src/features/alfajores/components/AlfajorEjesAverage.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/features/alfajores/types/alfajores.types.ts src/features/alfajores/components/AlfajorEjesAverage.tsx src/features/alfajores/components/AlfajorEjesAverage.test.tsx
git commit -m "feat(alfajores): add the per-axis average block"
```

---

### Task 2: `AlfajorScoreBlock`

El bloque del puntaje: score gigante, `/ 10.0`, conteo de reseñas y botón "Reseñar".

**Files:**

- Create: `src/features/alfajores/components/AlfajorScoreBlock.tsx`
- Test: `src/features/alfajores/components/AlfajorScoreBlock.test.tsx`

**Interfaces:**

- Consumes: nada.
- Produces: `function AlfajorScoreBlock({ avgRating, reviewsCount, onReview }: { avgRating?: number | null; reviewsCount: number; onReview: () => void }): JSX.Element`

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/alfajores/components/AlfajorScoreBlock.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlfajorScoreBlock } from './AlfajorScoreBlock';

describe('AlfajorScoreBlock', () => {
  it('shows the average with one decimal and the review count', () => {
    render(
      <AlfajorScoreBlock avgRating={8.4} reviewsCount={127} onReview={vi.fn()} />,
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
      <AlfajorScoreBlock avgRating={null} reviewsCount={0} onReview={vi.fn()} />,
    );
    expect(screen.getByText('—.—')).toBeInTheDocument();
    expect(screen.getByText('todavía sin puntaje')).toBeInTheDocument();
  });

  it('calls onReview when the button is pressed', async () => {
    const onReview = vi.fn();
    render(
      <AlfajorScoreBlock avgRating={8.4} reviewsCount={2} onReview={onReview} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Reseñar' }));
    expect(onReview).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/features/alfajores/components/AlfajorScoreBlock.test.tsx`
Expected: FAIL — no se puede resolver `./AlfajorScoreBlock`.

- [ ] **Step 3: Write the component**

```tsx
// src/features/alfajores/components/AlfajorScoreBlock.tsx
'use client';

/**
 * Puntaje promedio del alfajor, protagonista de la ficha. Sin reseñas muestra
 * el guion largo en gris y el conteo pasa a "todavía sin puntaje" en vez de
 * "0 reseñas", que se lee como un error de carga.
 */
export function AlfajorScoreBlock({
  avgRating,
  reviewsCount,
  onReview,
}: {
  avgRating?: number | null;
  reviewsCount: number;
  onReview: () => void;
}) {
  const rated = avgRating != null;
  const conteo = rated
    ? `${reviewsCount} ${reviewsCount === 1 ? 'reseña' : 'reseñas'}`
    : 'todavía sin puntaje';

  return (
    <div
      className="flex items-center gap-4 py-5"
      style={{
        borderTop: '1px solid var(--ap-hairline)',
        borderBottom: '1px solid var(--ap-hairline)',
      }}
    >
      <div
        className="text-[52px] md:text-[76px]"
        style={{
          fontFamily: 'var(--font-archivo)',
          lineHeight: 0.8,
          letterSpacing: '-0.05em',
          color: rated ? 'var(--ap-ink)' : '#d9d4cd',
        }}
      >
        {rated ? avgRating.toFixed(1) : '—.—'}
      </div>

      <div className="flex flex-col gap-1">
        <span
          className="text-[12px]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--ap-faint-2)' }}
        >
          / 10.0
        </span>
        <span
          className="text-[11px] tracking-[0.12em] uppercase"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--ap-faint)' }}
        >
          {conteo}
        </span>
      </div>

      <button
        type="button"
        onClick={onReview}
        className="ml-auto cursor-pointer rounded-[5px] px-[22px] py-[15px] text-[15px] font-semibold whitespace-nowrap transition-colors hover:brightness-125"
        style={{ background: 'var(--ap-ink)', color: '#f7f5f1' }}
      >
        Reseñar
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/features/alfajores/components/AlfajorScoreBlock.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/alfajores/components/AlfajorScoreBlock.tsx src/features/alfajores/components/AlfajorScoreBlock.test.tsx
git commit -m "feat(alfajores): add the average score block"
```

---

### Task 3: `AlfajorIdCard` y restyle del uploader

Foto + marca + título + pill de tipo. El slot de foto sigue siendo `AlfajorImageUploader` (conserva el gating de admin), que gana props opcionales de estilo en vez de duplicarse.

**Files:**

- Modify: `src/features/alfajores/components/AlfajorImageUploader.tsx`
- Create: `src/features/alfajores/components/AlfajorIdCard.tsx`
- Test: `src/features/alfajores/components/AlfajorIdCard.test.tsx`

**Interfaces:**

- Consumes: `Alfajor` de `../types/alfajores.types`.
- Produces:
  - `AlfajorImageUploader` acepta dos props nuevas opcionales: `slotClassName?: string` e `imageFit?: 'cover' | 'contain'` (defaults: el `SLOT_CLASS` actual y `'cover'`).
  - `function AlfajorIdCard({ alfajor }: { alfajor: Alfajor }): JSX.Element`

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/alfajores/components/AlfajorIdCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlfajorIdCard } from './AlfajorIdCard';
import type { Alfajor } from '../types/alfajores.types';

vi.mock('./AlfajorImageUploader', () => ({
  AlfajorImageUploader: () => <div data-testid="uploader" />,
}));

const ALFAJOR: Alfajor = {
  id: 'a1',
  nombre: 'Minitorta Águila Clásica',
  marcaId: 'm1',
  marca: { id: 'm1', nombre: 'Águila', provincia: 'Buenos Aires', logoUrl: null },
  tipo: 'CHOCOLATE',
  descripcion: null,
  imagenUrl: null,
  status: 'APPROVED',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('AlfajorIdCard', () => {
  it('renders name, brand, province and type', () => {
    render(<AlfajorIdCard alfajor={ALFAJOR} />);
    expect(
      screen.getByRole('heading', { name: 'Minitorta Águila Clásica' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Águila')).toBeInTheDocument();
    expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
    expect(screen.getByText('Chocolate')).toBeInTheDocument();
  });

  it('falls back when there is no brand', () => {
    render(<AlfajorIdCard alfajor={{ ...ALFAJOR, marca: null }} />);
    expect(screen.getByText('Marca desconocida')).toBeInTheDocument();
    expect(screen.queryByText('Buenos Aires')).not.toBeInTheDocument();
  });

  it('hides the province when the brand has none', () => {
    render(
      <AlfajorIdCard
        alfajor={{ ...ALFAJOR, marca: { ...ALFAJOR.marca!, provincia: null } }}
      />,
    );
    expect(screen.getByText('Águila')).toBeInTheDocument();
    expect(screen.queryByText('Buenos Aires')).not.toBeInTheDocument();
  });

  it('keeps the image uploader as the photo slot', () => {
    render(<AlfajorIdCard alfajor={ALFAJOR} />);
    expect(screen.getByTestId('uploader')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/features/alfajores/components/AlfajorIdCard.test.tsx`
Expected: FAIL — no se puede resolver `./AlfajorIdCard`.

- [ ] **Step 3: Add the styling props to the uploader**

En `AlfajorImageUploader.tsx`, reemplazar la firma y el uso de `SLOT_CLASS` / `className="object-cover"`:

```tsx
export function AlfajorImageUploader({
  alfajorId,
  imagenUrl,
  nombre,
  placeholder,
  slotClassName,
  imageFit = 'cover',
}: {
  alfajorId: string;
  imagenUrl: string | null;
  nombre: string;
  placeholder: string;
  /** Reemplaza el slot cuadrado por defecto (la ficha del detalle usa 433/500). */
  slotClassName?: string;
  imageFit?: 'cover' | 'contain';
}) {
```

Dentro del JSX:

```tsx
      <div className={slotClassName ?? SLOT_CLASS}>
```

y en el `<Image>`:

```tsx
            className={imageFit === 'contain' ? 'object-contain' : 'object-cover'}
```

El `div` externo `w-full max-w-[220px] md:max-w-none` se mantiene sin cambios.

- [ ] **Step 4: Write the component**

```tsx
// src/features/alfajores/components/AlfajorIdCard.tsx
import { AlfajorImageUploader } from './AlfajorImageUploader';
import type { Alfajor } from '../types/alfajores.types';

function tipoLabel(tipo: string) {
  return tipo.charAt(0) + tipo.slice(1).toLowerCase();
}

/** Ficha de identidad del alfajor: foto, marca, nombre y tipo. */
export function AlfajorIdCard({ alfajor }: { alfajor: Alfajor }) {
  const marca = alfajor.marca;
  const inicial = (marca?.nombre ?? alfajor.nombre).charAt(0).toUpperCase();

  return (
    <div className="flex flex-row items-start gap-[14px] md:gap-6 lg:flex-col lg:gap-[22px]">
      <AlfajorImageUploader
        alfajorId={alfajor.id}
        imagenUrl={alfajor.imagenUrl}
        nombre={alfajor.nombre}
        placeholder={tipoLabel(alfajor.tipo)}
        imageFit="contain"
        slotClassName="relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-[6px] md:h-auto md:aspect-[433/500] md:w-[200px] lg:w-full lg:max-w-[340px]"
      />

      <div className="flex min-w-0 flex-col gap-[10px]">
        <div className="flex flex-wrap items-center gap-[9px]">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px]"
            style={{
              fontFamily: 'var(--font-archivo)',
              background: 'var(--ap-ink)',
              color: '#fff',
            }}
          >
            {inicial}
          </span>
          <span
            className="text-[13px] font-semibold"
            style={{ color: 'var(--ap-ink)' }}
          >
            {marca?.nombre ?? 'Marca desconocida'}
          </span>
          {marca?.provincia && (
            <>
              <span style={{ color: '#c6c0b8' }}>·</span>
              <span className="text-[13px]" style={{ color: '#6f6a63' }}>
                {marca.provincia}
              </span>
            </>
          )}
        </div>

        <h1
          className="text-[23px] md:text-[38px]"
          style={{
            fontFamily: 'var(--font-archivo)',
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
            color: 'var(--ap-ink)',
          }}
        >
          {alfajor.nombre}
        </h1>

        <span
          className="self-start rounded-[3px] px-[9px] py-[5px] text-[10px] tracking-[0.16em] uppercase"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--ap-muted)',
            border: '1px solid var(--ap-border)',
          }}
        >
          {tipoLabel(alfajor.tipo)}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run src/features/alfajores/components/AlfajorIdCard.test.tsx src/features/alfajores/components/AlfajorImageUploader.test.tsx`
Expected: PASS — los tests existentes del uploader siguen verdes (las props nuevas son opcionales).

- [ ] **Step 6: Commit**

```bash
git add src/features/alfajores/components/AlfajorIdCard.tsx src/features/alfajores/components/AlfajorIdCard.test.tsx src/features/alfajores/components/AlfajorImageUploader.tsx
git commit -m "feat(alfajores): add the id-card block and make the uploader slot styleable"
```

---

### Task 4: `AlfajorReviewCard`

El card del mockup: avatar + username + fecha, score grande a la derecha, comentario (o la línea de "cató sin dejar comentario"), grid de 5 ejes en mini-barras, foto opcional y pie con like + comentarios. Consume el `ReviewCardVM` que ya existe. El `ReviewCard` compartido no se toca.

**Files:**

- Create: `src/features/reviews/components/AlfajorReviewCard.tsx`
- Test: `src/features/reviews/components/AlfajorReviewCard.test.tsx`

**Interfaces:**

- Consumes: `ReviewCardVM` de `../lib/reviewCardVM`; `LikeButton` de `./LikeButton`; `ReviewDetailModal` de `./ReviewDetailModal`; `UserAvatar` de `@/shared/components/UserAvatar`.
- Produces: `function AlfajorReviewCard({ vm }: { vm: ReviewCardVM }): JSX.Element`

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/reviews/components/AlfajorReviewCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlfajorReviewCard } from './AlfajorReviewCard';
import type { ReviewCardVM } from '../lib/reviewCardVM';

vi.mock('./LikeButton', () => ({
  LikeButton: ({ likes }: { likes: number }) => (
    <button type="button">{likes}</button>
  ),
}));
vi.mock('./ReviewDetailModal', () => ({ ReviewDetailModal: () => null }));

const VM: ReviewCardVM = {
  id: 'r1',
  author: {
    id: 'u1',
    username: 'martu.ba',
    avatarUrl: null,
    isFollowing: false,
  },
  alfajor: null,
  marca: null,
  quote: 'La cobertura es gruesa y el bizcochuelo se mantiene húmedo.',
  photoUrl: null,
  overall: 9,
  axes: {
    dulzor: 7,
    cantidadDDL: 9,
    calidadBano: 8,
    ratioTapaRelleno: 7,
    textura: 8,
  },
  likes: 24,
  isLiked: false,
  commentsCount: 3,
  createdAt: '2026-07-14T12:00:00.000Z',
};

describe('AlfajorReviewCard', () => {
  it('renders the author, the score and the comment', () => {
    render(<AlfajorReviewCard vm={VM} />);
    expect(screen.getByText('@martu.ba')).toBeInTheDocument();
    expect(screen.getByText('9.0')).toBeInTheDocument();
    expect(screen.getByText(/La cobertura es gruesa/)).toBeInTheDocument();
  });

  it('renders the five axes with their values', () => {
    render(<AlfajorReviewCard vm={VM} />);
    expect(screen.getByText('Dulzor')).toBeInTheDocument();
    expect(screen.getByText('DDL')).toBeInTheDocument();
    expect(screen.getByText('Baño')).toBeInTheDocument();
    expect(screen.getByText('Tapa/rell.')).toBeInTheDocument();
    expect(screen.getByText('Textura')).toBeInTheDocument();
    expect(screen.getByTestId('axis-fill-cantidadDDL')).toHaveStyle({
      width: '90%',
    });
  });

  it('shows the no-comment line instead of an empty quote', () => {
    render(<AlfajorReviewCard vm={{ ...VM, quote: null }} />);
    expect(screen.getByText('Cató sin dejar comentario')).toBeInTheDocument();
  });

  it('renders the review photo only when there is one', () => {
    const { rerender } = render(<AlfajorReviewCard vm={VM} />);
    expect(screen.queryByAltText('Foto de la reseña')).not.toBeInTheDocument();
    rerender(<AlfajorReviewCard vm={{ ...VM, photoUrl: 'https://x/p.jpg' }} />);
    expect(screen.getByAltText('Foto de la reseña')).toBeInTheDocument();
  });

  it('pluralises the comment counter', () => {
    const { rerender } = render(<AlfajorReviewCard vm={VM} />);
    expect(screen.getByText('3 comentarios')).toBeInTheDocument();
    rerender(<AlfajorReviewCard vm={{ ...VM, commentsCount: 1 }} />);
    expect(screen.getByText('1 comentario')).toBeInTheDocument();
    rerender(<AlfajorReviewCard vm={{ ...VM, commentsCount: 0 }} />);
    expect(screen.getByText('Sin comentarios')).toBeInTheDocument();
  });

  it('links the author to their profile', () => {
    render(<AlfajorReviewCard vm={VM} />);
    expect(screen.getByRole('link', { name: '@martu.ba' })).toHaveAttribute(
      'href',
      '/u/martu.ba',
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/features/reviews/components/AlfajorReviewCard.test.tsx`
Expected: FAIL — no se puede resolver `./AlfajorReviewCard`.

- [ ] **Step 3: Write the component**

```tsx
// src/features/reviews/components/AlfajorReviewCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { LikeButton } from './LikeButton';
import { ReviewDetailModal } from './ReviewDetailModal';
import type { ReviewCardAxes, ReviewCardVM } from '../lib/reviewCardVM';

const AXES: { key: keyof ReviewCardAxes; label: string; strong: boolean }[] = [
  { key: 'dulzor', label: 'Dulzor', strong: true },
  { key: 'cantidadDDL', label: 'DDL', strong: true },
  { key: 'calidadBano', label: 'Baño', strong: false },
  { key: 'ratioTapaRelleno', label: 'Tapa/rell.', strong: false },
  { key: 'textura', label: 'Textura', strong: false },
];

const FECHA = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function comentariosLabel(n: number) {
  if (n === 0) return 'Sin comentarios';
  return `${n} ${n === 1 ? 'comentario' : 'comentarios'}`;
}

/** Frena la propagación: like y link al perfil no abren el modal de la card. */
function StopClick({ children }: { children: React.ReactNode }) {
  return (
    <span onClick={(e) => e.stopPropagation()} className="contents">
      {children}
    </span>
  );
}

/**
 * Card de reseña de la página del alfajor. Es un componente aparte del
 * `ReviewCard` de feed/perfil: muestra los 5 ejes inline, mueve el puntaje y
 * vive en la paleta blanca de esta página. Clickearlo abre el modal completo.
 */
export function AlfajorReviewCard({ vm }: { vm: ReviewCardVM }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        aria-label={`Ver reseña de ${vm.author.username}`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="flex cursor-pointer flex-col gap-4 py-[26px] outline-none"
        style={{ borderBottom: '1px solid var(--ap-hairline)' }}
      >
        <div className="flex items-center gap-3">
          <UserAvatar
            avatarUrl={vm.author.avatarUrl}
            username={vm.author.username}
            className="h-9 w-9 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <StopClick>
              <Link
                href={`/u/${vm.author.username}`}
                className="text-[14px] font-semibold hover:underline"
                style={{ color: 'var(--ap-ink)' }}
              >
                @{vm.author.username}
              </Link>
            </StopClick>
            <span
              className="text-[11px]"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--ap-faint-2)',
              }}
            >
              {FECHA.format(new Date(vm.createdAt))}
            </span>
          </div>
          <div
            className="ml-auto text-[28px]"
            style={{
              fontFamily: 'var(--font-archivo)',
              letterSpacing: '-0.04em',
              color: 'var(--ap-ink)',
            }}
          >
            {vm.overall.toFixed(1)}
          </div>
        </div>

        {vm.quote ? (
          <p
            className="text-[15px] leading-[1.6]"
            style={{ color: 'var(--ap-ink-2)', textWrap: 'pretty' }}
          >
            {vm.quote}
          </p>
        ) : (
          <div
            className="text-[11px] tracking-[0.1em] uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: '#c0b9b0' }}
          >
            Cató sin dejar comentario
          </div>
        )}

        <div className="grid grid-cols-5 gap-3">
          {AXES.map(({ key, label, strong }) => (
            <div key={key} className="flex flex-col gap-[6px]">
              <span
                className="text-[9px] tracking-[0.1em] uppercase"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--ap-faint)',
                }}
              >
                {label}
              </span>
              <div
                className="h-[6px] rounded-[2px]"
                style={{ background: 'var(--ap-inert)' }}
              >
                <i
                  data-testid={`axis-fill-${key}`}
                  className="block h-full rounded-[2px]"
                  style={{
                    width: `${vm.axes[key] * 10}%`,
                    background: strong
                      ? 'var(--ap-accent)'
                      : 'var(--ap-accent-dark)',
                  }}
                />
              </div>
              <span
                className="text-[11px]"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--ap-ink-2)',
                }}
              >
                {vm.axes[key].toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        {vm.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vm.photoUrl}
            alt="Foto de la reseña"
            className="h-[200px] w-full rounded-[5px] object-cover"
          />
        )}

        <div
          className="flex items-center gap-[18px] text-[12px]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--ap-muted)' }}
        >
          <StopClick>
            <span
              className="inline-flex rounded-full px-[14px] py-[7px]"
              style={{ border: '1px solid var(--ap-border)' }}
            >
              <LikeButton
                reviewId={vm.id}
                likes={vm.likes}
                isLiked={vm.isLiked}
              />
            </span>
          </StopClick>
          <span style={{ color: 'var(--ap-faint-2)' }}>
            {comentariosLabel(vm.commentsCount)}
          </span>
        </div>
      </article>

      <ReviewDetailModal vm={vm} open={open} onOpenChange={setOpen} />
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/features/reviews/components/AlfajorReviewCard.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/reviews/components/AlfajorReviewCard.tsx src/features/reviews/components/AlfajorReviewCard.test.tsx
git commit -m "feat(reviews): add the alfajor-page review card with inline axes"
```

---

### Task 5: `AlfajorReviewsPanel`

La columna derecha entera: header, skeleton, error con reintento, vacío con CTA, listado y "Cargar más".

**Files:**

- Create: `src/features/reviews/components/AlfajorReviewsPanel.tsx`
- Test: `src/features/reviews/components/AlfajorReviewsPanel.test.tsx`

**Interfaces:**

- Consumes: `useAlfajorReviews` de `../hooks/useAlfajorReviews`; `reviewToVM` de `../lib/reviewCardVM`; `AlfajorReviewCard` de `./AlfajorReviewCard`.
- Produces: `function AlfajorReviewsPanel({ alfajorId, onReview }: { alfajorId: string; onReview: () => void }): JSX.Element`

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/reviews/components/AlfajorReviewsPanel.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlfajorReviewsPanel } from './AlfajorReviewsPanel';
import { useAlfajorReviews } from '../hooks/useAlfajorReviews';

vi.mock('../hooks/useAlfajorReviews', () => ({ useAlfajorReviews: vi.fn() }));
vi.mock('./AlfajorReviewCard', () => ({
  AlfajorReviewCard: ({ vm }: { vm: { id: string } }) => (
    <article data-testid={`review-${vm.id}`} />
  ),
}));

const mocked = vi.mocked(useAlfajorReviews);

const REVIEW = {
  id: 'r1',
  userId: 'u1',
  author: { id: 'u1', username: 'martu', avatarUrl: null },
  alfajorId: 'a1',
  comentario: 'rico',
  fotoUrl: null,
  ratingGeneral: 9,
  dulzor: 7,
  cantidadDDL: 9,
  calidadBano: 8,
  ratioTapaRelleno: 7,
  textura: 8,
  createdAt: '2026-07-14T12:00:00.000Z',
  updatedAt: '2026-07-14T12:00:00.000Z',
};

function hook(over: Record<string, unknown> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    ...over,
  } as unknown as ReturnType<typeof useAlfajorReviews>;
}

describe('AlfajorReviewsPanel', () => {
  beforeEach(() => mocked.mockReset());

  it('shows the skeleton while loading', () => {
    mocked.mockReturnValue(hook({ isLoading: true }));
    render(<AlfajorReviewsPanel alfajorId="a1" onReview={vi.fn()} />);
    expect(screen.getByTestId('alfajor-reviews-loading')).toBeInTheDocument();
  });

  it('shows an error block and retries on demand', async () => {
    const refetch = vi.fn();
    mocked.mockReturnValue(hook({ isError: true, refetch }));
    render(<AlfajorReviewsPanel alfajorId="a1" onReview={vi.fn()} />);
    expect(screen.getByText('No pudimos traer las reseñas')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('shows the empty state and opens the review modal from its CTA', async () => {
    const onReview = vi.fn();
    mocked.mockReturnValue(
      hook({ data: { pages: [{ items: [], page: 1, limit: 10, total: 0 }] } }),
    );
    render(<AlfajorReviewsPanel alfajorId="a1" onReview={onReview} />);
    expect(screen.getByText('Nadie lo reseñó todavía')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Ser el primero' }),
    );
    expect(onReview).toHaveBeenCalledOnce();
  });

  it('renders one card per review', () => {
    mocked.mockReturnValue(
      hook({
        data: { pages: [{ items: [REVIEW], page: 1, limit: 10, total: 1 }] },
      }),
    );
    render(<AlfajorReviewsPanel alfajorId="a1" onReview={vi.fn()} />);
    expect(screen.getByTestId('review-r1')).toBeInTheDocument();
  });

  it('loads the next page on demand', async () => {
    const fetchNextPage = vi.fn();
    mocked.mockReturnValue(
      hook({
        data: { pages: [{ items: [REVIEW], page: 1, limit: 10, total: 20 }] },
        hasNextPage: true,
        fetchNextPage,
      }),
    );
    render(<AlfajorReviewsPanel alfajorId="a1" onReview={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cargar más' }));
    expect(fetchNextPage).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/features/reviews/components/AlfajorReviewsPanel.test.tsx`
Expected: FAIL — no se puede resolver `./AlfajorReviewsPanel`.

- [ ] **Step 3: Write the component**

```tsx
// src/features/reviews/components/AlfajorReviewsPanel.tsx
'use client';

import { useAlfajorReviews } from '../hooks/useAlfajorReviews';
import { reviewToVM } from '../lib/reviewCardVM';
import { AlfajorReviewCard } from './AlfajorReviewCard';

function SkeletonRow({ opacity }: { opacity: number }) {
  return (
    <div className="flex flex-col gap-3" style={{ opacity }}>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full" style={{ background: '#eeebe6' }} />
        <div className="flex flex-col gap-[6px]">
          <div
            className="h-3 w-[110px] rounded-[2px]"
            style={{ background: '#eeebe6' }}
          />
          <div
            className="h-[10px] w-[70px] rounded-[2px]"
            style={{ background: '#f3f1ed' }}
          />
        </div>
      </div>
      <div className="h-[13px] rounded-[2px]" style={{ background: '#f1efeb' }} />
      <div
        className="h-[13px] w-[82%] rounded-[2px]"
        style={{ background: '#f1efeb' }}
      />
    </div>
  );
}

/**
 * Columna de reseñas de la página del alfajor. Es dueña de sus cuatro estados:
 * la ficha del alfajor sigue visible aunque el listado falle, por eso el error
 * se resuelve acá adentro con un reintento local en vez de tumbar la página.
 */
export function AlfajorReviewsPanel({
  alfajorId,
  onReview,
}: {
  alfajorId: string;
  onReview: () => void;
}) {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAlfajorReviews(alfajorId);

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  const isEmpty = !isLoading && !isError && items.length === 0;

  return (
    <div className="flex min-w-0 flex-col">
      <div
        className="flex items-baseline justify-between gap-4 pb-4"
        style={{ borderBottom: '2px solid var(--ap-ink)' }}
      >
        <h2
          className="text-[17px]"
          style={{
            fontFamily: 'var(--font-archivo)',
            letterSpacing: '-0.02em',
            color: 'var(--ap-ink)',
          }}
        >
          Reseñas de la comunidad
        </h2>
        <span
          className="text-[11px] tracking-[0.14em] whitespace-nowrap uppercase"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--ap-faint)' }}
        >
          Más recientes
        </span>
      </div>

      {isLoading && (
        <div
          data-testid="alfajor-reviews-loading"
          aria-hidden
          className="flex flex-col gap-[26px] pt-[26px]"
        >
          <SkeletonRow opacity={1} />
          <SkeletonRow opacity={0.6} />
          <SkeletonRow opacity={0.3} />
        </div>
      )}

      {isError && (
        <div
          className="mt-[26px] flex flex-col items-start gap-[10px] rounded-[6px] p-[26px]"
          style={{ border: '1px solid #e6d3c2', background: '#fbf6f1' }}
        >
          <span
            className="text-[10px] tracking-[0.16em] uppercase"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--ap-accent)',
            }}
          >
            Error al cargar
          </span>
          <div className="text-[16px] font-semibold">
            No pudimos traer las reseñas
          </div>
          <p
            className="max-w-[52ch] text-[14px] leading-[1.55]"
            style={{ color: '#6f6a63' }}
          >
            La ficha del alfajor se cargó bien; falló el listado. Probá de nuevo
            en unos segundos.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="cursor-pointer rounded-[4px] px-5 py-3 text-[11px] tracking-[0.14em] uppercase"
            style={{
              fontFamily: 'var(--font-mono)',
              background: 'var(--ap-ink)',
              color: '#f7f5f1',
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {isEmpty && (
        <div
          className="mt-[26px] flex flex-col items-start gap-[10px] rounded-[6px] px-[26px] py-11"
          style={{ border: '1px dashed var(--ap-border)' }}
        >
          <div
            className="text-[20px]"
            style={{
              fontFamily: 'var(--font-archivo)',
              letterSpacing: '-0.03em',
              color: 'var(--ap-ink)',
            }}
          >
            Nadie lo reseñó todavía
          </div>
          <p
            className="max-w-[52ch] text-[14px] leading-[1.6]"
            style={{ color: '#6f6a63' }}
          >
            Tu cata va a definir el promedio y el perfil por eje de este alfajor.
          </p>
          <button
            type="button"
            onClick={onReview}
            className="mt-[6px] cursor-pointer rounded-[5px] px-6 py-[14px] text-[15px] font-semibold"
            style={{ background: 'var(--ap-ink)', color: '#f7f5f1' }}
          >
            Ser el primero
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex flex-col">
          {items.map((review) => (
            <AlfajorReviewCard key={review.id} vm={reviewToVM(review)} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mt-[26px] cursor-pointer self-start rounded-[4px] px-7 py-[14px] text-[12px] tracking-[0.14em] uppercase disabled:opacity-50"
          style={{
            fontFamily: 'var(--font-mono)',
            border: '1px solid var(--ap-ink)',
            color: 'var(--ap-ink)',
          }}
        >
          {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/features/reviews/components/AlfajorReviewsPanel.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/reviews/components/AlfajorReviewsPanel.tsx src/features/reviews/components/AlfajorReviewsPanel.test.tsx
git commit -m "feat(reviews): add the alfajor reviews panel with its four states"
```

---

### Task 6: Componer `AlfajorDetail`, skeleton y limpieza

Ensamblar las dos columnas, definir las CSS vars con scope, actualizar el skeleton y retirar el `AlfajorReviews` viejo, que queda sin consumidores.

**Files:**

- Modify: `src/features/alfajores/components/AlfajorDetail.tsx`
- Modify: `src/features/alfajores/components/AlfajorDetail.test.tsx`
- Modify: `src/features/alfajores/components/AlfajorDetailSkeleton.tsx`
- Delete: `src/features/reviews/components/AlfajorReviews.tsx`
- Delete: `src/features/reviews/components/AlfajorReviews.test.tsx` (si existe)

**Interfaces:**

- Consumes: `AlfajorIdCard`, `AlfajorScoreBlock`, `AlfajorEjesAverage` (tasks 1-3); `AlfajorReviewsPanel` (task 5); `useAlfajor`, `useAlfajorReviews`.
- Produces: nada nuevo hacia afuera; `AlfajorDetail({ id }: { id: string })` mantiene su firma.

- [ ] **Step 1: Confirm `AlfajorReviews` has no other consumers**

Run: `rg "AlfajorReviews\b" src --glob '!*AlfajorReviews*'`
Expected: solo `AlfajorDetail.tsx` (y su test). Si aparece otro consumidor, no borrar el archivo y anotarlo.

- [ ] **Step 2: Write the failing test**

Reemplazar el contenido de `src/features/alfajores/components/AlfajorDetail.test.tsx` por:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlfajorDetail } from './AlfajorDetail';
import { useAlfajor } from '../hooks/useAlfajor';
import { useAlfajorReviews } from '@/features/reviews/hooks/useAlfajorReviews';
import type { Alfajor } from '../types/alfajores.types';

vi.mock('../hooks/useAlfajor', () => ({ useAlfajor: vi.fn() }));
vi.mock('@/features/reviews/hooks/useAlfajorReviews', () => ({
  useAlfajorReviews: vi.fn(),
}));
// Hijos con hooks propios (tienen sus tests): se mockean para aislar el detalle.
vi.mock('@/features/reviews/components/AlfajorReviewsPanel', () => ({
  AlfajorReviewsPanel: () => <div data-testid="reviews-panel" />,
}));
vi.mock('@/features/reviews/components/QuickReviewModal', () => ({
  QuickReviewModal: () => null,
}));
vi.mock('./AlfajorImageUploader', () => ({ AlfajorImageUploader: () => null }));

const mockedAlfajor = vi.mocked(useAlfajor);
const mockedReviews = vi.mocked(useAlfajorReviews);

const ALFAJOR: Alfajor = {
  id: 'a1',
  nombre: 'Jorgito Triple',
  marcaId: 'm1',
  marca: { id: 'm1', nombre: 'Jorgito', provincia: 'Córdoba', logoUrl: null },
  tipo: 'CHOCOLATE',
  descripcion: 'Tres tapas, mucho dulce de leche.',
  imagenUrl: null,
  status: 'APPROVED',
  avgRating: 8.4,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function alfajorHook(over: Record<string, unknown> = {}) {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    ...over,
  } as unknown as ReturnType<typeof useAlfajor>;
}

function reviewsHook(total = 12) {
  return {
    data: { pages: [{ items: [], page: 1, limit: 10, total }] },
  } as unknown as ReturnType<typeof useAlfajorReviews>;
}

describe('AlfajorDetail', () => {
  beforeEach(() => {
    mockedAlfajor.mockReset();
    mockedReviews.mockReset();
    mockedReviews.mockReturnValue(reviewsHook());
  });

  it('shows the loading skeleton while fetching', () => {
    mockedAlfajor.mockReturnValue(alfajorHook({ isLoading: true }));
    render(<AlfajorDetail id="a1" />);
    expect(screen.getByTestId('alfajor-detail-skeleton')).toBeInTheDocument();
  });

  it('shows a not-found message on a 404', () => {
    mockedAlfajor.mockReturnValue(
      alfajorHook({ isError: true, error: { response: { status: 404 } } }),
    );
    render(<AlfajorDetail id="missing" />);
    expect(screen.getByText(/No encontramos este alfajor/)).toBeInTheDocument();
  });

  it('shows a generic error on any other failure', () => {
    mockedAlfajor.mockReturnValue(
      alfajorHook({ isError: true, error: { response: { status: 500 } } }),
    );
    render(<AlfajorDetail id="a1" />);
    expect(screen.getByText(/No pudimos cargar el alfajor/)).toBeInTheDocument();
    expect(screen.queryByTestId('reviews-panel')).not.toBeInTheDocument();
  });

  it('renders both columns and feeds the score block from the reviews total', () => {
    mockedAlfajor.mockReturnValue(alfajorHook({ data: ALFAJOR }));
    render(<AlfajorDetail id="a1" />);
    expect(screen.getByText('8.4')).toBeInTheDocument();
    expect(screen.getByText('12 reseñas')).toBeInTheDocument();
    expect(screen.getByTestId('reviews-panel')).toBeInTheDocument();
    expect(screen.getByText('Tres tapas, mucho dulce de leche.')).toBeInTheDocument();
  });

  it('reads the reviews count from the same query the panel uses', () => {
    mockedAlfajor.mockReturnValue(alfajorHook({ data: ALFAJOR }));
    render(<AlfajorDetail id="a1" />);
    expect(mockedReviews).toHaveBeenCalledWith('a1');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run src/features/alfajores/components/AlfajorDetail.test.tsx`
Expected: FAIL — `AlfajorDetail` todavía no usa `useAlfajorReviews` ni renderiza el panel.

- [ ] **Step 4: Rewrite `AlfajorDetail`**

```tsx
// src/features/alfajores/components/AlfajorDetail.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AlfajorReviewsPanel } from '@/features/reviews/components/AlfajorReviewsPanel';
import { QuickReviewModal } from '@/features/reviews/components/QuickReviewModal';
import { useAlfajorReviews } from '@/features/reviews/hooks/useAlfajorReviews';
import { useAlfajor } from '../hooks/useAlfajor';
import { AlfajorDetailSkeleton } from './AlfajorDetailSkeleton';
import { AlfajorEjesAverage } from './AlfajorEjesAverage';
import { AlfajorIdCard } from './AlfajorIdCard';
import { AlfajorScoreBlock } from './AlfajorScoreBlock';

/**
 * Paleta propia de esta página (mockup AlfajorPage): blanco en vez del papel
 * crema del resto de la app. Va con scope en el contenedor, no como tokens
 * globales, para que no se filtre a feed/ranking/perfil.
 */
const PALETTE = {
  '--ap-bg': '#fff',
  '--ap-ink': '#2b1a10',
  '--ap-ink-2': '#3c332b',
  '--ap-muted': '#5d564e',
  '--ap-faint': '#8a837b',
  '--ap-faint-2': '#9b948b',
  '--ap-accent': '#b86015',
  '--ap-accent-dark': '#4a3527',
  '--ap-hairline': '#eceae6',
  '--ap-border': '#ddd8d1',
  '--ap-inert': '#efece7',
  '--ap-inert-2': '#f4f2ee',
} as React.CSSProperties;

function statusOf(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | null)?.response?.status;
}

export function AlfajorDetail({ id }: { id: string }) {
  const { data, isLoading, isError, error } = useAlfajor(id);
  // Misma query key que usa el panel de reseñas: el conteo sale del cache
  // compartido, sin un request extra ni un campo nuevo en el back.
  const reviews = useAlfajorReviews(id);
  const [reviewOpen, setReviewOpen] = useState(false);

  const reviewsCount = reviews.data?.pages[0]?.total ?? 0;

  return (
    <main
      className="mx-auto max-w-[1280px] px-[18px] pt-4 pb-10 md:px-6 lg:px-10 lg:pt-10 lg:pb-16"
      style={{ ...PALETTE, background: 'var(--ap-bg)', color: 'var(--ap-ink)' }}
    >
      <Link
        href="/alfajores"
        className="mb-6 inline-flex items-center gap-1.5 text-[11px] tracking-[0.18em] uppercase transition-colors"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--ap-muted)' }}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Volver al catálogo
      </Link>

      {isLoading && <AlfajorDetailSkeleton />}

      {isError && statusOf(error) === 404 && (
        <p className="text-[14px]" style={{ color: 'var(--ap-muted)' }}>
          No encontramos este alfajor. Puede que no exista o todavía no esté
          aprobado.
        </p>
      )}

      {isError && statusOf(error) !== 404 && (
        <p className="text-[14px]" style={{ color: 'var(--ap-muted)' }}>
          No pudimos cargar el alfajor. Probá recargar.
        </p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[400px_1fr] lg:gap-14">
            <aside className="flex flex-col gap-[22px] self-start lg:sticky lg:top-6">
              <AlfajorIdCard alfajor={data} />
              <AlfajorScoreBlock
                avgRating={data.avgRating}
                reviewsCount={reviewsCount}
                onReview={() => setReviewOpen(true)}
              />
              <AlfajorEjesAverage avgEjes={data.avgEjes} />
              {data.descripcion && (
                <p
                  className="text-[14px] leading-[1.65]"
                  style={{ color: 'var(--ap-muted)', textWrap: 'pretty' }}
                >
                  {data.descripcion}
                </p>
              )}
            </aside>

            <AlfajorReviewsPanel
              alfajorId={data.id}
              onReview={() => setReviewOpen(true)}
            />
          </div>

          <QuickReviewModal
            open={reviewOpen}
            onOpenChange={setReviewOpen}
            alfajor={data}
          />
        </>
      )}
    </main>
  );
}
```

- [ ] **Step 5: Update the skeleton to the two-column shape**

```tsx
// src/features/alfajores/components/AlfajorDetailSkeleton.tsx
/** Placeholder del detalle mientras carga la ficha del alfajor. */
export function AlfajorDetailSkeleton() {
  return (
    <div
      data-testid="alfajor-detail-skeleton"
      aria-hidden
      className="grid animate-pulse grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[400px_1fr] lg:gap-14"
    >
      <div className="flex flex-col gap-[22px]">
        <div
          className="aspect-[433/500] w-full max-w-[340px] rounded-[6px]"
          style={{ background: '#f1efeb' }}
        />
        <div className="h-9 w-3/4 rounded" style={{ background: '#f1efeb' }} />
        <div className="h-[76px] w-40 rounded" style={{ background: '#f1efeb' }} />
        <div className="flex flex-col gap-[10px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[10px] rounded-[2px]"
              style={{ background: '#f1efeb' }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[26px]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <div
              className="h-9 w-9 rounded-full"
              style={{ background: '#eeebe6' }}
            />
            <div className="h-[13px] rounded-[2px]" style={{ background: '#f1efeb' }} />
            <div
              className="h-[13px] w-[70%] rounded-[2px]"
              style={{ background: '#f1efeb' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Delete the superseded reviews list**

```bash
git rm src/features/reviews/components/AlfajorReviews.tsx
git rm --ignore-unmatch src/features/reviews/components/AlfajorReviews.test.tsx
```

- [ ] **Step 7: Run the affected tests**

Run: `pnpm vitest run src/features/alfajores src/features/reviews`
Expected: PASS. Si algún test viejo referenciaba `AlfajorReviews`, actualizarlo o borrarlo según corresponda.

- [ ] **Step 8: Commit**

```bash
git add -A src/features/alfajores src/features/reviews
git commit -m "feat(alfajores): redesign the detail page as a two-column layout"
```

---

### Task 7: Verificación final

**Files:** ninguno nuevo; correcciones donde haga falta.

**Interfaces:**

- Consumes: todo lo anterior.
- Produces: nada.

- [ ] **Step 1: Full test suite with coverage**

Run: `pnpm test:coverage`
Expected: todo verde y las 4 métricas ≥85%. Si branch coverage bajó, agregar los casos faltantes en los componentes nuevos (el histórico del proyecto es que las ramas nuevas sin test tiran el gate abajo).

- [ ] **Step 2: Types, lint and format**

Run: `pnpm exec tsc --noEmit; pnpm lint; pnpm format`
Expected: sin errores. `format` puede reescribir archivos nuevos.

- [ ] **Step 3: Manual check in the browser**

Run: `pnpm dev` y abrir `/alfajores/<id>` con el back local.
Verificar: promedio y conteo correctos; bloque de ejes apagado (el back todavía no manda `avgEjes`); reseñar actualiza el promedio sin recargar; layout a 1280 / 768 / 375; alfajor sin reseñas muestra `—.—` y el estado vacío.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "style: apply prettier formatting to the alfajor detail redesign"
```

---

## Pendiente de otra sesión (no es parte de este plan)

Back: agregar `avgEjes` a `GET /alfajores/:id` con la forma definida en el spec. Queda anotado en el board como task de To do. Al llegar, el front lo consume sin cambios.
