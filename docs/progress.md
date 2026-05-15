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

### Feature `auth` — login + register + provider conectados al backend
- `features/auth/types/auth.types.ts` — `User`, `LoginInput`, `RegisterInput`, `AuthResponse`.
- `features/auth/schemas/{login,register}.schema.ts` — Zod schemas.
- `features/auth/api/auth.api.ts` — `authApi.login | register | me | logout` con `withCredentials`.
- `features/auth/store/auth.store.ts` — Zustand simple (sin `persist`: el provider hidrata desde `/auth/me`).
- Hooks: `useLogin`, `useRegister`, `useCurrentUser` (sincroniza el store), `useLogout` (limpia caché + redirige). Login/register cachean el user en `['auth','me']` con `setQueryData`.
- `shared/providers/AuthProvider.tsx` — Context montado en `app/layout.tsx` dentro de `QueryProvider`. Expone `{ user, isLoading, isAuthenticated, logout }`. Escucha `auth:unauthorized` para limpiar la sesión.
- Interceptor 401 global en `api-client.ts` — emite `auth:unauthorized` (excepto en las propias `/auth/*`) para que el provider reaccione.
- `LoginForm` y `SignUpForm` conectados a sus hooks: `isPending` / `isError` (mensaje friendly en 401, 409, red, o `message` del backend) / `isSuccess`.
- Tests: `useLogin`, `useRegister`, `LoginForm`, `SignUpForm` — 10 tests verdes.

### Feature `auth` — vistas (UI only, sin backend)
- `/register` — registro: layout split 52/48, hero izquierdo + formulario derecho.
- `/login` — inicio de sesión: mismo hero, form más liviano.
- `src/features/auth/components/`:
  - `Hero.tsx` — columna izquierda (server component). Fondo oscuro `#1a0c05` con sombra profunda.
  - `ParticleWords.tsx` — tres instancias apiladas de `CursorDrivenParticleTypography` (Probá / Opiná / Puntuá), color ámbar `#c87a20`, interactivas con el cursor.
  - `SignUpForm.tsx` — form RHF + Zod: nombre, apellido, mail, contraseña. Estados idle / submitting / success con mock de 1200ms.
  - `LoginForm.tsx` — form RHF + Zod: mail, contraseña + "olvidé mi contraseña".
  - `InputGroup.tsx` — field reutilizable con label, error, helper e ícono derecho (forwardRef).
  - `PasswordStrength.tsx` — barra de 4 niveles (Frágil / Aceptable / Sólida / De fierro).
  - `StepItem.tsx` — paso con estado idle / active / done (disponible para cuando se conecte el backend).
- `src/shared/components/ui/cursor-driven-particle-typography.tsx` — instalado vía `npx shadcn@latest add @componentry/cursor-driven-particle-typography`. Import corregido a `@/shared/lib/utils`. Cap de font-size ajustado a `containerWidth * 0.18`.
- Tokens nuevos en `globals.css`: `--color-bg-ink: #2c1209`, `--color-field-bg: #3b1a0a`. Animaciones de auth: `.fade-up`, `.fade-in`, `.spin-loader`, clase `.auth-input` para focus ring.
- Tipografía del form: títulos, labels, inputs y botones en `#fdf6e8` (blanco cremita cálido).

## Pendiente

### Próximas features
- `auth` — middleware de Next para rutas protegidas (`/admin/*`, `/perfil`). Login/register/me/logout, AuthProvider e interceptor 401 ya están.
- `alfajores` (listado + detalle público).
- `reviews` (form + listado en detalle de alfajor).
- Layout principal (Header, Footer, nav).
- `moderation` (admin), `ranking`, `comparador`, `perfil`.

### Deuda técnica conocida
- Falta middleware de Next para rutas protegidas (`/admin/*`).
- El interceptor 401 emite `auth:unauthorized` y limpia el store, pero no redirige automático a `/login` — definir UX (¿toast + redirect, o solo cuando se accede a una ruta gated?).
- Sin shadcn init real (se creó `components.json` manual + Button/Input mínimos). Cuando hagan falta más componentes, correr `npx shadcn add <name>`.
