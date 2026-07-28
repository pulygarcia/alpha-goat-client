# user-follows

Following and unfollowing other users from the frontend: the follow-state source
of truth, optimistic toggle behavior, and the follow button UI.

## Requirements

### Requirement: Follow state source of truth

The system SHALL expose, for each user shown in the frontend, whether the authenticated
user currently follows them, via an `isFollowing` boolean returned by the backend on the
feed item author and on `GET /users/:id`. For unauthenticated requests `isFollowing` SHALL
be `false`. The frontend SHALL treat a missing `isFollowing` as `false`.

#### Scenario: Authenticated user already follows the author
- **WHEN** an authenticated user loads the feed and an item's author is one they follow
- **THEN** that item's `author.isFollowing` is `true`
- **AND** the author's `FollowButton` renders in the "Siguiendo" state on first paint

#### Scenario: Authenticated user does not follow the author
- **WHEN** an authenticated user loads the feed and an item's author is not followed
- **THEN** that item's `author.isFollowing` is `false`
- **AND** the author's `FollowButton` renders in the "Seguir" state

#### Scenario: State survives a reload
- **WHEN** the user reloads the page after following an author
- **THEN** the button still shows "Siguiendo" because state comes from the backend, not local memory

### Requirement: Follow and unfollow an author

The system SHALL let an authenticated user follow an author via `PUT /follows/:userId` and
unfollow via `DELETE /follows/:userId`, both expected to return `204 No Content`. The action
SHALL be available from the author block of each feed review row.

#### Scenario: Follow an author
- **GIVEN** the button shows "Seguir"
- **WHEN** the user clicks it
- **THEN** the frontend sends `PUT /follows/:userId`
- **AND** on success the button shows "Siguiendo"

#### Scenario: Unfollow an author
- **GIVEN** the button shows "Siguiendo"
- **WHEN** the user clicks it
- **THEN** the frontend sends `DELETE /follows/:userId`
- **AND** on success the button shows "Seguir"

### Requirement: Optimistic toggle with rollback

The system SHALL update the follow state optimistically when the user clicks the button and
SHALL reconcile with the server afterwards. On a failed request it SHALL roll back to the
previous state. While a toggle for a given user is in flight the button SHALL be disabled to
prevent duplicate requests. When the same author appears in multiple feed rows, all instances
SHALL reflect the same state.

#### Scenario: Optimistic update on click
- **WHEN** the user clicks "Seguir"
- **THEN** the button immediately shows "Siguiendo" before the request resolves
- **AND** the button is disabled while the request is in flight

#### Scenario: Rollback on error
- **GIVEN** the user clicked "Seguir" and the button optimistically shows "Siguiendo"
- **WHEN** the request fails
- **THEN** the button reverts to "Seguir"
- **AND** the failure does not leave the row in a broken or blank state

#### Scenario: Consistent across duplicate authors
- **GIVEN** the same author appears in two feed rows
- **WHEN** the user follows them from one row
- **THEN** both rows show "Siguiendo"

### Requirement: Hide the button for the current user

The system SHALL NOT render a follow button for the authenticated user's own authored
reviews, since a user cannot follow themselves.

#### Scenario: Own review in the feed
- **WHEN** a feed item's author is the authenticated user
- **THEN** no follow button is rendered for that author
