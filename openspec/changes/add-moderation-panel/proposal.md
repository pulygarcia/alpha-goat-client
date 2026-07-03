## Why

Users can propose alfajores (`POST /alfajores` → PENDING) since PR client #34, but the only way to approve or reject them today is hitting the backend moderation endpoints by hand (Swagger/curl). The moderation loop needs a UI so proposed alfajores actually make it into the catalog.

## What Changes

- New feature `src/features/moderation/` (new feature folder): queue of PENDING alfajores with approve/reject actions.
- New route `src/app/(app)/admin/page.tsx` (thin page, inherits the `(app)` layout with `AppHeader`).
- Client-side admin guard: non-admins (or anonymous) see the visual not-found — the route does not reveal it exists. The backend already enforces ADMIN with 401/403.
- Reject flow captures a `rejectionReason` (1–500 chars) in a dialog before submitting.
- "Moderación" link in the avatar dropdown of `AppHeader`, rendered only for admins.
- List behavior on moderate: simple invalidation of the queue query (no optimistic update) + success/error toasts.

## Capabilities

### New Capabilities

- `moderation-panel`: admin-only queue at `/admin` listing PENDING alfajores with paginated navigation, approve and reject-with-reason actions, and non-admin 404 gating.

### Modified Capabilities

<!-- none: no existing spec's requirements change -->

## Impact

- **Feature touched**: new `src/features/moderation/`; small edit to `AppHeader` (avatar menu link); new route under `src/app/(app)/admin/`.
- **Backend endpoints (all already exist**, `ModerationController`, ADMIN-gated):
  - `GET /admin/alfajores/pending?page&limit` → `PaginatedAlfajoresDto`
  - `PATCH /admin/alfajores/:id/approve`
  - `PATCH /admin/alfajores/:id/reject` body `{ rejectionReason: string (1–500) }`
- Reuses `Alfajor` types from `features/alfajores/types` and the `user?.role === 'ADMIN'` gating pattern from `AlfajorImageUploader`.

## Non-goals

- Moderation history (APPROVED/REJECTED views) — would need backend work.
- Editing alfajores/marcas from the panel.
- Notifying the proposer of the outcome (arrives with the future `notifications`/Resend module).
- Edge middleware protection for `/admin` (JWT is HttpOnly; client guard + backend 403 is enough).
