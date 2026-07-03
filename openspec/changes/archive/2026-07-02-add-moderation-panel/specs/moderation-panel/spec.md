## ADDED Requirements

### Requirement: Admin-only access to the moderation panel
The `/admin` route SHALL be visible only to authenticated users with role ADMIN. Any other visitor (anonymous or non-admin) SHALL see the app's visual not-found page, without any hint that the route exists. While the current user is being resolved, the page SHALL show a loading skeleton (never a blank screen).

#### Scenario: Admin visits /admin
- **GIVEN** a logged-in user with role ADMIN
- **WHEN** they navigate to `/admin`
- **THEN** the moderation queue is rendered

#### Scenario: Non-admin or anonymous visits /admin
- **GIVEN** an anonymous visitor or a logged-in user with role USER
- **WHEN** they navigate to `/admin`
- **THEN** the visual not-found page is rendered

#### Scenario: Session still resolving
- **WHEN** `/admin` mounts and the current user query is still loading
- **THEN** a skeleton is shown until the role is known

### Requirement: Admin entry point in the avatar menu
The avatar dropdown in `AppHeader` SHALL include a "Moderación" item linking to `/admin`, rendered only when the current user has role ADMIN.

#### Scenario: Admin opens the avatar menu
- **WHEN** an ADMIN opens the avatar dropdown
- **THEN** a "Moderación" item linking to `/admin` is present

#### Scenario: Regular user opens the avatar menu
- **WHEN** a non-admin opens the avatar dropdown
- **THEN** no moderation item is rendered

### Requirement: Paginated queue of PENDING alfajores
The panel SHALL list PENDING alfajores from `GET /admin/alfajores/pending?page&limit` with classic prev/next pagination, showing for each item at least: nombre, marca, tipo, image (or the cream placeholder), and creation date. The list SHALL handle loading (skeleton), error (message with retry) and empty ("no hay alfajores pendientes") states.

#### Scenario: Queue with pending alfajores
- **WHEN** the queue loads with items
- **THEN** each pending alfajor is rendered as a card with its data and Aprobar/Rechazar actions

#### Scenario: Empty queue
- **WHEN** the endpoint returns zero items
- **THEN** an empty state message is shown instead of a blank screen

#### Scenario: Fetch error
- **WHEN** the queue request fails
- **THEN** an error message with a retry action is shown

### Requirement: Approve a pending alfajor
Each card SHALL offer an approve action calling `PATCH /admin/alfajores/:id/approve`. On success the queue query SHALL be invalidated (refetch) and a success toast shown. While the request is in flight, the card's actions SHALL be disabled.

#### Scenario: Successful approval
- **WHEN** the admin clicks Aprobar and the request succeeds
- **THEN** a success toast is shown and the queue refetches (the alfajor leaves the list)

#### Scenario: Approval fails
- **WHEN** the request fails
- **THEN** an error toast is shown and the card remains actionable

### Requirement: Reject a pending alfajor with a reason
Each card SHALL offer a reject action opening a dialog with a required reason field (trimmed, 1–500 chars, validated with Zod before submit). Submitting SHALL call `PATCH /admin/alfajores/:id/reject` with `{ rejectionReason }`. On success the dialog closes, the queue is invalidated and a success toast is shown.

#### Scenario: Successful rejection
- **GIVEN** the reject dialog is open with a valid reason
- **WHEN** the admin submits
- **THEN** the dialog closes, a success toast is shown and the queue refetches

#### Scenario: Invalid reason
- **WHEN** the reason is empty or exceeds 500 characters
- **THEN** an inline validation error is shown and no request is sent

### Requirement: Stale item conflict
If approve/reject returns a 400 because the alfajor is no longer PENDING (moderated elsewhere), the panel SHALL show a specific toast explaining the item was already moderated and refetch the queue so the stale card disappears.

#### Scenario: Alfajor already moderated
- **WHEN** the admin approves or rejects an item and the backend answers 400 (not PENDING)
- **THEN** a specific toast is shown and the queue refetches
