## Why

The backend already supports following users (`PUT/DELETE /follows/:userId`) and the
feed can filter by `scope=following`, but the frontend has no way to follow anyone:
there is no button, and — more importantly — no endpoint currently returns whether
the current user already follows a given author. Without a source of truth the UI
cannot render a correct "Seguir" / "Siguiendo" state across reloads. This change adds
the follow capability end to end so users can actually build the graph that
`scope=following` depends on.

## What Changes

- **BREAKING (contract)** Backend `alfajorimetro-back` exposes follow state as a source
  of truth: add `isFollowing: boolean` to the feed item author and to `GET /users/:id`
  (`UserResponseDto`). Optionally add `followersCount: number` for display. `isFollowing`
  is computed against the authenticated user; for anonymous requests it is `false`.
- New `follows` feature in the frontend (`src/features/follows/`):
  - `follows.api.ts` wrapping `PUT /follows/:userId` (follow) and `DELETE /follows/:userId`
    (unfollow). Both return `204 No Content`.
  - `useToggleFollow` hook: optimistic update of the cached `isFollowing` flag, rollback
    on error, and cache invalidation of the affected queries (feed list, user detail).
  - `FollowButton` component with `Seguir` / `Siguiendo` states, in-flight (loading) and
    error handling. Hidden when the author is the current user.
- Integrate `FollowButton` into the `ReviewRow` author block in the feed.
- Frontend `FeedAuthor` / user types gain the `isFollowing` (and optional `followersCount`)
  field to match the new backend contract.

## Capabilities

### New Capabilities
- `user-follows`: following and unfollowing other users from the frontend, including the
  follow-state source of truth, optimistic toggle behavior, and the follow button UI.

### Modified Capabilities
<!-- No existing OpenSpec specs in openspec/specs/ yet; nothing to modify. -->

## Impact

- **Frontend (alphagoat-client)**: new `src/features/follows/` (api, hooks, components,
  types) + sibling tests; `src/features/feed/components/ReviewRow.tsx` (render the button);
  `src/features/feed/types/feed.types.ts` (`FeedAuthor.isFollowing`); `docs/progress.md`.
- **Backend (alfajorimetro-back)**: `feed` author DTO and `users` `UserResponseDto` gain
  `isFollowing` (+ optional `followersCount`); the feed and user finders compute it against
  the current user. Prerequisite — the frontend optimistic state has nothing to hydrate from
  until this lands.
- **Endpoints**: `PUT/DELETE /follows/:userId` already exist. `GET /feed` and `GET /users/:id`
  change shape (additive field). No new endpoints required.
- **Non-goals**: a followers/following list view, a dedicated profile page, follow
  notifications, and follow counts anywhere other than the optional inline display. The
  `scope=following` feed filter already exists and is not part of this change.
