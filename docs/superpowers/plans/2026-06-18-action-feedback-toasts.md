# Action Feedback Toasts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Toda mutation de la app da feedback de éxito/error vía un toaster compartido (Sonner), y los errores de formulario se muestran inline + toast.

**Architecture:** Un único `<Toaster />` montado en `app/layout.tsx`. Las features no importan `sonner` directo: usan el helper `src/shared/lib/toast.ts` (`notifySuccess`/`notifyError`). Los toasts se disparan desde los `onSuccess`/`onError` de cada mutation hook, no desde los componentes. Los errores de validación de form siguen inline (RHF/Zod); el toast de error lo agrega el `onError` del hook de la mutation.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, Tailwind v4, TanStack Query, shadcn/ui, Sonner, Vitest + React Testing Library.

## Global Constraints

- TypeScript strict; imports absolutos con alias `@/` desde `src/`.
- shadcn primitives viven en `src/shared/components/ui`; **no testear** `shared/components/ui/**`.
- Hooks customizados y componentes con lógica tienen `.test.ts(x)` hermano; mockear el módulo del que dependen, nunca la red.
- Test behavior, not implementation.
- Conventional commits (`feat:`, `test:`, `chore:`, `docs:`); commits chicos y atómicos.
- Coverage ≥ 85% (branches/functions/lines/statements) — `npm run test:coverage`.
- Mensajes de toast en español (voz del producto), copy exacto el de cada tarea.

---

### Task 1: Sonner primitive, Toaster mount y helper `toast`

**Files:**
- Install: `sonner` (dependency)
- Create: `src/shared/components/ui/sonner.tsx`
- Create: `src/shared/lib/toast.ts`
- Test: `src/shared/lib/toast.test.ts`
- Modify: `src/app/layout.tsx` (montar `<Toaster />` dentro del `<body>`, dentro de `QueryProvider`)

**Interfaces:**
- Consumes: nada.
- Produces:
  - `notifySuccess(message: string): void`
  - `notifyError(message: string): void`
  (ambos desde `@/shared/lib/toast`)
  - `<Toaster />` (default export-less named) desde `@/shared/components/ui/sonner`

- [ ] **Step 1: Instalar sonner**

Run: `npm install sonner`
Expected: `sonner` agregado a `dependencies` en `package.json`, sin errores.

- [ ] **Step 2: Escribir el test del helper (falla)**

Create `src/shared/lib/toast.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import { notifySuccess, notifyError } from './toast';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('toast helper', () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockReset();
    vi.mocked(toast.error).mockReset();
  });

  it('notifySuccess delega en toast.success con el mensaje', () => {
    notifySuccess('Reseña publicada');
    expect(toast.success).toHaveBeenCalledWith('Reseña publicada');
  });

  it('notifyError delega en toast.error con el mensaje', () => {
    notifyError('Algo falló');
    expect(toast.error).toHaveBeenCalledWith('Algo falló');
  });
});
```

- [ ] **Step 3: Correr el test para verificar que falla**

Run: `npm run test -- src/shared/lib/toast.test.ts`
Expected: FAIL — `notifySuccess`/`notifyError` no existen (módulo `./toast` no encontrado).

- [ ] **Step 4: Implementar el helper**

Create `src/shared/lib/toast.ts`:

```ts
import { toast } from 'sonner';

/** Notificación de éxito compartida. Las features usan esto, no `sonner` directo. */
export function notifySuccess(message: string): void {
  toast.success(message);
}

/** Notificación de error compartida. */
export function notifyError(message: string): void {
  toast.error(message);
}
```

- [ ] **Step 5: Correr el test para verificar que pasa**

Run: `npm run test -- src/shared/lib/toast.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Crear el primitivo Toaster con tokens cream**

Create `src/shared/components/ui/sonner.tsx`:

```tsx
'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * Toaster compartido ("El Diario"): posición top-center, estilos atados a los
 * tokens cream del design system vía CSS vars de Sonner.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      toastOptions={{
        style: {
          background: 'var(--color-bg)',
          color: 'var(--color-curry)',
          border: '1px solid var(--color-cinnamon)',
        },
      }}
    />
  );
}
```

- [ ] **Step 7: Montar el Toaster en el layout**

Modify `src/app/layout.tsx` — importar y montar `<Toaster />` dentro de `QueryProvider`, después de `AuthProvider`:

```tsx
import { Toaster } from '@/shared/components/ui/sonner';
```

En el `<body>`:

```tsx
<QueryProvider>
  <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
  <Toaster />
</QueryProvider>
```

- [ ] **Step 8: Verificar typecheck/build y lint**

Run: `npm run lint && npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json src/shared/lib/toast.ts src/shared/lib/toast.test.ts src/shared/components/ui/sonner.tsx src/app/layout.tsx
git commit -m "feat: add shared toast helper and mount Sonner toaster"
```

---

### Task 2: Toasts en `useSubmitReview` (success por modo + error) — cubre el inline+toast del form

**Files:**
- Modify: `src/features/reviews/hooks/useSubmitReview.ts`
- Test: `src/features/reviews/hooks/useSubmitReview.test.ts`

**Interfaces:**
- Consumes: `notifySuccess`, `notifyError` de `@/shared/lib/toast`.
- Produces: nada nuevo (mismo `useSubmitReview(alfajorId)`).

Nota: el detalle de validación de campo ya es inline en `ReviewWizardForm` (RHF/Zod) y no se toca. Este `onError` agrega el toast genérico → el form queda **inline + toast**.

- [ ] **Step 1: Agregar al test el caso de toasts (falla)**

En `src/features/reviews/hooks/useSubmitReview.test.ts`, agregar el mock del helper arriba y estos tests (ajustar el `setup`/wrapper al patrón existente del archivo; mockear `../api/reviews.api` como ya se hace):

```ts
import { notifySuccess, notifyError } from '@/shared/lib/toast';

vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

// dentro del describe:
it('notifica éxito "Reseña publicada" al crear', async () => {
  vi.mocked(reviewsApi.create).mockResolvedValue(/* review fixture */ {} as never);
  const { result } = setup(); // wrapper con QueryClient, igual que el resto del archivo
  act(() => {
    result.current.mutate({ mode: 'create', input: createInput });
  });
  await waitFor(() =>
    expect(notifySuccess).toHaveBeenCalledWith('Reseña publicada'),
  );
});

it('notifica éxito "Reseña actualizada" al editar', async () => {
  vi.mocked(reviewsApi.update).mockResolvedValue({} as never);
  const { result } = setup();
  act(() => {
    result.current.mutate({ mode: 'edit', reviewId: 'r1', input: updateInput });
  });
  await waitFor(() =>
    expect(notifySuccess).toHaveBeenCalledWith('Reseña actualizada'),
  );
});

it('notifica error cuando la mutation falla', async () => {
  vi.mocked(reviewsApi.create).mockRejectedValue(new Error('boom'));
  const { result } = setup();
  act(() => {
    result.current.mutate({ mode: 'create', input: createInput });
  });
  await waitFor(() =>
    expect(notifyError).toHaveBeenCalledWith('No pudimos publicar la reseña'),
  );
});
```

(`createInput`/`updateInput` = fixtures mínimos válidos según `CreateReviewInput`/`UpdateReviewInput`.)

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test -- src/features/reviews/hooks/useSubmitReview.test.ts`
Expected: FAIL — `notifySuccess`/`notifyError` no se llaman.

- [ ] **Step 3: Implementar los toasts en el hook**

Modify `src/features/reviews/hooks/useSubmitReview.ts` — importar el helper y disparar en `onSuccess`/`onError`. `onSuccess` recibe `(data, variables)`; ramificar por `variables.mode`:

```ts
import { notifySuccess, notifyError } from '@/shared/lib/toast';

// ...
  return useMutation({
    mutationFn: (payload: SubmitReviewPayload) =>
      payload.mode === 'create'
        ? reviewsApi.create(payload.input)
        : reviewsApi.update(payload.reviewId, payload.input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: alfajorReviewsKey(alfajorId) });
      qc.invalidateQueries({ queryKey: ['alfajores', 'detail', alfajorId] });
      notifySuccess(
        variables.mode === 'create' ? 'Reseña publicada' : 'Reseña actualizada',
      );
    },
    onError: () => {
      notifyError('No pudimos publicar la reseña');
    },
  });
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test -- src/features/reviews/hooks/useSubmitReview.test.ts`
Expected: PASS (incluye los tests previos del hook + los 3 nuevos).

- [ ] **Step 5: Commit**

```bash
git add src/features/reviews/hooks/useSubmitReview.ts src/features/reviews/hooks/useSubmitReview.test.ts
git commit -m "feat: toast feedback on review submit success/error"
```

---

### Task 3: Toast de error en `useToggleFollow` (solo error, tras rollback)

**Files:**
- Modify: `src/features/follows/hooks/useToggleFollow.ts:72-77` (bloque `onError`)
- Test: `src/features/follows/hooks/useToggleFollow.test.ts`

**Interfaces:**
- Consumes: `notifyError` de `@/shared/lib/toast`.
- Produces: nada nuevo.

Decisión: follow/unfollow es frecuente → **solo error**, sin toast de success.

- [ ] **Step 1: Agregar el test (falla)**

En `src/features/follows/hooks/useToggleFollow.test.ts`, agregar el mock y extender el test de rollback (o uno nuevo):

```ts
import { notifyError } from '@/shared/lib/toast';

vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

it('notifica error cuando falla el toggle', async () => {
  vi.mocked(followsApi.follow).mockRejectedValue(new Error('boom'));
  const { result } = setup(seedFeed([makeItem('1', 'u1', false)]));

  act(() => {
    result.current.mutate({ userId: 'u1', isFollowing: false });
  });

  await waitFor(() =>
    expect(notifyError).toHaveBeenCalledWith(
      'No pudimos actualizar el seguimiento',
    ),
  );
});

it('no notifica nada en éxito (acción silenciosa)', async () => {
  vi.mocked(followsApi.follow).mockResolvedValue();
  const { result, readFollowing } = setup(seedFeed([makeItem('1', 'u1', false)]));

  act(() => {
    result.current.mutate({ userId: 'u1', isFollowing: false });
  });

  await waitFor(() => expect(readFollowing()).toBe(true));
  expect(notifyError).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npm run test -- src/features/follows/hooks/useToggleFollow.test.ts`
Expected: FAIL — `notifyError` no se llama en el caso de error.

- [ ] **Step 3: Implementar el toast en `onError`**

Modify `src/features/follows/hooks/useToggleFollow.ts` — importar el helper y, dentro del `onError` existente (después del rollback), agregar la notificación:

```ts
import { notifyError } from '@/shared/lib/toast';

// ...
    onError: (_err, _vars, context) => {
      // Restaura exactamente el cache previo.
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      notifyError('No pudimos actualizar el seguimiento');
    },
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `npm run test -- src/features/follows/hooks/useToggleFollow.test.ts`
Expected: PASS (tests previos + 2 nuevos).

- [ ] **Step 5: Commit**

```bash
git add src/features/follows/hooks/useToggleFollow.ts src/features/follows/hooks/useToggleFollow.test.ts
git commit -m "feat: toast on follow toggle error"
```

---

### Task 4: Toasts en auth (`useLogin` error, `useRegister` success+error, `useLogout` error)

**Files:**
- Modify: `src/features/auth/hooks/useLogin.ts`
- Modify: `src/features/auth/hooks/useRegister.ts`
- Modify: `src/features/auth/hooks/useLogout.ts`
- Test: `src/features/auth/hooks/useLogin.test.ts`, `useRegister.test.ts`, `useLogout.test.ts` (crear los que no existan, siguiendo el patrón de `useToggleFollow.test.ts`: QueryClient wrapper + mock de `../api/auth.api` + mock de `next/navigation` `useRouter`/`useSearchParams`)

**Interfaces:**
- Consumes: `notifySuccess`, `notifyError` de `@/shared/lib/toast`.
- Produces: nada nuevo.

Decisiones: login → success silencioso (ya redirige), error toast. register → success "Cuenta creada" + error. logout → silencioso en éxito, error toast.

- [ ] **Step 1: Tests de auth (fallan)**

Agregar el mock del helper a cada archivo de test:

```ts
vi.mock('@/shared/lib/toast', () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));
```

Y los casos (uno por hook):

```ts
// useLogin.test.ts
it('notifica error cuando falla el login', async () => {
  vi.mocked(authApi.login).mockRejectedValue(new Error('401'));
  const { result } = setup();
  act(() => result.current.mutate({ email: 'a@b.com', password: 'x' }));
  await waitFor(() =>
    expect(notifyError).toHaveBeenCalledWith('No pudimos iniciar sesión'),
  );
});

// useRegister.test.ts
it('notifica "Cuenta creada" al registrarse', async () => {
  vi.mocked(authApi.register).mockResolvedValue({ user: userFixture } as never);
  const { result } = setup();
  act(() => result.current.mutate(registerInput));
  await waitFor(() => expect(notifySuccess).toHaveBeenCalledWith('Cuenta creada'));
});
it('notifica error cuando falla el registro', async () => {
  vi.mocked(authApi.register).mockRejectedValue(new Error('409'));
  const { result } = setup();
  act(() => result.current.mutate(registerInput));
  await waitFor(() =>
    expect(notifyError).toHaveBeenCalledWith('No pudimos crear la cuenta'),
  );
});

// useLogout.test.ts
it('notifica error cuando falla el logout', async () => {
  vi.mocked(authApi.logout).mockRejectedValue(new Error('boom'));
  const { result } = setup();
  act(() => result.current.mutate());
  await waitFor(() =>
    expect(notifyError).toHaveBeenCalledWith('No pudimos cerrar sesión'),
  );
});
```

(`setup()` = renderHook con QueryClientProvider + mocks de `next/navigation`; `userFixture`/`registerInput` mínimos válidos.)

- [ ] **Step 2: Correr y verificar que fallan**

Run: `npm run test -- src/features/auth/hooks`
Expected: FAIL en los casos nuevos.

- [ ] **Step 3: Implementar los toasts**

`useLogin.ts` — agregar `onError`:

```ts
import { notifyError } from '@/shared/lib/toast';
// dentro de useMutation, junto al onSuccess existente:
    onError: () => {
      notifyError('No pudimos iniciar sesión');
    },
```

`useRegister.ts` — `notifySuccess` al final del `onSuccess` + `onError`:

```ts
import { notifySuccess, notifyError } from '@/shared/lib/toast';
// onSuccess existente, al final:
      notifySuccess('Cuenta creada');
// y:
    onError: () => {
      notifyError('No pudimos crear la cuenta');
    },
```

`useLogout.ts` — agregar `onError` (el `onSettled` existente queda igual; en éxito no se notifica):

```ts
import { notifyError } from '@/shared/lib/toast';
    onError: () => {
      notifyError('No pudimos cerrar sesión');
    },
```

- [ ] **Step 4: Correr y verificar que pasan**

Run: `npm run test -- src/features/auth/hooks`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/hooks
git commit -m "feat: toast feedback on auth login/register/logout"
```

---

### Task 5: Cierre — suite completa, coverage y `docs/progress.md`

**Files:**
- Modify: `docs/progress.md`

- [ ] **Step 1: Correr la suite completa con coverage**

Run: `npm run test:coverage`
Expected: PASS, todos verdes, coverage ≥ 85% (branches/functions/lines/statements). Si `shared/lib/toast.ts` o algún hook baja el umbral, agregar el caso de test faltante.

- [ ] **Step 2: Lint + typecheck final**

Run: `npm run lint && npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Actualizar `docs/progress.md`**

Agregar a la sección correspondiente una línea: feature "Feedback de acciones (toasts)" — toaster Sonner compartido + helper `shared/lib/toast`, cableado en reviews (success/error), follow (solo error), auth (login error / register success+error / logout error). Errores de form: inline + toast.

- [ ] **Step 4: Commit**

```bash
git add docs/progress.md
git commit -m "docs: record action feedback toasts feature in progress"
```

---

## Notas de ejecución

- Toda mutation nueva a futuro debería disparar el helper desde su `onSuccess`/`onError` (patrón establecido acá).
- Like aún no tiene hook propio → fuera de alcance hasta que exista.
