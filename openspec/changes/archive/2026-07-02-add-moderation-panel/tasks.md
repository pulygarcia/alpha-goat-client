## 1. Data layer

- [x] 1.1 Verify `features/alfajores/types` covers `AlfajorResponseDto` fields used by the panel (`status`, `rejectionReason`, `createdById`, `createdAt`); extend additively if missing
- [x] 1.2 Create `features/moderation/api/moderation.api.ts` (`getPending`, `approve`, `reject`) + `moderation.api.test.ts`
- [x] 1.3 Create `hooks/useModerationQueue.ts` (query `['admin','pending',{page}]`, `keepPreviousData`) + test
- [x] 1.4 Create `hooks/useModerateAlfajor.ts` (approve/reject mutation, invalidation, toasts, 400-conflict toast) + test
- [x] 1.5 Create `schemas/rejectAlfajor.schema.ts` (reason trimmed 1–500) + test

## 2. Components

- [x] 2.1 Create `components/AdminGuard.tsx` (skeleton while loading, not-found visual for non-admin/anonymous) + test
- [x] 2.2 Create `components/PendingAlfajorCard.tsx` (data + Aprobar/Rechazar, disabled while pending) + test
- [x] 2.3 Create `components/RejectAlfajorDialog.tsx` (RHF+Zod reason form, inline errors) + test
- [x] 2.4 Create `components/ModerationQueue.tsx` (list, pagination prev/next, loading/empty/error states) + test

## 3. Wiring

- [x] 3.1 Create thin page `src/app/(app)/admin/page.tsx` composing `AdminGuard` + `ModerationQueue`
- [x] 3.2 Add admin-only "Moderación" item to the avatar dropdown in `AppHeader` + test

## 4. Verification & docs

- [x] 4.1 Run `npm run test:coverage` (≥85% all metrics), `npm run lint`, `npx tsc --noEmit`
- [x] 4.2 Manual check in browser with an admin and a regular user
- [x] 4.3 Update `docs/architecture.md` (new feature) and `docs/decisions.md` if any non-obvious decision emerged; review `docs/progress.md`/README per repo docs rule
