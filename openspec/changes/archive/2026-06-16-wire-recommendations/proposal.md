## Why

The feed rail already ships two connected blocks ("Ranking semanal" and "Marcas en
foco") plus a third, "Recomendado para vos", that is still a static `PendingSection`
placeholder. The backend now exposes the missing endpoint: `GET /recommendations`
(auth-only) landed on `alfajorimetro-back@main` (PR #2, `feat/recommendations`), returning
content-based taste matches for the authenticated user. This change wires the rail block to
that endpoint so the recommendation surface is live, completing the rail (sprint goal "trozo
4 — rail").

## What Changes

- New `recommendations` feature in the frontend (`src/features/recommendations/`):
  - `recommendations.api.ts` wrapping `GET /recommendations` (optional `limit`, default 6).
  - `useRecommendations` hook (TanStack Query). The endpoint is auth-only, so the query is
    **gated on session presence** (`enabled: !!user` from the auth store) — guests never fire it.
  - `RecommendedForYou` component: loading skeleton, error and empty states, mirroring the
    `WeeklyRanking` rail block visual language. Handles `matchPct: null` (cold start) by
    omitting the affinity figure instead of rendering "null%".
  - `recommendations.types.ts` typing the `RecommendationItem` contract.
- Replace the `PendingSection("Recomendado para vos", …)` placeholder in
  `src/features/feed/components/FeedRail.tsx` with `<RecommendedForYou />`.
- The block renders **only for authenticated users** (no recommendations make sense for a
  guest); for guests it renders nothing, keeping the rail clean.

## Capabilities

### New Capabilities
- `feed-recommendations`: the rail's "Recomendado para vos" block, fed by `GET /recommendations`,
  including the auth gating, cold-start handling, and the loading/error/empty UI states.

### Modified Capabilities
<!-- No existing OpenSpec spec covers the feed rail; nothing to modify. -->

## Impact

- **Frontend (alphagoat-client)**: new `src/features/recommendations/` (api, hooks, components,
  types) + sibling tests; `src/features/feed/components/FeedRail.tsx` (swap placeholder for the
  live block); `docs/progress.md`.
- **Backend (alfajorimetro-back)**: none — `GET /recommendations` already exists on `main`
  (auth, `limit` 1..20 default 6, returns `RecommendationItemDto[]` with
  `{ id, nombre, tipo, matchPct: number|null, score, marca: { id, nombre, logoUrl } }`).
- **Non-goals**: the full `recommendations` page beyond the rail; surfacing `score` in the UI
  (internal ordering only); pagination/infinite scroll; recommendations for guests.
