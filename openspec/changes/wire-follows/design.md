## Context

The backend exposes follow actions only (`PUT/DELETE /follows/:userId`, both `204`),
with no read of follow state. The feed (`GET /feed`) returns an `author` object per item
but no `isFollowing` flag, and `GET /users/:id` (`UserResponseDto`) likewise omits it.
The frontend `follows` feature does not exist yet. The first surface that needs a follow
control is the author block of `ReviewRow` in the feed.

This is a cross-repo change: the frontend optimistic toggle has nothing to hydrate from
until the backend marks each author with `isFollowing`. The backend contract change is a
prerequisite, but the frontend types and UI are designed against it here.

## Goals / Non-Goals

**Goals:**
- A reusable `FollowButton` that reflects real state (`Seguir` / `Siguiendo`) and survives reloads.
- Optimistic toggle with rollback on error and correct TanStack Query cache reconciliation.
- A clean `follows` feature slice that other surfaces (future profile page) can reuse.
- Backend exposes `isFollowing` per author/user as the source of truth.

**Non-Goals:**
- Followers/following list views, profile page, follow notifications.
- Showing follow counts anywhere beyond an optional inline `followersCount`.
- Changing the `scope=following` feed filter (already implemented).

## Decisions

### Decision 1: Source of truth is a per-author `isFollowing` from the backend
The backend computes `isFollowing` against the authenticated user and includes it on the
feed item `author` and on `GET /users/:id`. For anonymous requests it is `false`.

- **Why**: The button must render correct state on first paint and after reload. A purely
  client-side optimistic flag loses state on refresh and cannot be trusted.
- **Alternative considered**: A bulk `GET /follows/me` returning followed user ids, queried
  once and intersected client-side. Rejected: extra round trip, cache-coherence burden, and
  it still misses users not in that set. Co-locating the flag with the author is simplest.

### Decision 2: One `useToggleFollow` mutation, keyed by `userId`, with optimistic cache writes
A single hook exposes `toggle(userId, currentlyFollowing)` (or `follow`/`unfollow`). On
mutate it cancels in-flight feed queries, snapshots the cache, and flips `isFollowing` (and
`followersCount` if present) for every cached author matching `userId` across the infinite
feed pages. On error it restores the snapshot; on settle it invalidates the affected queries.

- **Why**: The same author can appear in multiple feed rows/pages — a single source flip keeps
  every instance consistent. Optimistic write gives instant feedback; invalidate-on-settle
  reconciles with the server.
- **Alternative considered**: Local component state in `FollowButton`. Rejected: duplicate
  authors would diverge and state would not persist across remounts.

### Decision 3: `FollowButton` is a `'use client'` leaf; data flows in via props
`FollowButton` receives `userId`, `isFollowing`, and (optional) the author's display context.
It calls `useToggleFollow`. It renders nothing when `userId === currentUser.id` (read from the
existing auth context/`useCurrentUser`). `ReviewRow` stays a presentational component and just
places the button in the author block.

- **Why**: Matches the project rule — only the interactive leaf is a client component; never
  call the API from a component (the button uses the hook, the hook uses `follows.api.ts`).

### Decision 4: Feature location `src/features/follows/`
`follows.api.ts`, `hooks/useToggleFollow.ts`, `components/FollowButton.tsx`, `types/`. It is a
distinct domain from `feed`; `feed` only consumes `FollowButton`. If a second consumer appears
later it already lives in its own slice (not promoted to `shared/` until used by 2+ features —
for now a cross-feature import from `feed` into `follows` is acceptable and expected).

## Risks / Trade-offs

- **Backend prerequisite not yet merged** → Frontend types include `isFollowing` as required;
  until the backend ships it, the field is absent and the button would treat `undefined` as
  `false`. Mitigation: type it and guard for `undefined`; land backend first or in the same PR.
- **Optimistic flip across infinite-query pages can miss a cache shape edge case** → Mitigation:
  iterate all pages' `items`, match by `author.id`, and always invalidate on settle so the
  server response is authoritative.
- **Double-clicks / rapid toggling** → Mitigation: disable the button while the mutation for
  that `userId` is in flight (`isPending`).
- **Self-follow** → Mitigation: backend rejects it; frontend additionally hides the button for
  the current user.

## Migration Plan

1. Land the backend additive field (`isFollowing`, optional `followersCount`) — additive, no
   breaking removal, safe to deploy independently.
2. Ship the frontend feature consuming it. Rollback is trivial (remove `FollowButton` from
   `ReviewRow`); the backend field can stay unused.

## Open Questions

- Do we display `followersCount` inline in this iteration, or defer to the profile page?
  (Proposal marks it optional; default is to skip rendering it for now.)
