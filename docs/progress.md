# Progreso - alphagoat-client

Estado de las features del frontend. Se actualiza al cerrar cada una.

## Hecho

### Setup base
- Next.js 16 (App Router, src/, alias `@/`) + TS strict + Tailwind v4 + ESLint.
- Dependencias: axios, @tanstack/react-query, zustand, react-hook-form + zod + @hookform/resolvers, recharts, clsx, tailwind-merge, class-variance-authority, lucide-react.
- Vitest + RTL + jsdom configurados con threshold 85% (branches/functions/lines/statements). Setup en `src/test/setup.ts`. Excluye `app/**`, `shared/components/ui/**`, `types/**`, `schemas/**`.
- Scripts: `dev`, `build`, `start`, `lint`, `format`, `format:check`, `test`, `test:watch`, `test:coverage`.
- Prettier + `prettier-plugin-tailwindcss` (`.prettierrc`).
- Tokens de diseño en `globals.css` (paleta curry/marrón) + clases `.h-mega`, `.h-sub`, `.eyebrow`, `.coda`, `.btn-curry*`, `.icon-btn`, animaciones `.drift` / `.pulse-dot` con `prefers-reduced-motion`.
- Fuentes Google (`next/font`): Archivo Black, Inter, JetBrains Mono en `app/layout.tsx`.
- `shared/lib/api-client.ts` (axios `withCredentials`), `shared/lib/utils.ts` (`cn`), `shared/types/api.types.ts` (`Paginated`, `ApiError`).
- `config/env.ts` (validación Zod de `NEXT_PUBLIC_API_URL`), `config/query-client.ts` (`makeQueryClient`).
- `shared/providers/QueryProvider.tsx` montado en `RootLayout`.
- `shared/components/ui/{button,input}.tsx` base con CVA + `components.json` de shadcn (aliases apuntando a `@/shared/...`).
- `.env.example` + `.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:3001`.
- Home (`app/page.tsx`) provisorio mostrando el lockup del hero.

### Skills instaladas (autoskills)
- accessibility, seo, frontend-design, tailwind-css-patterns, nodejs-best-practices, composition-patterns, next-cache-components, next-upgrade, typescript-advanced-types, nodejs-backend-patterns, next-best-practices, vitest, zod, react-hook-form, react-best-practices.

### Feature `auth`
- Endpoints: `authApi.login | register | me | logout` (axios `withCredentials`). JWT en cookie HTTP-only seteada por el backend.
- Estado: Zustand sin `persist` (hidrata desde `/auth/me`) + cache TanStack Query en `['auth','me']`. Hooks `useLogin`, `useRegister`, `useCurrentUser`, `useLogout`.
- `AuthProvider` (en `app/layout.tsx`) expone `{ user, isLoading, isAuthenticated, logout }` y reacciona al evento `auth:unauthorized` emitido por el interceptor 401 (que excluye los propios `/auth/*`).
- Guards: `GuestOnly` (login/register → redirige a `/feed` si ya autenticado), `RequireAuth` (rutas privadas → `/login?next=...`), y `middleware.ts` con prefijos `PROTECTED` / `GUEST_ONLY` chequeando cookie `accessToken`.
- Vistas: `/login` y `/register` con layout split (hero ParticleWords + form RHF/Zod). Login/register exitoso redirige directo a `/feed` (sin pantalla intermedia).
- Mensajes de error: 401 → "incorrectos", 409 → diferencia username vs email según `message` del backend, red → "no pudimos contactar al servidor".
- Tokens nuevos en `globals.css`: `--color-bg-ink`, `--color-field-bg`. Utilities `.fade-up`, `.fade-in`, `.spin-loader`, `.auth-input`.
- Tests: hooks (`useLogin`, `useRegister`) + forms (`LoginForm`, `SignUpForm`) — 12 verdes.

## Pendiente

### Próximas features
- `alfajores` (listado + detalle público).
- `reviews` (form + listado en detalle de alfajor).
- Layout principal (Header, Footer, nav).
- `moderation` (admin), `ranking`, `comparador`, `perfil`.

### Deuda técnica conocida
- El interceptor 401 emite `auth:unauthorized` y limpia el store, pero no redirige automático a `/login` — definir UX (toast + redirect, o sólo en rutas gated).
- Feedback post-register/login es sólo redirect; falta toast/onboarding si se decide sumarlo.
