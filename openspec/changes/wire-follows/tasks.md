## 1. Backend contract (alfajorimetro-back) — DONE (2026-06-06)

- [x] 1.1 `GET /feed` author now returns `isFollowing: boolean`, computed bounded to the page authors via `FollowToggler.followingAmong(userId, authorIds)`; `false` for own reviews. Shipped in `alpha-goat-server` commit `a0ab9e6` (change `add-feed-author-isfollowing`, archived).
- [~] 1.2 DEFERRED — `isFollowing` / `followersCount` on `GET /users/:id` is NOT done. Deferred to the future profile-page work (non-goal here; that endpoint is public and would need optional auth). The feed alone is enough for `ReviewRow`.
- [x] 1.3 Backend specs + tests updated and green (149 suite). No `followersCount` is sent by the backend in this iteration.

## 2. Frontend types

- [x] 2.1 Add `isFollowing: boolean` to `FeedAuthor` in `src/features/feed/types/feed.types.ts` (line ~57-61). NOTE: backend does NOT send `followersCount` — do not add it. Treat a missing `isFollowing` as `false` when reading it.
- [x] 2.2 (optional) SKIPPED — no shared `follows` types file needed; `userId: string` + `isFollowing: boolean` suffice. The flag lives on `FeedAuthor`.

## 3. Follows feature — api and hook

- [x] 3.1 Create `src/features/follows/api/follows.api.ts` with `follow(userId)` (`PUT /follows/:userId`) and `unfollow(userId)` (`DELETE /follows/:userId`), both resolving on `204`
- [x] 3.2 Create `src/features/follows/hooks/useToggleFollow.ts`: a mutation that on mutate cancels in-flight feed queries, snapshots cache, and optimistically flips `isFollowing` for every cached author matching `userId` across ALL infinite feed pages; rolls back on error; invalidates affected queries on settle; exposes `isPending`. NOTE: the feed cache is a `useInfiniteQuery` keyed `['feed','reviews',{sort,scope,province}]` — see `src/features/feed/hooks/useFeedReviews.ts`; the optimistic write must map over `data.pages[].items[].author` matching `userId`. No `followersCount` to touch.
- [x] 3.3 Add `useToggleFollow.test.ts` (mock `follows.api`): optimistic flip, rollback on error, no duplicate request while pending

## 4. FollowButton component

- [x] 4.1 Create `src/features/follows/components/FollowButton.tsx` (`'use client'`): props `userId`, `isFollowing`; renders "Seguir" / "Siguiendo", disabled while pending, error-safe; returns null when `userId === currentUser.id`
- [x] 4.2 Add `FollowButton.test.tsx` (mock the hook + current user): renders correct label per state, calls toggle on click, disabled while pending, hidden for the current user

## 5. Integrate into the feed

- [x] 5.1 Render `FollowButton` in the author block of `src/features/feed/components/ReviewRow.tsx`, passing `author.id` and `author.isFollowing`
- [x] 5.2 No author-block assertions changed — `FeedReviews.test.tsx` mocks `ReviewRow` and `ReviewRow` has no test. Only ripple was adding `isFollowing` to the `makeItem` fixture in `FeedReviews.test.tsx`.

## 6. Verify and close

- [x] 6.1 `npm run lint` (0 errors, 3 pre-existing warnings) and `npm run test` (39/39 green). NOTE: the global `test:coverage` 85% gate is RED, but it was already red before this change (byte-identical numbers pre/post: 43.33% lines) — caused by the intentionally-untested feed visual shell (FeedHero/FeedSubnav/FeedTopbar/ReviewRow/AuthProvider/api). This change is coverage-neutral. New follows code IS covered: FollowButton 90%/100%, useToggleFollow 95%/100%; follows.api.ts is a thin axios wrapper mocked in the hook test.
- [x] 6.2 Update `docs/progress.md` (new `follows` feature wired; note backend `isFollowing` contract landed)
- [ ] 6.3 Archive the change with `/opsx:archive` once implemented and verified

## Next session kickoff (resume here — 2026-06-07)

Backend is DONE and live: `GET /feed` items now carry `author.isFollowing`. Frontend is
untouched. Resume with `/opsx:apply wire-follows` and start at task 2.1. Order: 2 → 3 → 4 → 5 → 6.

Key facts so you don't re-derive them:
- Endpoints already exist: `PUT /follows/:userId` (follow) and `DELETE /follows/:userId` (unfollow), both `204`. Axios client is `src/shared/lib/api-client.ts` (`withCredentials`).
- Mirror existing feature patterns: `feedApi` in `src/features/feed/api/feed.api.ts`, hook style in `src/features/feed/hooks/useFeedReviews.ts`, current-user via the auth feature (`useCurrentUser` / AuthProvider).
- Feed list cache key: `['feed','reviews',{sort,scope,province}]` (infinite query). Optimistic flip must walk `data.pages[].items[].author` and match by `author.id === userId`.
- `FollowButton` goes in the author block of `src/features/feed/components/ReviewRow.tsx`; hide it when the author is the current user.
- No `followersCount` anywhere (backend does not send it this iteration).
- Tests: mock the `api/` module, target the 85% coverage threshold. Update `docs/progress.md` on close (add the `follows` feature).
