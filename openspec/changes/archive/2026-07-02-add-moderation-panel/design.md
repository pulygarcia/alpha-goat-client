## Context

The backend moderation module is complete (`ModerationController`, ADMIN-gated): `GET /admin/alfajores/pending` (paginated, reuses `SearchAlfajoresDto`/`PaginatedAlfajoresDto`), `PATCH /admin/alfajores/:id/approve`, `PATCH /admin/alfajores/:id/reject` with `{ rejectionReason: 1–500 }`. The front already exposes `user.role` via `useCurrentUser` and gates admin UI with `user?.role === 'ADMIN'` (see `AlfajorImageUploader`). The `(app)` route group provides the shared layout (`AppHeader` + `ReviewFab`).

## Goals / Non-Goals

**Goals:**
- Admin-only `/admin` page with the PENDING queue and approve/reject actions.
- Non-admins get the visual not-found (route existence not revealed).
- Discoverable entry point for admins (avatar dropdown link).

**Non-Goals:**
- Moderation history, alfajor/marca editing, proposer notifications, Edge middleware gating (see proposal).

## Decisions

- **New feature folder `src/features/moderation/`** rather than growing `features/alfajores`: moderation has its own API surface, guard and components; alfajores types are imported, not duplicated.
  - `api/moderation.api.ts`: `getPending({ page, limit })`, `approve(id)`, `reject(id, rejectionReason)`.
  - `hooks/useModerationQueue.ts`: `useQuery(['admin', 'pending', { page }])`.
  - `hooks/useModerateAlfajor.ts`: single mutation hook taking `{ id, action: 'approve' } | { id, action: 'reject', rejectionReason }`; `onSuccess` invalidates `['admin', 'pending']` and fires `notifySuccess`; errors go to `notifyError`.
  - `schemas/rejectAlfajor.schema.ts`: Zod, `rejectionReason` trimmed 1–500 chars.
  - `components/`: `AdminGuard`, `ModerationQueue`, `PendingAlfajorCard`, `RejectAlfajorDialog`.
- **Simple invalidation over optimistic update** (alternative considered: optimistic removal with rollback as in likes/follows). A single-admin queue gains nothing from optimism; invalidation avoids snapshot/rollback/`total` bookkeeping. Buttons disable via `isPending` while a mutation is in flight.
- **Client-side guard rendering the not-found UI** (alternatives: Edge middleware — can't read the role from the HttpOnly JWT without verifying it; redirect to /feed — reveals the route). While `useCurrentUser` loads, render a skeleton; if anonymous or non-admin, render the same visual as the app 404. The backend still enforces with 401/403, so the client guard is UX, not security.
- **Classic page pagination with prev/next buttons** (like `RankingList`), not infinite scroll: a moderation queue is short-lived and operated deliberately.
- **Reject reason in a `Dialog`** (shadcn) with RHF+Zod, opened per card; approve is a direct button. Mirrors `ProposeAlfajorModal` patterns.
- **409-like conflicts**: a 400 from approve/reject (alfajor no longer PENDING) shows a specific toast and invalidates the queue so the stale card disappears.

## Risks / Trade-offs

- [Client guard is bypassable] → acceptable: all data/actions require the ADMIN JWT server-side; the guard only shapes UX.
- [Invalidation refetch may flash the list] → keep `placeholderData: keepPreviousData` on the queue query so the list doesn't blank between pages/refetches.
- [Front `Alfajor` type may not include `status`/`rejectionReason`/`createdById`] → verify `features/alfajores/types` against `AlfajorResponseDto` during implementation and extend additively if missing.
