@AGENTS.md

# Alfajorímetro - Frontend (alphagoat-client)

Frontend for Alfajorímetro: an Untappd-style app for Argentine alfajores. Users review alfajores with an overall rating plus 5 axes (sweetness, dulce-de-leche amount, coating quality, top-to-filling ratio, texture). The app produces radar charts, rankings and a comparator.

## Stack

- **Framework**: Next.js 16 (App Router, Server Components where applicable)
- **Language**: TypeScript strict
- **Styling**: Tailwind CSS v4 (tokens in `globals.css`)
- **UI primitives**: shadcn/ui (live in `src/shared/components/ui`)
- **Server state**: TanStack Query
- **Client state**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **HTTP**: Axios (`withCredentials: true`)
- **Auth**: JWT in HTTP-only cookie set by the backend
- **Testing**: Vitest + React Testing Library, coverage ≥ 85%
- **Lint/Format**: ESLint + Prettier

## Commands

```bash
npm run dev              # localhost:3000
npm run build
npm run start
npm run test             # vitest run
npm run test:watch
npm run test:coverage    # 85% threshold (branches/functions/lines/statements)
npm run lint
npm run format
```

## Code rules

### Architecture

- **Feature-based**: each feature lives under `src/features/<feature>/` with its own `components/ hooks/ api/ schemas/ types/ store/` (only create the folders you actually need).
- Pages in `src/app/` are thin: they import from `features/` and `shared/` and compose the layout.
- **Server Components by default**; add `'use client'` only on the component that needs it (forms, hooks, events), not on parents.
- Anything used by 2+ features → `src/shared/`. Used by one → stays in the feature.
- **Never call the API from a component**: always via a hook (`useX`) that uses an `api/` function.

### Conventions

- Components `PascalCase.tsx`, hooks/utils `camelCase.ts`, folders `kebab-case`.
- Absolute imports with the `@/` alias from `src/`.
- Fetch errors handled via `isError`/`error` from TanStack Query — never leave a blank screen.
- JWT lives in an HTTP-only cookie — never touch localStorage for the token.

### Testing

- Every component with logic and every custom hook has a sibling `.test.tsx` / `.test.ts`.
- Mock the `api/` module — never hit the network.
- Test behavior, not implementation.
- Do not test `shared/components/ui/**` (shadcn) or purely presentational components.

### Git

- Conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `style:`).
- Small, atomic commits. Main branch: `main`. Features on `feat/<short-name>`.

## Design system

Monochromatic warm palette (deep brown + curry gold). Tokens in `src/app/globals.css`:

- Colors: `bg`, `bg-deep`, `curry`, `curry-bright`, `curry-soft`, `cinnamon`, `sienna`.
- Fonts: Archivo Black (display), Inter (body), JetBrains Mono (eyebrow / tags).
- Utility classes: `.h-mega`, `.h-sub`, `.eyebrow`, `.coda`, `.btn-curry`, `.btn-curry-lg`, `.icon-btn`, `.drift`, `.pulse-dot`.

Full visual language: `docs/design-guidelines.md`.

## Where things live

- **Detailed architecture**: `docs/architecture.md`
- **Design / UI guidelines**: `docs/design-guidelines.md`
- **Design decisions log**: `docs/decisions.md` — non-obvious contracts and trade-offs and the _why_ behind them. NOT a progress log (git history + the vault board cover that).

## How to work with me (Claude Code)

- Before creating a feature, read `docs/architecture.md` and skim `docs/decisions.md` for relevant constraints.
- **One feature at a time**.
- **Tests in the same session** as the code they cover.
- When you make a **non-obvious design decision** (a contract, a trade-off, a "why not the obvious thing"), record it in `docs/decisions.md`. Do **not** log routine "what I did" there — that's what commits, PRs and the board are for.
- If you are unsure about the domain (axes, vocabulary), ask — don't invent.
