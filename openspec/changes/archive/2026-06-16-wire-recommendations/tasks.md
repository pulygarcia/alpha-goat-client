## 1. Backend contract (alfajorimetro-back) — DONE

- [x] 1.1 `GET /recommendations` is live on `main` (PR #2, merged from `feat/recommendations`).
  Auth-only (JWT cookie), query `limit` 1..20 default 6. Returns `RecommendationItemDto[]`:
  `{ id, nombre, tipo, matchPct: number|null, score, marca: { id, nombre, logoUrl } }`.
  `matchPct` is `null` on cold start (user with no taste fingerprint). 15 tests green.

## 2. Frontend types

- [x] 2.1 Create `src/features/recommendations/types/recommendations.types.ts` with
  `RecommendationItem` matching the DTO. Document that `matchPct` is `null` on cold start and
  `score` is internal ordering only (not rendered).

## 3. Recommendations feature — api and hook

- [x] 3.1 Create `src/features/recommendations/api/recommendations.api.ts` with
  `list(limit?)` → `GET /recommendations` (pass `limit` as query param when provided).
- [x] 3.2 Create `src/features/recommendations/hooks/useRecommendations.ts`: TanStack Query
  keyed `['recommendations', { limit }]`, `enabled: !!user` (read `user` from `useAuthStore`),
  `staleTime` ~5 min (taste profile changes slowly). Guests never trigger the request.
- [x] 3.3 Add `useRecommendations.test.ts` (mock `recommendations.api` + auth store): returns
  data when authenticated, does NOT call the api when there is no user, surfaces error state.

## 4. RecommendedForYou component

- [x] 4.1 Create `src/features/recommendations/components/RecommendedForYou.tsx` (`'use client'`):
  mirrors the `WeeklyRanking` rail block. Renders the section heading, a loading skeleton,
  an error message, an empty state, and a row per item (name, marca, affinity). When
  `matchPct === null` it omits the percentage (cold start) rather than showing "null%".
  Returns `null` when there is no authenticated user.
- [x] 4.2 Add `RecommendedForYou.test.tsx` (mock the hook + auth store): renders rows with
  affinity, omits the figure on `matchPct: null`, shows error and empty states, renders
  nothing for a guest.

## 5. Integrate into the rail

- [x] 5.1 In `src/features/feed/components/FeedRail.tsx` replace the
  `PendingSection("Recomendado para vos", …)` with `<RecommendedForYou />`. Drop
  `PendingSection` if it becomes unused.

## 6. Verify and close

- [x] 6.1 `npm run lint` and `npm run test` green. New code covered (api wrapper mocked in the
  hook test; hook + component covered). Note coverage-neutrality vs the pre-existing 85% gate.
- [x] 6.2 Update `docs/progress.md` (rail "Recomendado para vos" wired to `GET /recommendations`).
- [x] 6.3 Archive the change once implemented and verified; sync the delta spec to
  `openspec/specs/feed-recommendations/spec.md`.
