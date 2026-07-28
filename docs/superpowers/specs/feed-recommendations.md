# feed-recommendations Specification

## Purpose
TBD - created by archiving change wire-recommendations. Update Purpose after archive.
## Requirements
### Requirement: Personalized recommendations in the feed rail

The system SHALL render a "Recomendado para vos" block in the feed rail, populated from
`GET /recommendations`, showing alfajores matched to the authenticated user's taste. The
endpoint is auth-only; the frontend SHALL only request it when a user session is present and
SHALL render the block only for authenticated users.

#### Scenario: Authenticated user with recommendations
- **WHEN** an authenticated user loads the feed
- **THEN** the frontend requests `GET /recommendations`
- **AND** the rail block lists the returned alfajores with their name, marca and affinity

#### Scenario: Guest user
- **WHEN** a user without a session loads the feed
- **THEN** the frontend does NOT request `GET /recommendations`
- **AND** the "Recomendado para vos" block is not rendered

### Requirement: Cold-start affinity handling

The system SHALL handle a `matchPct` of `null` (cold start: a user with no taste fingerprint,
recommended by quality alone) by omitting the affinity figure for that item rather than
displaying an invalid value such as "null%".

#### Scenario: Item with null match
- **WHEN** a recommended item has `matchPct: null`
- **THEN** the row is shown without an affinity percentage
- **AND** no "null" text leaks into the UI

#### Scenario: Item with a match value
- **WHEN** a recommended item has a numeric `matchPct`
- **THEN** the row shows the affinity as a percentage

### Requirement: Loading, error and empty states

The block SHALL show a loading state while the request is in flight, an error message if it
fails, and an empty state when the endpoint returns no recommendations — never a blank gap.

#### Scenario: Loading
- **WHEN** the recommendations request is in flight
- **THEN** the block shows a loading placeholder

#### Scenario: Request fails
- **WHEN** the recommendations request fails
- **THEN** the block shows an error message instead of a blank area

#### Scenario: No recommendations
- **WHEN** the endpoint returns an empty list
- **THEN** the block shows an empty-state message

