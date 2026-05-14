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
- `auth` — backend: conectar `SignUpForm` y `LoginForm` a la API real, reemplazar mocks por `useMutation`. Agregar `AuthProvider`, Zustand store, middleware de Next para rutas protegidas.
- `alfajores` (listado + detalle público).
- `reviews` (form + listado en detalle de alfajor).
- Layout principal (Header, Footer, nav).
- `moderation` (admin), `ranking`, `comparador`, `perfil`.

### Deuda técnica conocida
- Falta `AuthProvider` y middleware de Next para rutas protegidas (`/admin/*`).
- Falta handler global para 401 → redirect a `/login`.
- Sin shadcn init real (se creó `components.json` manual + Button/Input mínimos). Cuando hagan falta más componentes, correr `npx shadcn add <name>`.
