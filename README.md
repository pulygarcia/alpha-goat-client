# alphagoat-client

Frontend de una app de reseñas y puntuaciones con comentarios: los usuarios califican ítems en múltiples ejes, dejan comentarios y ven rankings, radar charts y un comparador.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · TanStack Query · Zustand · React Hook Form + Zod · Recharts · Axios · Vitest + RTL.

## Empezar

Requiere Node 20+.

```bash
cp .env.example .env.local      # apuntar a la URL del back
npm install
npm run dev                     # http://localhost:3000
```

El backend (NestJS) debe estar corriendo en `http://localhost:3001`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Dev server con HMR |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run test:watch` | Tests en watch |
| `npm run test:coverage` | Coverage (threshold 85%) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Estructura

```
src/
├── app/         # rutas (App Router) — páginas finitas
├── features/    # cada feature con sus components/hooks/api/...
├── shared/      # reutilizable entre features (ui, lib, providers)
└── config/      # env, query-client
```

- **Feature-based**: trabajamos una feature a la vez en `src/features/<nombre>/`.
- **Server Components por default**, `'use client'` solo donde haga falta.
- Llamadas a la API siempre vía hook (`useX`) que envuelve una función de `api/`.

## Variables de entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Más info

- `docs/architecture.md` — arquitectura detallada, ejemplos de feature.
- `docs/design-guidelines.md` — paleta, tipografía, componentes visuales.
- `docs/progress.md` — qué features están hechas y qué falta.
- `CLAUDE.md` — instrucciones para trabajar con Claude Code.
