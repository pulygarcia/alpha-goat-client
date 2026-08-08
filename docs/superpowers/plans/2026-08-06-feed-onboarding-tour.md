# Feed Onboarding Tour (FAB step) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a one-step spotlight tour pointing at the feed's `ReviewFab`, once per browser, on mobile only.

**Architecture:** New `src/features/onboarding/` feature with a `useFeedTourSeen` localStorage hook and a `FeedTour` client component wrapping `react-joyride`. `ReviewFab` renders `FeedTour` next to itself and tags its button with `data-tour="feed-fab"` so Joyride can target it via CSS selector without ref-timing issues.

**Tech Stack:** `react-joyride` (new dependency), existing `useMediaQuery` hook, `localStorage`, Vitest + React Testing Library.

## Global Constraints

- Mobile only: gate on `useMediaQuery('(max-width: 639px)')` — this matches the Tailwind `sm` breakpoint used by `ReviewFab`'s `sm:hidden` (spec: "Trigger y scope").
- Persist the "seen" flag in `localStorage` under the key `ag-feed-fab-tour-seen`, following the existing `HomeExperience.tsx` pattern (tri-state `null | boolean`, resolved in `useEffect` to avoid SSR/hydration mismatch).
- Runs for both authenticated and anonymous visitors (spec: "Trigger y scope") — no auth check anywhere in this feature.
- Copy: "Clickeá el alfajor flotante para hacer una reseña rápido." (spec: "Contenido y estilo").
- Colors from design tokens only, never raw hex: `var(--color-blanco-tibio)` background, `var(--color-ink)` text, `var(--color-curry)` accent/primary button (spec: "Contenido y estilo"; also project rule against hardcoded neutrals).
- ~600ms delay before the tour appears, so it doesn't collide with the feed's entrance animation (spec: "Timing / edge cases").
- Mark as seen on: Joyride `finished`, Joyride `skipped`, AND when the `QuickReviewModal` opens from the FAB while the tour is still showing (spec: "Trigger y persistencia").
- Package manager is `pnpm`, never `npm install`.
- No comments explaining _what_ code does — only non-obvious _why_, matching this repo's existing style (see `HomeExperience.tsx` for the tone/length expected).

---

### Task 1: `useFeedTourSeen` hook

**Files:**

- Create: `src/features/onboarding/hooks/useFeedTourSeen.ts`
- Test: `src/features/onboarding/hooks/useFeedTourSeen.test.ts`

**Interfaces:**

- Consumes: nothing (only `window.localStorage`).
- Produces: `useFeedTourSeen(): { seen: boolean | null; markSeen: () => void }`. `seen === null` means "not resolved yet, don't render anything" (first client render, before the effect runs). `seen === false` means "not seen, eligible to show". `seen === true` means "already seen, don't show". `FeedTour` (Task 2) consumes this exact shape.

- [ ] **Step 1: Install `react-joyride`**

```bash
pnpm add react-joyride
```

If pnpm prints a peer-dependency warning about React versions (the library's peer range may lag React 19), that's expected — it's a warning, not an install failure. Confirm the install actually succeeded:

```bash
grep '"react-joyride"' package.json
```

- [ ] **Step 2: Write the failing test**

```typescript
// src/features/onboarding/hooks/useFeedTourSeen.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFeedTourSeen } from './useFeedTourSeen';

const TOUR_KEY = 'ag-feed-fab-tour-seen';

beforeEach(() => {
  window.localStorage.clear();
});

describe('useFeedTourSeen', () => {
  it('resuelve a no-visto cuando no hay flag en localStorage', async () => {
    const { result } = renderHook(() => useFeedTourSeen());

    await waitFor(() => expect(result.current.seen).toBe(false));
  });

  it('resuelve a visto cuando el flag ya está en localStorage', async () => {
    window.localStorage.setItem(TOUR_KEY, '1');
    const { result } = renderHook(() => useFeedTourSeen());

    await waitFor(() => expect(result.current.seen).toBe(true));
  });

  it('markSeen persiste el flag y actualiza el estado', async () => {
    const { result } = renderHook(() => useFeedTourSeen());
    await waitFor(() => expect(result.current.seen).toBe(false));

    act(() => result.current.markSeen());

    expect(result.current.seen).toBe(true);
    expect(window.localStorage.getItem(TOUR_KEY)).toBe('1');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm exec vitest run src/features/onboarding/hooks/useFeedTourSeen.test.ts`
Expected: FAIL — `useFeedTourSeen` module not found.

- [ ] **Step 4: Write minimal implementation**

```typescript
// src/features/onboarding/hooks/useFeedTourSeen.ts
'use client';

import { useCallback, useEffect, useState } from 'react';

const TOUR_KEY = 'ag-feed-fab-tour-seen';

/**
 * Igual patrón que `HomeExperience`: se resuelve en un efecto (localStorage)
 * para no arriesgar un mismatch de hidratación, así que hay un frame donde
 * `seen` es `null`.
 */
export function useFeedTourSeen(): {
  seen: boolean | null;
  markSeen: () => void;
} {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    const alreadySeen = window.localStorage.getItem(TOUR_KEY) === '1';
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resolución única del check de localStorage, no un update en cascada
    setSeen(alreadySeen);
  }, []);

  const markSeen = useCallback(() => {
    window.localStorage.setItem(TOUR_KEY, '1');
    setSeen(true);
  }, []);

  return { seen, markSeen };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run src/features/onboarding/hooks/useFeedTourSeen.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/features/onboarding/hooks/useFeedTourSeen.ts src/features/onboarding/hooks/useFeedTourSeen.test.ts
git commit -m "feat: add useFeedTourSeen hook for onboarding tour persistence"
```

---

### Task 2: `FeedTour` component

**Files:**

- Create: `src/features/onboarding/components/FeedTour.tsx`
- Test: `src/features/onboarding/components/FeedTour.test.tsx`

**Interfaces:**

- Consumes: `useFeedTourSeen()` from Task 1 (`{ seen: boolean | null; markSeen: () => void }`), `useMediaQuery(query: string): boolean` from `@/shared/hooks/useMediaQuery`.
- Produces: `FeedTour({ forceClose }: { forceClose: boolean }): JSX.Element | null`. `forceClose` is `true` while the caller wants the tour hidden regardless of tour state (Task 3 passes the `QuickReviewModal`'s `open` state here).

- [ ] **Step 1: Write the failing test**

```typescript
// src/features/onboarding/components/FeedTour.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { FeedTour } from './FeedTour';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

vi.mock('@/shared/hooks/useMediaQuery');

const mockJoyrideProps = vi.fn();
vi.mock('react-joyride', () => ({
  default: (props: { callback: (data: { status: string }) => void }) => {
    mockJoyrideProps(props);
    return <div data-testid="joyride-mock" />;
  },
}));

const TOUR_KEY = 'ag-feed-fab-tour-seen';

beforeEach(() => {
  window.localStorage.clear();
  mockJoyrideProps.mockClear();
  vi.mocked(useMediaQuery).mockReturnValue(true);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('FeedTour', () => {
  it('no renderiza en desktop', () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    render(<FeedTour forceClose={false} />);
    act(() => vi.advanceTimersByTime(600));

    expect(screen.queryByTestId('joyride-mock')).not.toBeInTheDocument();
  });

  it('no renderiza si ya fue visto', () => {
    window.localStorage.setItem(TOUR_KEY, '1');
    render(<FeedTour forceClose={false} />);
    act(() => vi.advanceTimersByTime(600));

    expect(screen.queryByTestId('joyride-mock')).not.toBeInTheDocument();
  });

  it('renderiza tras el delay en mobile sin visto previo', () => {
    render(<FeedTour forceClose={false} />);
    expect(screen.queryByTestId('joyride-mock')).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(600));

    expect(screen.getByTestId('joyride-mock')).toBeInTheDocument();
  });

  it('marca visto y se oculta cuando forceClose pasa a true', () => {
    const { rerender } = render(<FeedTour forceClose={false} />);
    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByTestId('joyride-mock')).toBeInTheDocument();

    rerender(<FeedTour forceClose />);

    expect(screen.queryByTestId('joyride-mock')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(TOUR_KEY)).toBe('1');
  });

  it('marca visto cuando joyride reporta finished', () => {
    render(<FeedTour forceClose={false} />);
    act(() => vi.advanceTimersByTime(600));

    const lastProps = mockJoyrideProps.mock.calls.at(-1)![0];
    act(() => lastProps.callback({ status: 'finished' }));

    expect(window.localStorage.getItem(TOUR_KEY)).toBe('1');
  });

  it('marca visto cuando joyride reporta skipped', () => {
    render(<FeedTour forceClose={false} />);
    act(() => vi.advanceTimersByTime(600));

    const lastProps = mockJoyrideProps.mock.calls.at(-1)![0];
    act(() => lastProps.callback({ status: 'skipped' }));

    expect(window.localStorage.getItem(TOUR_KEY)).toBe('1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/features/onboarding/components/FeedTour.test.tsx`
Expected: FAIL — `FeedTour` module not found.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/features/onboarding/components/FeedTour.tsx
'use client';

import { forwardRef, useEffect, useState } from 'react';
import Joyride, { type CallBackProps, type Step } from 'react-joyride';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { useFeedTourSeen } from '../hooks/useFeedTourSeen';

const STEPS: Step[] = [
  {
    target: '[data-tour="feed-fab"]',
    content: 'Clickeá el alfajor flotante para hacer una reseña rápido.',
    placement: 'top',
  },
];

const SHOW_DELAY_MS = 600;

/**
 * Reemplaza el beacon default de Joyride por `.pulse-dot`, ya usada en el
 * resto de la app, para no meter una segunda animación de "atención acá".
 */
const TourBeacon = forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(function TourBeacon(props, ref) {
  return (
    <span
      ref={ref}
      {...props}
      className="pulse-dot bg-curry block h-4 w-4 rounded-full"
    />
  );
});

/**
 * Tour de un solo paso apuntando al `ReviewFab`, mobile only. `forceClose`
 * lo cierra y lo marca visto cuando el caller (el propio FAB) abre el
 * quick-review — el objetivo del tour ya se cumplió, no hace falta que el
 * usuario interactúe con el tooltip.
 */
export function FeedTour({ forceClose }: { forceClose: boolean }) {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const { seen, markSeen } = useFeedTourSeen();
  const [ready, setReady] = useState(false);

  const eligible = isMobile && seen === false;

  useEffect(() => {
    if (!eligible || forceClose) {
      setReady(false);
      return;
    }
    const id = setTimeout(() => setReady(true), SHOW_DELAY_MS);
    return () => clearTimeout(id);
  }, [eligible, forceClose]);

  useEffect(() => {
    if (forceClose && seen === false) markSeen();
  }, [forceClose, seen, markSeen]);

  if (!eligible || forceClose || !ready) return null;

  function handleCallback(data: CallBackProps) {
    if (data.status === 'finished' || data.status === 'skipped') {
      markSeen();
    }
  }

  return (
    <Joyride
      steps={STEPS}
      run
      continuous={false}
      showSkipButton={false}
      callback={handleCallback}
      locale={{ last: 'Entendido' }}
      beaconComponent={TourBeacon}
      styles={{
        options: {
          arrowColor: 'var(--color-blanco-tibio)',
          backgroundColor: 'var(--color-blanco-tibio)',
          textColor: 'var(--color-ink)',
          primaryColor: 'var(--color-curry)',
          overlayColor:
            'color-mix(in oklab, var(--color-ink) 55%, transparent)',
          zIndex: 60,
        },
      }}
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/features/onboarding/components/FeedTour.test.tsx`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/features/onboarding/components/FeedTour.tsx src/features/onboarding/components/FeedTour.test.tsx
git commit -m "feat: add FeedTour spotlight component for the FAB onboarding step"
```

---

### Task 3: Wire `FeedTour` into `ReviewFab`

**Files:**

- Modify: `src/features/feed/components/ReviewFab.tsx`

**Interfaces:**

- Consumes: `FeedTour` from Task 2 (`{ forceClose: boolean }`).
- Produces: nothing new — this task only wires existing pieces together.

- [ ] **Step 1: Add the `data-tour` marker to the FAB button and render `FeedTour`**

In `src/features/feed/components/ReviewFab.tsx`, add the import:

```typescript
import { FeedTour } from '@/features/onboarding/components/FeedTour';
```

Add `data-tour="feed-fab"` to the `motion.button` (alongside the existing `aria-label`):

```tsx
        <motion.button
          ref={btnRef}
          type="button"
          aria-label="Reseñar un alfajor"
          data-tour="feed-fab"
          drag
```

Render `FeedTour` right after the closing `</div>` of the button layer, before `QuickReviewModal`:

```tsx
      </div>

      <FeedTour forceClose={open} />

      <QuickReviewModal open={open} onOpenChange={setOpen} />
```

- [ ] **Step 2: Manually verify no existing FAB test breaks**

Run: `pnpm exec vitest run src/features/feed/components/ReviewFab.test.tsx`
Expected: PASS. If `ReviewFab.test.tsx` doesn't exist yet, skip this step — there's nothing to break.

- [ ] **Step 3: Run the full test suite for a sanity check**

Run: `pnpm test`
Expected: all tests PASS, coverage still ≥ 85%.

- [ ] **Step 4: Commit**

```bash
git add src/features/feed/components/ReviewFab.tsx
git commit -m "feat: show the onboarding tour from the FAB on first mobile visit"
```

---

### Task 4: Document the new feature in `docs/architecture.md`

**Files:**

- Modify: `docs/architecture.md`

**Interfaces:**

- Consumes: nothing.
- Produces: nothing — documentation only.

- [ ] **Step 1: Add `onboarding` to the feature tree**

In `docs/architecture.md`, inside the `## Estructura completa` tree under `features/`, add an entry near the other small features (find the `features/` block starting around line 43 and insert after the `auth/` block, before `alfajores/`):

```
│   ├── onboarding/
│   │   ├── components/
│   │   │   └── FeedTour.tsx              # spotlight de 1 paso apuntando al FAB, mobile only
│   │   └── hooks/
│   │       └── useFeedTourSeen.ts        # persistencia en localStorage
│   │
```

- [ ] **Step 2: Commit**

```bash
git add docs/architecture.md
git commit -m "docs: document the onboarding feature in architecture.md"
```
