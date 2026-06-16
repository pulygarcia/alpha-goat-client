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
- Estado: Zustand sin `persist` + cache TanStack Query en `['auth','me']` como fuente de verdad de la UI. Hooks `useLogin`, `useRegister`, `useCurrentUser`, `useLogout`.
- **SSR hydration (sin parpadeo)**: el `RootLayout` (Server Component, ahora `async`) llama a `getCurrentUser()` (`features/auth/api/getCurrentUser.server.ts`, `server-only`), que lee la cookie HTTP-only de la request con `cookies()` de `next/headers` y la reenvía a `GET /auth/me` vía `fetch` (`cache: 'no-store'`). El resultado (`User | null`) baja como `initialUser` al `AuthProvider` y se siembra en la query como `initialData` → el primer render (servidor + hidratación) ya conoce la sesión, sin el flash "invitado → autenticado" ni round-trip extra a `/me` en el cliente. Consecuencia: leer cookies en el root layout opta a todas las rutas a **render dinámico** (esperado para una app con sesión). `authApi.me` (axios `withCredentials`) sigue usándose en el cliente cuando `useCurrentUser()` se llama sin `initialUser` (ej. `FollowButton`).
- `AuthProvider` (en `app/layout.tsx`) expone `{ user, isLoading, isAuthenticated, logout }` derivados de la query, y reacciona al evento `auth:unauthorized` (emitido por el interceptor 401, que excluye los propios `/auth/*`) limpiando la cache `['auth','me']`.
- Guards: `GuestOnly` (login/register → redirige a `/feed` si ya autenticado), `RequireAuth` (rutas privadas → `/login?next=...`), y `middleware.ts` con prefijos `PROTECTED` / `GUEST_ONLY` chequeando cookie `accessToken`. Ambos usan `SessionLoader` (spinner + "Verificando sesión…" sobre `bg-ink`) en lugar de pantalla en blanco mientras resuelven/redirigen.
- **Fix sesión zombie post-logout**: `useLogout` ya no hace `removeQueries` sobre `['auth','me']` — el observer siempre montado del `AuthProvider` recreaba la query e `initialData` re-sembraba el usuario stale del server render (fresco por `staleTime`), dejando la UI "logueada" sin cookie hasta un F5. El `setQueryData(null)` explícito alcanza y no puede ser pisado por `initialData`.
- Vistas: `/login` y `/register` con layout split (hero ParticleWords + form RHF/Zod). Login/register exitoso redirige directo a `/feed` (sin pantalla intermedia).
- Mensajes de error: 401 → "incorrectos", 409 → diferencia username vs email según `message` del backend, red → "no pudimos contactar al servidor".
- Tokens nuevos en `globals.css`: `--color-bg-ink`, `--color-field-bg`. Utilities `.fade-up`, `.fade-in`, `.spin-loader`, `.auth-input`.
- Tests: hooks (`useLogin`, `useRegister`) + forms (`LoginForm`, `SignUpForm`) — 12 verdes.

### Feature `feed` (en curso — diseño "El Diario", cream paper)
- Mockup de referencia en `docs/_design-refs/feed.html` (gitignored, sólo local).
- Tokens cream agregados en `globals.css`: `--color-paper`, `--color-paper-raised`, `--color-paper-sunken`, `--color-paper-field`, `--color-paper-emph`, `--color-ink`, `--color-deep`, `--color-curry-deep`. Coexisten con la paleta dark curry de auth/landing.
- Trozo 1 (hecho): `FeedTopbar` (brand + nav activa por pathname + search + CTA Reseñar con gradiente marrón-chocolate + avatar con iniciales) y `FeedSubnav` (fecha-edición con pulse, chips Hoy/Semana/Siguiendo/Provincia con state local — luego cableados al feed vía store, ver más abajo). `/feed/page.tsx` reemplazado por el shell cream con `RequireAuth`. Los slots de stats consumen `GET /feed/stats` vía `useFeedStats` (`feedApi.stats()`, queryKey `['feed','stats']`, `staleTime: 60s`); muestran "—" mientras carga/error y el número cuando hay data. Tests del hook (mock `api/`, 2).
- Topbar: el avatar de iniciales ahora despliega un menú de usuario (primitiva shadcn `dropdown-menu` agregada vía CLI a `shared/components/ui/` + `@radix-ui/react-dropdown-menu`) con username + email y "Cerrar sesión" (usa el `logout` del `AuthProvider`). Estilado directo con la paleta paper — el proyecto no tiene los tokens de theme de shadcn (`--popover`, `--accent`).
- Trozo 2 (hecho): `FeedHero` consumiendo `GET /feed/hero`.
  - `features/feed/api/feed.api.ts` → `feedApi.hero()`. Mapea `204 No Content` a `null` (sin loading infinito en empty state).
  - `useFeedHero` (TanStack Query, `staleTime: 60s`, queryKey `['feed','hero']`).
  - `FeedHero.tsx`: eyebrow "Goat del momento" + nombre/marca/provincia/tipo + 3 stats (general, reseñas-semana con ▲/▼ deltaPct, total) + radar Recharts sobre los 5 ejes (dulzor, DDL, baño, tapa/relleno, textura). Empty/error/loading inline. Sin tests por la regla del shell visual (el hook arranca tests cuando lo amerite la lógica).
- Trozo 3 (hecho): lista de reseñas destacadas consumiendo `GET /feed`.
  - `feedApi.list(params)` (sort/scope/province/page/limit) + tipos `FeedItem`/`FeedList`/`FeedListParams` en `feed.types.ts`.
  - `useFeedReviews` (`useInfiniteQuery`, `staleTime: 30s`, queryKey `['feed','reviews',{sort,scope,province}]`, paginación page/limit con `getNextPageParam`).
  - `ReviewRow.tsx`: foto (placeholder cream si no hay), autor (avatar iniciales + provincia + hace X), título alfajor·marca, quote, meta-row likes/comentarios (sin compartidas — no hay feature de shares), radar mini Recharts (5 ejes) y rating grande.
  - `FeedReviews.tsx`: head "Reseñas destacadas" + switch Más likes/Recientes/Mejor puntuadas (mapea a `sort`), estados loading/error/empty y botón "Cargar más". Cableado en `/feed/page.tsx` reemplazando el placeholder.
  - Tests: `useFeedReviews` (mock `api/`, 4) + `FeedReviews` (mock hook + `ReviewRow`, 6) — 10 verdes.
- Tests del feed: el shell visual no se testea — sólo donde hay lógica de datos (mockeando el módulo `api/`, como manda CLAUDE.md).
- Follows en el feed (hecho): cada `ReviewRow` muestra un `FollowButton` en el bloque del autor. Ver feature `follows` abajo. El back ya manda `author.isFollowing` en `GET /feed`.
- Trozo 4 (parcial): `FeedRail.tsx` reemplaza el placeholder del aside en `/feed/page.tsx`. Compone tres secciones: `WeeklyRanking` (feature `ranking`, conectado a `GET /ranking/weekly`), `FeaturedMarcas` (feature `marcas`, conectado a `GET /marcas/featured`) y "Recomendado para vos" como `PendingSection` (pendiente de `GET /recommendations`).
- Feature `ranking` (nueva): "Ranking semanal" del rail. `rankingApi.weekly()` → `useWeeklyRanking` (queryKey `['ranking','weekly']`, `staleTime: 300s`) → `WeeklyRanking` (filas posición Archivo + nombre/marca + score mono curry + trend `▲`/`▼`/`=`/`nuevo`; estados loading skeleton / error / empty). Tokens nuevos en `globals.css`: `--color-reward`, `--color-error` (verde/rojo del trend, sacados del mockup). Tests: hook (mock `api/`, 2) + componente (mock hook, 4) — 6 verdes.
- Trozo 6 (hecho): microinteracción radar fill-in con IntersectionObserver. Hook compartido `shared/hooks/useRevealOnScroll` (callback ref → observa en cuanto el nodo entra al DOM, aunque aparezca después de un estado de carga; se "congela" al entrar en vista, revela de inmediato sin soporte de IO en SSR/jsdom y respeta `prefers-reduced-motion`). En `FeedHero` y `ReviewRow` el `<Radar>` se monta recién al entrar en viewport (`isAnimationActive` gated por `animate`, `animationDuration={700}`) → el área se dibuja desde el centro al hacer scroll en vez de aparecer estática. Tests del hook (mock `IntersectionObserver` + `matchMedia`, 5).
- Subnav cableado al feed (hecho): los chips Hoy/Esta semana/Siguiendo dejaron de ser decorativos. Store Zustand `feed/store/feedFilters.store` (`scope: FeedScope | null`, `toggleScope` — re-click deselecciona a "todas"); `FeedSubnav` lo escribe y `FeedReviews` lo lee y lo pasa a `useFeedReviews({ sort, scope })`. Default `scope: null` ("todas"): el feed arranca mostrando todo y el usuario opta por un chip (filtrar por 'today' de entrada dejaba la lista vacía si no hubo reseñas hoy). Se quitó el chip "Por provincia" (requería un selector de provincia que se difiere). `FeedSubnav` salió de los excludes de coverage (ahora tiene lógica). Tests: store (4) + `FeedSubnav` (7).
- Trozos pendientes:
  - 4 (resto). Rail: recomendado para vos (`GET /recommendations`) — bloqueado por back.
  - 5. Estados loading (Skeleton + Suspense streaming) y empty (usuario nuevo).
  - 7. Responsive 1280 / 768 / 375.

### Feature `follows`
- Slice nuevo en `src/features/follows/` (api, hooks, components, types — sólo lo necesario).
- Contrato backend ya en producción: `GET /feed` devuelve `author.isFollowing: boolean` por item (computado contra el usuario autenticado; `false` para reseñas propias y pedidos anónimos). Sin `followersCount` en esta iteración. El front trata un `isFollowing` ausente como `false`. Endpoints de acción ya existían: `PUT /follows/:userId` (seguir) y `DELETE /follows/:userId` (dejar de seguir), ambos `204`.
- `follows.api.ts` → `followsApi.follow(userId)` / `followsApi.unfollow(userId)`.
- `useToggleFollow`: mutación con update optimista sobre el cache del feed. En `onMutate` cancela las queries `['feed','reviews', ...]` (match por prefijo: cubre todos los sort/scope cacheados), snapshotea, y reescribe `isFollowing` para todo autor que matchee el `userId` en cada página del `useInfiniteQuery`. Rollback en `onError`; invalida al `onSettled`. Expone `isPending`. Soluciona el caso "mismo autor en varias filas": todas se actualizan juntas.
- `FollowButton.tsx` (`'use client'`): props `userId` + `isFollowing`, labels "Seguir"/"Siguiendo", deshabilitado mientras `isPending`, `aria-pressed`. Devuelve `null` cuando el autor es el usuario actual (vía `useCurrentUser`).
- Integrado en el bloque del autor de `ReviewRow`.
- `FeedAuthor` (en `feed.types.ts`) ganó el campo `isFollowing: boolean`.
- Tests: `useToggleFollow` (flip optimista, dirección follow/unfollow, autores duplicados, rollback, no-doble-request mientras pending — 5) + `FollowButton` (labels por estado, toggle on click con estado actual, disabled+no-toggle pending, oculto para el usuario actual — 5). Mockean el módulo `api/` y los hooks. 10 verdes.
- Deuda: el gate global `test:coverage` (85%) sigue en rojo, pero por el shell visual del feed sin tests (pre-existente, no por este cambio — números idénticos pre/post). El código nuevo de follows sí está cubierto.

### Feature `marcas` (sólo "Marcas en foco" por ahora)
- Slice nuevo en `src/features/marcas/` (api, hooks, components, types).
- `marcas.api.ts` → `marcasApi.featured()` (`GET /marcas/featured`, público, devuelve `FeaturedMarca[]`).
- `useFeaturedMarcas` (queryKey `['marcas','featured']`, `staleTime: 5 min` — ranking de ventana de 30 días, cambia lento).
- `FeaturedMarcas.tsx`: sección del rail con cards por marca (logo o inicial sobre `paper-sunken`, nombre, meta "N productos · X.X prom. · provincia"). Estados: skeleton pulse (3 filas) / error / empty inline.
- Tests: `useFeaturedMarcas` (mock `api/`, 2) + `FeaturedMarcas` (mock hook: cards con singular/plural y provincia opcional, logo vs inicial, error, empty — 4). 6 verdes.

### Coverage al 85% (gate verde)
- Dos partes, como estaba diagnosticado en la deuda técnica:
  - **Parte 1 — alinear config con la política**: excludes de coverage en `vitest.config.ts` para lo que el CLAUDE.md dice no testear. Se sumaron: componentes presentacionales (auth `Hero`/`HeroWords`/`ParticleWords`/`SocialButton`/`InputGroup`, feed `FeedHero`/`FeedRail`/`FeedSubnav`/`FeedTopbar`/`ReviewRow`), wrappers `api/` (se mockean siempre), providers, `*.server.ts`, y boundary/bootstrap (`middleware.ts`, `config/**`, espejando los excludes de Jest del back).
  - **Parte 2 — tests genuinos que faltaban**: `api-client` (interceptor 401: dispatch para no-auth, skip en `/auth/*`, no-401, no-axios), `useCurrentUser` (seed desde initialUser sin fetch, fetch sin initialUser, no setea user en error), `useLogout` (limpia store+cache+redirect, e igual en onSettled ante fallo), `auth.store`, `useFeedHero`, y `cn`. Además se cerraron las ramas de `extractError` y el toggle de password en `LoginForm`/`SignUpForm`.
- Resultado: **81 tests verdes**; coverage statements 96.8 / branches 89.2 / functions 97.1 / lines 98.9. CI (`.github/workflows/ci.yml`) ya corre `pnpm test:coverage` (se quitó el TODO que corría `pnpm test` sin gate).

## Pendiente

### Próximas features
- `alfajores` (listado + detalle público).
- `reviews` (form + listado en detalle de alfajor).
- Layout principal (Header, Footer, nav) — el feed ya tiene su propio shell.
- `moderation` (admin), `ranking`, `comparador`, `perfil`.

### Endpoints backend faltantes (alfajorimetro-back)
Bloquean trozo 4 del feed (rail). El trozo 3 (lista) ya está desbloqueado.

- ~~`GET /feed`~~ — listo. Lista paginada de reseñas (auth) con orden `sort=likes|recent|rating` (default `recent`) y filtros `scope=today|week|following|province` (+ `province` requerido si `scope=province`). Paginación `page`/`limit` (no cursor): devuelve `{ items, total, page, limit }`. Cada item: `author {id, username, avatarUrl}`, `alfajor {id, nombre, tipo, imagenUrl}`, `marca {id, nombre, provincia}`, `quote`, `photoUrl`, `overall`, `axes (5)`, `likes`, `commentsCount`, `createdAt`. Sin `sharesCount`: no habrá feature de compartir. `scope=following` apoyado en el módulo `follows` (`PUT/DELETE /follows/:userId`). Likes de reviews vía `PUT/DELETE /reviews/:id/like`.
- ~~`GET /feed/hero`~~ — listo (alfajorimetro-back commit `42dda73`).
- ~~`GET /ranking/weekly`~~ — **listo y conectado en FE** (feature `ranking`, rail del feed). Público. Top 5 alfajores de los últimos 7 días con piso de 3 reseñas. Response: array ordenado por `score` desc de `{ id, nombre, score, trend, marca: { id, nombre, logoUrl } }` — `score` = promedio de `ratingGeneral` de la semana (2 decimales), `trend` = `'up' | 'down' | 'same' | 'new'` vs la semana anterior (`new` si no tenía reviews). OpenSpec change `add-ranking-weekly` (alfajorimetro-back).
- ~~`GET /marcas/featured`~~ — listo y conectado en FE (feature `marcas`, rail del feed). Público. "Marcas en foco" del rail seleccionadas por **controversia** (las marcas sobre las que más dividida está la opinión reciente): el back rankea por dispersión del `ratingGeneral` en 30 días con piso de muestra, top 5. La controversia es interna; devuelve la shape pactada `{ id, nombre, provincia, logoUrl, productCount, avgScore }` (ambos históricos). OpenSpec change `add-marcas-featured` (alfajorimetro-back).
- `GET /recommendations` — recomendaciones personalizadas por huella del usuario (`matchPct`, `score`).
- ~~`GET /feed/stats`~~ — listo y conectado en FE. Público (no requiere auth), devuelve `{ todayCount, weekCount }`. `todayCount` = reseñas de alfajores aprobados creadas hoy (desde las 00:00 local); `weekCount` = últimas 7 días (ventana móvil). Mismas ventanas que `scope=today`/`scope=week` del feed. Cableado en `FeedSubnav` vía `useFeedStats`.
- (Soporte) Módulo de imágenes/uploads aún no expone URLs públicas → el front usa placeholders cream (`ph`) hasta que esté.

### Deuda técnica conocida
- El interceptor 401 emite `auth:unauthorized` y limpia la cache `['auth','me']`, pero no redirige automático a `/login` — definir UX (toast + redirect, o sólo en rutas gated).
- `getCurrentUser()` (SSR) trata cualquier respuesta no-OK como invitado. Si el server de Next no pudiera alcanzar al backend estando el usuario logueado, el primer render caería a invitado; la sesión se recuperaría igual ante la próxima acción autenticada. Si molesta, hacer que el cliente revalide ante error de red (≠ 401).
- Feedback post-register/login es sólo redirect; falta toast/onboarding si se decide sumarlo.
