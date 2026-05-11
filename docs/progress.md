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

## Pendiente

### Próximas features
- `auth` (login, register, useCurrentUser, AuthProvider, Zustand store, middleware de rutas protegidas).
- `alfajores` (listado + detalle público).
- `reviews` (form + listado en detalle de alfajor).
- Layout principal (Header, Footer, nav del hero).
- `moderation` (admin), `ranking`, `comparador`, `perfil`.

### Deuda técnica conocida
- Falta `docs/design-guidelines.md` con el detalle completo del hero (copy del `design alphagoat-adapted.md`).
- Falta `AuthProvider` y middleware de Next para rutas protegidas (`/admin/*`).
- Falta `HttpExceptionFilter` análogo del lado del cliente: handler global para 401 → redirect a `/login`.
- Sin shadcn init real (se creó `components.json` manual + Button/Input mínimos). Cuando hagan falta más componentes, correr `npx shadcn add <name>`.
