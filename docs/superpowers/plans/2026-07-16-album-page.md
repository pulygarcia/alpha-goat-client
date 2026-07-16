# Álbum de figuritas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/u/[username]/album`, a public "sticker album" page: alfajores grouped into brand sheets, one sheet at a time, collected ones shown in color with the owner's rating, uncollected in grayscale.

**Architecture:** New feature `src/features/album/` (api/hooks/types/components) following the `profile`/`moderation` feature pattern. A thin page at `src/app/(app)/u/[username]/album/page.tsx` mounts `AlbumView`, which owns the single `useAlbum` query and the "active sheet" client state, synced to `?marca=<id>` via `next/navigation`. No backend changes — the endpoint (`GET /users/by-username/:username/album`) already shipped in server PR #28.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, TanStack Query, Tailwind v4 (cream-paper tokens), framer-motion (`StaggerItem`), Vitest + RTL.

## Global Constraints

- Feature-based structure: `src/features/album/{api,hooks,types,components}` — only the subfolders actually used.
- Never call the API from a component — always through a hook that calls `api/album.api.ts`.
- Mock the `api/` module in every test; never hit the network.
- Coverage ≥ 85% (branches/functions/lines/statements). Do not test `shared/components/ui/**` or the skeleton (purely presentational).
- `PascalCase.tsx` components, `camelCase.ts` hooks/utils/api, absolute imports via `@/`.
- Colors only from the design system tokens already in `globals.css` (`paper`, `paper-raised`, `paper-sunken`, `curry`, `cinnamon`, `sienna`, `ink`) — never raw hex, never `text-black`/`text-white`.
- Fonts: `font-archivo` for the brand name / big numbers, `font-mono` uppercase tracked-wide for coda/eyebrow text (percentages, "Nº", provincia), default sans (Inter) for body/labels.
- Motion: `StaggerItem` for figurita entrance; respects `prefers-reduced-motion` (already built into `StaggerItem`, don't duplicate the check).
- Conventional commits (`feat:`, `test:`), small atomic commits, one per task.

---

### Task 1: Album types + api client

**Files:**
- Create: `src/features/album/types/album.types.ts`
- Create: `src/features/album/api/album.api.ts`
- Test: `src/features/album/api/album.api.test.ts`

**Interfaces:**
- Produces: `AlbumOwner`, `AlbumFigurita`, `AlbumHoja`, `AlbumResponse` types; `albumApi.byUsername(username: string): Promise<AlbumResponse>`.

- [ ] **Step 1: Write the types**

```typescript
// src/features/album/types/album.types.ts

/** Dueño del álbum (subset del perfil, lo que el header necesita). */
export interface AlbumOwner {
  id: string;
  username: string;
  avatarUrl: string | null;
}

/** Progreso: cuántas figuritas de un total están conseguidas, y el %. */
export interface AlbumStats {
  collected: number;
  total: number;
  pct: number;
}

/** Una figurita del álbum: un alfajor del catálogo, con overlay del dueño. */
export interface AlbumFigurita {
  id: string;
  nombre: string;
  tipo: string;
  imagenUrl: string | null;
  /** Rating promedio del alfajor en la comunidad (null sin reseñas). */
  avgRating: number | null;
  /** Si el dueño del álbum ya lo reseñó. */
  collected: boolean;
  /** Nota que el dueño le puso (null si no la consiguió). */
  myRating: number | null;
  /** Id de la reseña del dueño, para linkear (null si no la consiguió). */
  reviewId: string | null;
}

/** Una hoja de marca: header de marca + sus figuritas ordenadas por avgRating. */
export interface AlbumHoja {
  marca: {
    id: string;
    nombre: string;
    provincia: string | null;
  };
  stats: AlbumStats;
  alfajores: AlbumFigurita[];
}

/** Response completo de `GET /users/by-username/:username/album`. */
export interface AlbumResponse {
  owner: AlbumOwner;
  stats: AlbumStats;
  hojas: AlbumHoja[];
}
```

- [ ] **Step 2: Write the api client**

```typescript
// src/features/album/api/album.api.ts
import { apiClient } from '@/shared/lib/api-client';
import type { AlbumResponse } from '../types/album.types';

export const albumApi = {
  /**
   * GET /users/by-username/:username/album (público, sin auth). 404 si el
   * username no existe. Solo lectura: reseñar es el único modo de "conseguir"
   * una figurita, no hay acción de escritura en el álbum.
   */
  byUsername: async (username: string): Promise<AlbumResponse> => {
    const res = await apiClient.get<AlbumResponse>(
      `/users/by-username/${encodeURIComponent(username)}/album`,
    );
    return res.data;
  },
};
```

- [ ] **Step 3: Write the failing test**

```typescript
// src/features/album/api/album.api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { albumApi } from './album.api';
import { apiClient } from '@/shared/lib/api-client';
import type { AlbumResponse } from '../types/album.types';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { get: vi.fn() },
}));

const ALBUM: AlbumResponse = {
  owner: { id: 'u1', username: 'puly', avatarUrl: null },
  stats: { collected: 1, total: 2, pct: 50 },
  hojas: [
    {
      marca: { id: 'm1', nombre: 'Havanna', provincia: 'Buenos Aires' },
      stats: { collected: 1, total: 2, pct: 50 },
      alfajores: [
        {
          id: 'a1',
          nombre: '70% Cacao',
          tipo: 'Chocolate negro',
          imagenUrl: null,
          avgRating: 4.6,
          collected: true,
          myRating: 8.5,
          reviewId: 'r1',
        },
        {
          id: 'a2',
          nombre: 'Blanco DDL',
          tipo: 'Chocolate blanco',
          imagenUrl: null,
          avgRating: 4.1,
          collected: false,
          myRating: null,
          reviewId: null,
        },
      ],
    },
  ],
};

describe('albumApi.byUsername', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it('fetches the album by encoded username', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: ALBUM } as never);

    const result = await albumApi.byUsername('puly gil');

    expect(apiClient.get).toHaveBeenCalledWith(
      '/users/by-username/puly%20gil/album',
    );
    expect(result).toEqual(ALBUM);
  });
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/album/api/album.api.test.ts`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/features/album/types/album.types.ts src/features/album/api/album.api.ts src/features/album/api/album.api.test.ts
git commit -m "feat: add album api client and types"
```

---

### Task 2: useAlbum hook

**Files:**
- Create: `src/features/album/hooks/useAlbum.ts`
- Test: `src/features/album/hooks/useAlbum.test.ts`

**Interfaces:**
- Consumes: `albumApi.byUsername` (Task 1), `AlbumResponse` (Task 1).
- Produces: `albumKey(username: string)`, `useAlbum(username: string)` — TanStack `useQuery` result over `AlbumResponse`.

- [ ] **Step 1: Write the failing test**

```typescript
// src/features/album/hooks/useAlbum.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAlbum } from './useAlbum';
import { albumApi } from '../api/album.api';
import type { AlbumResponse } from '../types/album.types';

vi.mock('../api/album.api', () => ({
  albumApi: { byUsername: vi.fn() },
}));

const ALBUM: AlbumResponse = {
  owner: { id: 'u1', username: 'puly', avatarUrl: null },
  stats: { collected: 0, total: 0, pct: 0 },
  hojas: [],
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

describe('useAlbum', () => {
  beforeEach(() => vi.mocked(albumApi.byUsername).mockReset());

  it('fetches the album by username', async () => {
    vi.mocked(albumApi.byUsername).mockResolvedValue(ALBUM);

    const { result } = renderHook(() => useAlbum('puly'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(ALBUM);
    expect(albumApi.byUsername).toHaveBeenCalledWith('puly');
  });

  it('is disabled when no username is provided', () => {
    const { result } = renderHook(() => useAlbum(''), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(albumApi.byUsername).not.toHaveBeenCalled();
  });

  it('surfaces the error state when the request fails', async () => {
    vi.mocked(albumApi.byUsername).mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useAlbum('ghost'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/album/hooks/useAlbum.test.ts`
Expected: FAIL — cannot find module `./useAlbum`

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/features/album/hooks/useAlbum.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { albumApi } from '../api/album.api';

export const albumKey = (username: string) => ['album', username] as const;

/**
 * Álbum público por username. Disabled sin username. `retry: false` para
 * que un 404 (username inexistente) caiga al estado de error enseguida
 * (mismo patrón que `useProfile`, mismo endpoint base).
 */
export function useAlbum(username: string) {
  return useQuery({
    queryKey: albumKey(username),
    queryFn: () => albumApi.byUsername(username),
    enabled: !!username,
    retry: false,
    staleTime: 60_000,
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/album/hooks/useAlbum.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/features/album/hooks/useAlbum.ts src/features/album/hooks/useAlbum.test.ts
git commit -m "feat: add useAlbum query hook"
```

---

### Task 3: FiguritaCard (estampilla postal)

**Files:**
- Create: `src/features/album/components/FiguritaCard.tsx`
- Test: `src/features/album/components/FiguritaCard.test.tsx`

**Interfaces:**
- Consumes: `AlbumFigurita` (Task 1).
- Produces: `FiguritaCard({ figurita: AlbumFigurita }): JSX.Element` — links to `/alfajores/[id]`, renders collected (color, "valor postal" rating) vs uncollected (grayscale, "SIN CONSEGUIR" tag) states. No internal data fetching.

- [ ] **Step 1: Write the failing test**

```typescript
// src/features/album/components/FiguritaCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FiguritaCard } from './FiguritaCard';
import type { AlbumFigurita } from '../types/album.types';

const COLLECTED: AlbumFigurita = {
  id: 'a1',
  nombre: '70% Cacao',
  tipo: 'Chocolate negro',
  imagenUrl: null,
  avgRating: 4.6,
  collected: true,
  myRating: 8.5,
  reviewId: 'r1',
};

const UNCOLLECTED: AlbumFigurita = {
  id: 'a2',
  nombre: 'Blanco DDL',
  tipo: 'Chocolate blanco',
  imagenUrl: null,
  avgRating: 4.1,
  collected: false,
  myRating: null,
  reviewId: null,
};

describe('FiguritaCard', () => {
  it('shows the name, my rating and links to the alfajor detail when collected', () => {
    render(<FiguritaCard figurita={COLLECTED} />);

    expect(screen.getByText('70% Cacao')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.queryByText('Sin conseguir')).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/alfajores/a1');
  });

  it('shows the "sin conseguir" tag and hides my rating when not collected', () => {
    render(<FiguritaCard figurita={UNCOLLECTED} />);

    expect(screen.getByText('Sin conseguir')).toBeInTheDocument();
    expect(screen.queryByText('8.5')).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/alfajores/a2');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/album/components/FiguritaCard.test.tsx`
Expected: FAIL — cannot find module `./FiguritaCard`

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/album/components/FiguritaCard.tsx
import Link from 'next/link';
import { cn } from '@/shared/lib/utils';
import type { AlbumFigurita } from '../types/album.types';

/**
 * Una figurita del álbum, estilo "estampilla postal": borde perforado,
 * conseguida a color con la nota del dueño como valor postal; sin conseguir
 * en escala de grises con tag rotado. Siempre linkea al detalle del alfajor.
 */
export function FiguritaCard({ figurita }: { figurita: AlbumFigurita }) {
  const { collected } = figurita;

  return (
    <Link
      href={`/alfajores/${figurita.id}`}
      className={cn(
        'group relative block px-3 py-3.5',
        collected ? 'bg-paper-raised' : 'bg-paper-sunken',
      )}
      style={{
        maskImage:
          'radial-gradient(circle 5px at 8px 6px, transparent 98%, black) top/16px 12px repeat-x, ' +
          'radial-gradient(circle 5px at 8px 6px, transparent 98%, black) bottom/16px 12px repeat-x, ' +
          'linear-gradient(black, black)',
        maskComposite: 'intersect',
        WebkitMaskImage:
          'radial-gradient(circle 5px at 8px 6px, transparent 98%, black) top/16px 12px repeat-x, ' +
          'radial-gradient(circle 5px at 8px 6px, transparent 98%, black) bottom/16px 12px repeat-x, ' +
          'linear-gradient(black, black)',
        WebkitMaskComposite: 'source-in',
      }}
    >
      <div
        className={cn(
          'border p-2',
          collected ? 'border-[rgba(74,30,8,0.25)]' : 'border-dashed border-[rgba(74,30,8,0.35)]',
        )}
      >
        <div
          className={cn(
            'h-[110px] rounded-md bg-cover bg-center',
            !collected && 'grayscale',
          )}
          style={{
            backgroundImage: figurita.imagenUrl
              ? `url(${figurita.imagenUrl})`
              : 'linear-gradient(135deg, #b86015, #f4a02b 60%, #f6c977)',
          }}
        />

        <h3
          className={cn(
            'mt-2 text-[13px] font-semibold tracking-tight',
            collected ? 'text-ink' : 'text-ink/45',
          )}
        >
          {figurita.nombre}
        </h3>

        <p
          className={cn(
            'font-mono text-[9px] tracking-[0.18em] uppercase',
            collected ? 'text-cinnamon' : 'text-ink/35',
          )}
        >
          {figurita.tipo}
          {figurita.avgRating !== null && ` · ★ ${figurita.avgRating}`}
        </p>

        {!collected && (
          <span className="bg-ink/80 text-paper absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded font-mono text-[9px] tracking-[0.2em] uppercase px-2.5 py-1">
            Sin conseguir
          </span>
        )}
      </div>

      {collected && (
        <span className="text-paper-raised bg-transparent absolute top-2 right-4 font-archivo text-[15px] drop-shadow-[0_1px_4px_rgba(74,30,8,0.5)]">
          {figurita.myRating}
        </span>
      )}
    </Link>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/album/components/FiguritaCard.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/features/album/components/FiguritaCard.tsx src/features/album/components/FiguritaCard.test.tsx
git commit -m "feat: add FiguritaCard (estampilla postal)"
```

---

### Task 4: FichaMarca (relleno editorial para hojas flacas)

**Files:**
- Create: `src/features/album/components/FichaMarca.tsx`
- Test: `src/features/album/components/FichaMarca.test.tsx`

**Interfaces:**
- Consumes: `marca: AlbumHoja['marca']`, `total: number` (cantidad de figuritas en catálogo de esa marca).
- Produces: `FichaMarca({ marca, total }): JSX.Element` — decorative filler card, no link, no data fetching.

- [ ] **Step 1: Write the failing test**

```typescript
// src/features/album/components/FichaMarca.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FichaMarca } from './FichaMarca';

describe('FichaMarca', () => {
  it('shows the brand initials, catalog size and provincia', () => {
    render(<FichaMarca marca={{ id: 'm1', nombre: 'Grido', provincia: 'Córdoba' }} total={2} />);

    expect(screen.getByText('GR')).toBeInTheDocument();
    expect(screen.getByText(/2 figuritas en catálogo/)).toBeInTheDocument();
    expect(screen.getByText('CÓRDOBA · AR')).toBeInTheDocument();
  });

  it('omits the provincia line when the brand has none', () => {
    render(<FichaMarca marca={{ id: 'm2', nombre: 'Jorgito', provincia: null }} total={1} />);

    expect(screen.queryByText(/· AR/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/album/components/FichaMarca.test.tsx`
Expected: FAIL — cannot find module `./FichaMarca`

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/album/components/FichaMarca.tsx
import type { AlbumHoja } from '../types/album.types';

function initials(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

/**
 * Relleno editorial para hojas con 1-2 figuritas: en vez de dejar la grilla
 * vacía, una "ficha de marca" que completa el layout con datos atmosféricos.
 * Solo decorativa, sin link ni fetch propio.
 */
export function FichaMarca({
  marca,
  total,
}: {
  marca: AlbumHoja['marca'];
  total: number;
}) {
  return (
    <aside className="bg-paper-sunken flex flex-col justify-between rounded-xl border border-[rgba(74,30,8,0.12)] p-4">
      <div>
        <div className="border-ink/40 text-ink/55 mb-3 flex h-14 w-14 -rotate-6 items-center justify-center rounded-full border-2 border-dashed font-archivo text-lg">
          {initials(marca.nombre)}
        </div>
        <p className="text-ink/70 font-mono text-[10px] tracking-[0.24em] uppercase">
          Ficha de marca
        </p>
        <p className="text-ink/70 mt-2 text-[13px] leading-relaxed">
          Edición corta: {total} figurita{total === 1 ? '' : 's'} en catálogo.
        </p>
      </div>
      {marca.provincia && (
        <p className="mt-3 font-archivo text-[14px] tracking-tight">
          {marca.provincia.toUpperCase()} · AR
        </p>
      )}
    </aside>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/album/components/FichaMarca.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/features/album/components/FichaMarca.tsx src/features/album/components/FichaMarca.test.tsx
git commit -m "feat: add FichaMarca filler for thin brand sheets"
```

---

### Task 5: AlbumHoja (sheet: header + grid + watermark)

**Files:**
- Create: `src/features/album/components/AlbumHoja.tsx`
- Test: `src/features/album/components/AlbumHoja.test.tsx`

**Interfaces:**
- Consumes: `hoja: AlbumHoja` (Task 1), `FiguritaCard` (Task 3), `FichaMarca` (Task 4), `StaggerItem` (`@/shared/components/motion/StaggerItem`).
- Produces: `AlbumHoja({ hoja: AlbumHojaType, index: number }): JSX.Element`. `index` is the sheet's 1-based position among all sheets, used for the "Hoja NN" coda — **not** related to `StaggerItem`'s per-item index (each figurita gets its own local index for stagger).

- [ ] **Step 1: Write the failing test**

```typescript
// src/features/album/components/AlbumHoja.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlbumHoja } from './AlbumHoja';
import type { AlbumHoja as AlbumHojaType } from '../types/album.types';

const HOJA_LLENA: AlbumHojaType = {
  marca: { id: 'm1', nombre: 'Havanna', provincia: 'Buenos Aires' },
  stats: { collected: 2, total: 3, pct: 67 },
  alfajores: [
    { id: 'a1', nombre: '70% Cacao', tipo: 'Chocolate negro', imagenUrl: null, avgRating: 4.6, collected: true, myRating: 8.5, reviewId: 'r1' },
    { id: 'a2', nombre: 'Clásico', tipo: 'Chocolate', imagenUrl: null, avgRating: 4.4, collected: true, myRating: 9, reviewId: 'r2' },
    { id: 'a3', nombre: 'Blanco DDL', tipo: 'Chocolate blanco', imagenUrl: null, avgRating: 4.1, collected: false, myRating: null, reviewId: null },
  ],
};

const HOJA_FLACA: AlbumHojaType = {
  marca: { id: 'm2', nombre: 'Grido', provincia: 'Córdoba' },
  stats: { collected: 1, total: 2, pct: 50 },
  alfajores: [
    { id: 'a4', nombre: 'Helado DDL', tipo: 'Helado', imagenUrl: null, avgRating: 3.8, collected: true, myRating: 7, reviewId: 'r4' },
    { id: 'a5', nombre: 'Bombón', tipo: 'Chocolate', imagenUrl: null, avgRating: null, collected: false, myRating: null, reviewId: null },
  ],
};

describe('AlbumHoja', () => {
  it('shows the brand name, sheet number and progress', () => {
    render(<AlbumHoja hoja={HOJA_LLENA} index={3} />);

    expect(screen.getByText('Havanna')).toBeInTheDocument();
    expect(screen.getByText('Hoja 03 · Buenos Aires')).toBeInTheDocument();
    expect(screen.getByText('2/3')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('adds a FichaMarca filler when the sheet has 2 or fewer figuritas', () => {
    render(<AlbumHoja hoja={HOJA_FLACA} index={7} />);

    expect(screen.getByText(/2 figuritas en catálogo/)).toBeInTheDocument();
  });

  it('does not add a filler when the sheet has 3 or more figuritas', () => {
    render(<AlbumHoja hoja={HOJA_LLENA} index={3} />);

    expect(screen.queryByText(/figuritas en catálogo/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/album/components/AlbumHoja.test.tsx`
Expected: FAIL — cannot find module `./AlbumHoja`

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/album/components/AlbumHoja.tsx
import { StaggerItem } from '@/shared/components/motion/StaggerItem';
import { FiguritaCard } from './FiguritaCard';
import { FichaMarca } from './FichaMarca';
import type { AlbumHoja as AlbumHojaType } from '../types/album.types';

function initial(nombre: string): string {
  return nombre[0]?.toUpperCase() ?? '';
}

/** Una hoja de marca: header con progreso + grilla de figuritas (3 cols en md+, 2 en mobile). */
export function AlbumHoja({
  hoja,
  index,
}: {
  hoja: AlbumHojaType;
  index: number;
}) {
  const needsFiller = hoja.alfajores.length <= 2;

  return (
    <section className="bg-paper-raised relative overflow-hidden rounded-3xl p-6 shadow-[0_30px_80px_-30px_rgba(74,30,8,0.5)] md:p-9">
      <span
        aria-hidden
        className="text-ink/[0.05] pointer-events-none absolute -right-10 -bottom-24 font-archivo text-[340px] leading-none select-none"
      >
        {initial(hoja.marca.nombre)}
      </span>

      <div className="relative flex items-end justify-between gap-4">
        <div>
          <p className="text-ink/55 font-mono text-[10px] tracking-[0.26em] uppercase">
            Hoja {String(index).padStart(2, '0')}
            {hoja.marca.provincia ? ` · ${hoja.marca.provincia}` : ''}
          </p>
          <h2 className="mt-1 font-archivo text-3xl tracking-tight md:text-4xl">
            {hoja.marca.nombre}
          </h2>
        </div>
        <div className="text-right">
          <p className="font-archivo text-cinnamon text-2xl">
            {hoja.stats.collected}/{hoja.stats.total}
          </p>
          <p className="text-ink/55 font-mono text-[10px] tracking-[0.26em] uppercase">
            {hoja.stats.pct}% de la hoja
          </p>
        </div>
      </div>

      <div className="bg-paper-sunken relative mt-3.5 mb-7 h-2 overflow-hidden rounded-full">
        <div
          className="from-cinnamon to-curry h-full rounded-full bg-gradient-to-r"
          style={{ width: `${hoja.stats.pct}%` }}
        />
      </div>

      <div className="relative grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
        {hoja.alfajores.map((figurita, i) => (
          <StaggerItem key={figurita.id} index={i}>
            <FiguritaCard figurita={figurita} />
          </StaggerItem>
        ))}
        {needsFiller && (
          <FichaMarca marca={hoja.marca} total={hoja.alfajores.length} />
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/album/components/AlbumHoja.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/features/album/components/AlbumHoja.tsx src/features/album/components/AlbumHoja.test.tsx
git commit -m "feat: add AlbumHoja sheet component"
```

---

### Task 6: MarcaIndex (pills) + HojaPager

**Files:**
- Create: `src/features/album/components/MarcaIndex.tsx`
- Create: `src/features/album/components/HojaPager.tsx`
- Test: `src/features/album/components/MarcaIndex.test.tsx`
- Test: `src/features/album/components/HojaPager.test.tsx`

**Interfaces:**
- Consumes: `AlbumHoja[]` (Task 1) for building pill labels; `activeMarcaId: string`, `onSelect: (marcaId: string) => void`.
- Produces:
  - `MarcaIndex({ hojas: AlbumHoja[], activeMarcaId: string, onSelect: (marcaId: string) => void }): JSX.Element`
  - `HojaPager({ hojas: AlbumHoja[], activeIndex: number, onNavigate: (marcaId: string) => void }): JSX.Element` — `activeIndex` is 0-based into `hojas`.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/features/album/components/MarcaIndex.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarcaIndex } from './MarcaIndex';
import type { AlbumHoja } from '../types/album.types';

const HOJAS: AlbumHoja[] = [
  { marca: { id: 'm1', nombre: 'Águila', provincia: 'Córdoba' }, stats: { collected: 4, total: 4, pct: 100 }, alfajores: [] },
  { marca: { id: 'm2', nombre: 'Havanna', provincia: 'CABA' }, stats: { collected: 4, total: 6, pct: 67 }, alfajores: [] },
];

describe('MarcaIndex', () => {
  it('renders one pill per hoja with its completion percentage', () => {
    render(<MarcaIndex hojas={HOJAS} activeMarcaId="m2" onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Águila.*100%/s })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Havanna.*67%/s })).toBeInTheDocument();
  });

  it('marks the active pill and calls onSelect with the marca id on click', async () => {
    const onSelect = vi.fn();
    render(<MarcaIndex hojas={HOJAS} activeMarcaId="m2" onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: /Havanna/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Águila/ })).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(screen.getByRole('button', { name: /Águila/ }));
    expect(onSelect).toHaveBeenCalledWith('m1');
  });
});
```

```typescript
// src/features/album/components/HojaPager.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HojaPager } from './HojaPager';
import type { AlbumHoja } from '../types/album.types';

const HOJAS: AlbumHoja[] = [
  { marca: { id: 'm1', nombre: 'Águila', provincia: 'Córdoba' }, stats: { collected: 4, total: 4, pct: 100 }, alfajores: [] },
  { marca: { id: 'm2', nombre: 'Havanna', provincia: 'CABA' }, stats: { collected: 4, total: 6, pct: 67 }, alfajores: [] },
  { marca: { id: 'm3', nombre: 'Cachafaz', provincia: null }, stats: { collected: 1, total: 3, pct: 33 }, alfajores: [] },
];

describe('HojaPager', () => {
  it('shows the current position and navigates to the next hoja', async () => {
    const onNavigate = vi.fn();
    render(<HojaPager hojas={HOJAS} activeIndex={1} onNavigate={onNavigate} />);

    expect(screen.getByText('Hoja 2 de 3')).toBeInTheDocument();
    expect(screen.getByText('Havanna · CABA')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Cachafaz/ }));
    expect(onNavigate).toHaveBeenCalledWith('m3');
  });

  it('disables the previous button on the first hoja', () => {
    render(<HojaPager hojas={HOJAS} activeIndex={0} onNavigate={vi.fn()} />);

    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled();
  });

  it('disables the next button on the last hoja', () => {
    render(<HojaPager hojas={HOJAS} activeIndex={2} onNavigate={vi.fn()} />);

    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/features/album/components/MarcaIndex.test.tsx src/features/album/components/HojaPager.test.tsx`
Expected: FAIL — cannot find modules `./MarcaIndex`, `./HojaPager`

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/album/components/MarcaIndex.tsx
import { cn } from '@/shared/lib/utils';
import type { AlbumHoja } from '../types/album.types';

/** Índice de hojas como pills scrolleables horizontalmente. */
export function MarcaIndex({
  hojas,
  activeMarcaId,
  onSelect,
}: {
  hojas: AlbumHoja[];
  activeMarcaId: string;
  onSelect: (marcaId: string) => void;
}) {
  return (
    <div className="scrollbar-none flex gap-2.5 overflow-x-auto py-1">
      {hojas.map((hoja) => {
        const active = hoja.marca.id === activeMarcaId;
        const full = hoja.stats.pct === 100;

        return (
          <button
            key={hoja.marca.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(hoja.marca.id)}
            className={cn(
              'flex flex-none cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-medium whitespace-nowrap',
              active
                ? 'bg-ink text-paper border-ink'
                : 'bg-paper-raised text-ink border-[rgba(74,30,8,0.14)]',
            )}
          >
            {hoja.marca.nombre}
            <span
              className={cn(
                'font-mono text-[10px]',
                full ? 'text-[#7dd693]' : active ? 'text-curry' : 'text-cinnamon',
              )}
            >
              {hoja.stats.pct}%
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

```tsx
// src/features/album/components/HojaPager.tsx
import type { AlbumHoja } from '../types/album.types';

/** Pager anterior/siguiente entre hojas, con la posición actual al centro. */
export function HojaPager({
  hojas,
  activeIndex,
  onNavigate,
}: {
  hojas: AlbumHoja[];
  activeIndex: number;
  onNavigate: (marcaId: string) => void;
}) {
  const prev = hojas[activeIndex - 1];
  const current = hojas[activeIndex];
  const next = hojas[activeIndex + 1];

  if (!current) return null;

  return (
    <div className="bg-paper-raised flex items-center justify-between gap-3 rounded-2xl p-3.5 shadow-[0_14px_32px_-20px_rgba(74,30,8,0.45)] md:p-4">
      <button
        type="button"
        disabled={!prev}
        onClick={() => prev && onNavigate(prev.marca.id)}
        className="text-ink cursor-pointer rounded-full border border-[rgba(74,30,8,0.2)] px-4 py-2.5 text-[12px] font-semibold tracking-wide uppercase disabled:cursor-not-allowed disabled:opacity-30"
      >
        {prev ? `← ${prev.marca.nombre}` : '← Anterior'}
      </button>

      <div className="text-center">
        <p className="font-archivo text-[15px]">
          Hoja {activeIndex + 1} de {hojas.length}
        </p>
        <p className="text-ink/55 font-mono text-[10px] tracking-[0.24em] uppercase">
          {current.marca.nombre}
          {current.marca.provincia ? ` · ${current.marca.provincia}` : ''}
        </p>
      </div>

      <button
        type="button"
        disabled={!next}
        onClick={() => next && onNavigate(next.marca.id)}
        className="bg-curry text-sienna cursor-pointer rounded-full px-5 py-2.5 text-[12px] font-semibold tracking-wide uppercase shadow-[0_8px_24px_-8px_rgba(244,160,43,0.6)] disabled:cursor-not-allowed disabled:opacity-30"
      >
        {next ? `${next.marca.nombre} →` : 'Siguiente →'}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/features/album/components/MarcaIndex.test.tsx src/features/album/components/HojaPager.test.tsx`
Expected: PASS (5 tests total)

- [ ] **Step 5: Commit**

```bash
git add src/features/album/components/MarcaIndex.tsx src/features/album/components/HojaPager.tsx src/features/album/components/MarcaIndex.test.tsx src/features/album/components/HojaPager.test.tsx
git commit -m "feat: add MarcaIndex pills and HojaPager navigation"
```

---

### Task 7: AlbumHeader + AlbumSkeleton

**Files:**
- Create: `src/features/album/components/AlbumHeader.tsx`
- Create: `src/features/album/components/AlbumSkeleton.tsx`
- Test: `src/features/album/components/AlbumHeader.test.tsx`

**Interfaces:**
- Consumes: `AlbumOwner`, `AlbumStats` (Task 1).
- Produces: `AlbumHeader({ owner: AlbumOwner, stats: AlbumStats }): JSX.Element`; `AlbumSkeleton(): JSX.Element` (untested, purely presentational per Global Constraints).

- [ ] **Step 1: Write the failing test**

```typescript
// src/features/album/components/AlbumHeader.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlbumHeader } from './AlbumHeader';

describe('AlbumHeader', () => {
  it('shows the owner handle and global progress', () => {
    render(
      <AlbumHeader
        owner={{ id: 'u1', username: 'pulyg', avatarUrl: null }}
        stats={{ collected: 29, total: 50, pct: 58 }}
      />,
    );

    expect(screen.getByText('Álbum de @pulyg')).toBeInTheDocument();
    expect(screen.getByText('29/50')).toBeInTheDocument();
    expect(screen.getByText('58% completo')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/album/components/AlbumHeader.test.tsx`
Expected: FAIL — cannot find module `./AlbumHeader`

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/album/components/AlbumHeader.tsx
import { UserAvatar } from '@/shared/components/UserAvatar';
import type { AlbumOwner, AlbumStats } from '../types/album.types';

/** Header del álbum: dueño + progreso global + barra. */
export function AlbumHeader({
  owner,
  stats,
}: {
  owner: AlbumOwner;
  stats: AlbumStats;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 flex items-center gap-2.5">
            <UserAvatar
              username={owner.username}
              avatarUrl={owner.avatarUrl}
              className="h-8.5 w-8.5"
            />
            <p className="text-ink/55 font-mono text-[10px] tracking-[0.26em] uppercase">
              Álbum de @{owner.username}
            </p>
          </div>
          <h1 className="font-archivo text-4xl tracking-tight md:text-[45px]">
            El Álbum
          </h1>
        </div>
        <div className="text-right">
          <p className="font-archivo text-cinnamon text-3xl">
            {stats.collected}/{stats.total}
          </p>
          <p className="text-ink/55 font-mono text-[10px] tracking-[0.26em] uppercase">
            {stats.pct}% completo
          </p>
        </div>
      </div>

      <div className="bg-paper-sunken mt-3.5 h-2.5 overflow-hidden rounded-full">
        <div
          className="from-cinnamon to-curry h-full rounded-full bg-gradient-to-r"
          style={{ width: `${stats.pct}%` }}
        />
      </div>
    </div>
  );
}
```

```tsx
// src/features/album/components/AlbumSkeleton.tsx
import { Skeleton } from '@/shared/components/ui/skeleton';

/** Placeholder mientras carga el álbum: header + una hoja de ejemplo. */
export function AlbumSkeleton() {
  return (
    <div data-testid="album-skeleton" aria-hidden className="flex flex-col gap-8">
      <div>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-2 h-10 w-56" />
        <Skeleton className="mt-3.5 h-2.5 w-full rounded-full" />
      </div>
      <div className="flex gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-[420px] w-full rounded-3xl" />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/album/components/AlbumHeader.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/features/album/components/AlbumHeader.tsx src/features/album/components/AlbumSkeleton.tsx src/features/album/components/AlbumHeader.test.tsx
git commit -m "feat: add AlbumHeader and loading skeleton"
```

---

### Task 8: AlbumView (orchestration + URL sync)

**Files:**
- Create: `src/features/album/components/AlbumView.tsx`
- Test: `src/features/album/components/AlbumView.test.tsx`

**Interfaces:**
- Consumes: `useAlbum` (Task 2), `AlbumHeader` (Task 7), `MarcaIndex` (Task 6), `HojaPager` (Task 6), `AlbumHoja` component (Task 5), `AlbumSkeleton` (Task 7), `useRouter`/`useSearchParams`/`usePathname` from `next/navigation`.
- Produces: `AlbumView({ username: string }): JSX.Element` — the full page content (no `<AppHeader>`/`<Footer>`, those live in the page).

- [ ] **Step 1: Write the failing test**

```typescript
// src/features/album/components/AlbumView.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlbumView } from './AlbumView';
import { useAlbum } from '../hooks/useAlbum';
import type { AlbumResponse } from '../types/album.types';

vi.mock('../hooks/useAlbum');

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

    await userEvent.click(screen.getByRole('button', { name: /Havanna/ }));

    expect(screen.getByRole('heading', { name: 'Havanna' })).toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith('/u/pulyg/album?marca=m2', { scroll: false });
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/album/components/AlbumView.test.tsx`
Expected: FAIL — cannot find module `./AlbumView`

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/album/components/AlbumView.tsx
'use client';

import { useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAlbum } from '../hooks/useAlbum';
import { AlbumHeader } from './AlbumHeader';
import { MarcaIndex } from './MarcaIndex';
import { HojaPager } from './HojaPager';
import { AlbumHoja } from './AlbumHoja';
import { AlbumSkeleton } from './AlbumSkeleton';

function statusOf(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | null)?.response?.status;
}

/** Página del álbum: header global + índice de marcas + hoja activa + pager. */
export function AlbumView({ username }: { username: string }) {
  const { data: album, isLoading, isError, error } = useAlbum(username);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeIndex = useMemo(() => {
    if (!album) return 0;
    const requested = searchParams.get('marca');
    const found = album.hojas.findIndex((h) => h.marca.id === requested);
    return found === -1 ? 0 : found;
  }, [album, searchParams]);

  function goToMarca(marcaId: string) {
    router.replace(`${pathname}?marca=${marcaId}`, { scroll: false });
  }

  if (isLoading) return <AlbumSkeleton />;

  if (isError) {
    return (
      <p className="text-sienna text-[14px]">
        {statusOf(error) === 404
          ? 'No encontramos a este usuario.'
          : 'No pudimos cargar el álbum. Probá recargar.'}
      </p>
    );
  }

  if (!album) return null;

  if (album.hojas.length === 0) {
    return (
      <p className="text-ink/55 font-mono text-[11px] tracking-[0.2em] uppercase">
        Todavía no hay alfajores en el catálogo.
      </p>
    );
  }

  const activeHoja = album.hojas[activeIndex]!;

  return (
    <div className="flex flex-col gap-6">
      <AlbumHeader owner={album.owner} stats={album.stats} />
      <MarcaIndex
        hojas={album.hojas}
        activeMarcaId={activeHoja.marca.id}
        onSelect={goToMarca}
      />
      <AlbumHoja hoja={activeHoja} index={activeIndex + 1} />
      <HojaPager
        hojas={album.hojas}
        activeIndex={activeIndex}
        onNavigate={goToMarca}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/features/album/components/AlbumView.test.tsx`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/features/album/components/AlbumView.tsx src/features/album/components/AlbumView.test.tsx
git commit -m "feat: add AlbumView orchestration with URL-synced active sheet"
```

---

### Task 9: Route page + link from the profile

**Files:**
- Create: `src/app/(app)/u/[username]/album/page.tsx`
- Modify: `src/features/profile/components/ProfileSidebar.tsx`
- Test: `src/features/profile/components/ProfileSidebar.test.tsx` (extend existing file)

**Interfaces:**
- Consumes: `AlbumView` (Task 8), `AppHeader`/`Footer` (`@/shared/components/layout`), `Profile.username` (existing).
- Produces: public route `/u/[username]/album`; a link from `ProfileSidebar` to that route.

- [ ] **Step 1: Write the page (no test — thin page composing already-tested pieces, same pattern as `u/[username]/page.tsx`)**

```tsx
// src/app/(app)/u/[username]/album/page.tsx
import { AlbumView } from '@/features/album/components/AlbumView';
import { AppHeader } from '@/shared/components/layout/AppHeader';
import { Footer } from '@/shared/components/layout/Footer';

// Álbum público por username. En Next 16 `params` es una Promise.
export default async function AlbumPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <div className="bg-paper text-ink flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-[980px] flex-1 px-5 py-8 md:px-8 md:py-10">
        <AlbumView username={username} />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Note the target styling**

`ProfileSidebar` is a dark "carnet" card (crema text `rgba(255,253,246,*)` on a chocolate gradient background, `var(--font-mono)` uppercase labels) — it does not use the cream-paper functional-panel tokens (`text-ink`, `text-cinnamon`, etc.) that the rest of the album UI uses. The new link must match *this* component's existing crema/mono style, not the paper palette.

- [ ] **Step 3: Write the failing test for the new link**

Add this test to the existing `src/features/profile/components/ProfileSidebar.test.tsx` (match its existing `render(...)` setup/props for `ProfileSidebar` already used by neighboring tests in that file):

```typescript
it('links to the album page for this username', () => {
  render(<ProfileSidebar profile={PROFILE} onEditClick={vi.fn()} />);

  expect(screen.getByRole('link', { name: /álbum/i })).toHaveAttribute(
    'href',
    `/u/${PROFILE.username}/album`,
  );
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm run test -- src/features/profile/components/ProfileSidebar.test.tsx`
Expected: FAIL — no link with accessible name matching `/álbum/i`

- [ ] **Step 5: Add the link in ProfileSidebar**

Add, right after the `isOwn ? ... : <FollowButton .../>` block (still inside the `<div className="mt-4">`, as a sibling below it), a `next/link`:

```tsx
<Link
  href={`/u/${profile.username}/album`}
  className="text-curry-bright mt-2 block text-center text-[12px] font-semibold tracking-wide underline-offset-4 hover:underline"
>
  Ver álbum
</Link>
```

Add `import Link from 'next/link';` at the top of the file alongside the other imports.

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test -- src/features/profile/components/ProfileSidebar.test.tsx`
Expected: PASS (all tests, including the new one)

- [ ] **Step 7: Commit**

```bash
git add "src/app/(app)/u/[username]/album/page.tsx" src/features/profile/components/ProfileSidebar.tsx src/features/profile/components/ProfileSidebar.test.tsx
git commit -m "feat: add /u/[username]/album route and link from profile"
```

---

### Task 10: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm run test`
Expected: all tests pass, no regressions in `profile`/`moderation`/other features.

- [ ] **Step 2: Run coverage**

Run: `npm run test:coverage`
Expected: album feature files at or above the 85% branch/function/line/statement thresholds. If `AlbumView`'s error/empty branches are under-covered, check the Task 8 test file already covers 404/other-error/empty/loading — all four are included above.

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`, then in a browser visit `/u/<a real username with reviews>/album`. Confirm: first hoja renders, pills switch hojas and update the URL query, pager prev/next works and disables at the ends, a thin hoja (if any test data has one) shows the `FichaMarca` filler, collected figuritas are in color with their rating and uncollected ones are grayscale with the tag, and the profile page links here.

- [ ] **Step 5: Update decisions log if anything deviated from the spec**

If Task 7's `UserAvatar` prop names or Task 9's `ProfileSidebar` styling differed from what's written above, add a short entry to `docs/decisions.md` noting the actual contract. Otherwise skip — this is a routine feature, not a non-obvious decision (per `CLAUDE.md`, don't log routine work there).

- [ ] **Step 6: Final commit if step 5 produced changes**

```bash
git add docs/decisions.md
git commit -m "docs: note album implementation deviations"
```
