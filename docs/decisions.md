# Decisiones de diseño — alphagoat-client

Registro de **decisiones no obvias**: contratos, trade-offs y "por qué no la opción evidente". No es un log de avance — eso lo cubren el historial de git, los PRs y el board del vault. Acá solo va lo que el código no puede contar por sí mismo.

Cada entrada: qué se decidió y, sobre todo, **por qué**.

---

## Modelo de acceso: ver público / actuar autenticado

Ver es público (feed, alfajores, reseñas, ranking); **actuar** (like, comentar, seguir, abrir el modal de reseña) exige login. El gate vive en cada acción (`useRequireAuth` → `/login?next=...`), no en la página.

**Por qué:** un visitante anónimo tiene que poder explorar todo el contenido para engancharse; murar el feed espantaba a quien todavía no tiene cuenta. El back acompaña: `GET /feed` y `GET /reviews` usan auth opcional (anónimo ve todo con `isFollowing`/`isLiked` en false). Murar por ruta (middleware + `RequireAuth`) quedó solo para perfil/admin.

## Sesión resuelta en el servidor (sin flash de invitado)

El `RootLayout` (Server Component async) lee la cookie HTTP-only y llama a `GET /auth/me` en el server; el `User | null` baja como `initialData` de la query `['auth','me']`.

**Por qué:** evita el parpadeo "invitado → autenticado" en el primer render y un round-trip extra a `/me` en el cliente. **Consecuencia asumida:** leer cookies en el root layout opta a **render dinámico** en todas las rutas — esperado para una app con sesión.

## Logout: `setQueryData(null)`, no `removeQueries`

Al cerrar sesión se setea la query `['auth','me']` a `null` en vez de removerla.

**Por qué:** el observer siempre montado del `AuthProvider` recreaba la query y el `initialData` del server render (fresco por `staleTime`) re-sembraba el usuario stale → UI "logueada" sin cookie hasta un F5. El `setQueryData(null)` explícito no puede ser pisado por `initialData`.

## Reseñar = wizard modal, no página `/resenar`

La única superficie para reseñar es el `QuickReviewModal` (wizard de 3 pasos sobre el `Dialog` de shadcn). No existe ruta `/resenar`.

**Por qué:** una sola superficie de reseña, accesible desde cualquier contexto (FAB, header, detalle) sin navegar fuera. Se dropeó la página dedicada y el viejo `ReviewForm`.

## Página de ranking: global all-time, no la semana

`/ranking` rankea el **histórico global** por promedio de `ratingGeneral`. La ventana semanal (`GET /ranking/weekly`) se queda **solo en el rail del feed**.

**Por qué:** la página es la cara del "índice nacional" y no debe verse vacía. El weekly es una ventana rolling de 7 días con piso de 3 reseñas: si nadie reseña esa semana, devuelve vacío — aceptable para un widget del rail, inaceptable para la página principal del ranking.

**Sub-decisiones del ranking global:**

- **Promedio simple, no bayesiano.** Para v1 es lo más claro y honesto; un score ponderado (que penalice pocas reseñas) agrega una fórmula y parámetros a justificar — se difiere hasta que haga falta.
- **Piso de 5 reseñas** (vs 3 del weekly): la ventana all-time es mucho más larga, así que el piso puede ser más exigente sin vaciar el ranking.
- **Orden total `score DESC, reviewsCount DESC, id ASC`.** El desempate por `id` no es "justicia": es técnico. Sin un orden 100% determinístico, dos alfajores empatados podrían cambiar de lugar entre consultas y la paginación por offset repetiría o saltearía filas.
- **La posición la deriva el front del offset** (`(page-1)*limit + i + 1`), no la persiste el back.

## Weekly ranking: ventana rolling, no calendario

El "Ranking semanal" usa una ventana móvil de 7 días, no la semana de calendario. Piso de 3 reseñas.

**Por qué:** la semana de calendario dejaría el ranking vacío cada lunes a la mañana.

## "Marcas en foco" rankea por controversia (interna)

Las marcas del rail se eligen por **dispersión** del `ratingGeneral` (las que más dividen opiniones) en 30 días con piso de muestra.

**Por qué:** genera mejor contenido que "las mejores" (siempre las mismas). La controversia es una métrica **interna**: no se expone en la respuesta, solo decide el orden.

## Recomendaciones: content-based con cold start explícito

`GET /recommendations` (auth) usa la huella de gusto del usuario sobre los 5 ejes. `score = 0.7·matchPct + 0.3·(ratingGeneral·10)`; excluye lo ya reseñado; piso de 3 reseñas por alfajor.

**Por qué el cold start importa:** un usuario sin reviews no tiene huella → se devuelven los top rankeados con `matchPct: null`, y el front omite la cifra de afinidad en vez de mostrar un 0% engañoso.

## Feed: scope por defecto "todas", no "hoy"

El feed arranca con `scope: null` (todas las reseñas), no filtrando por el día.

**Por qué:** un default `today` dejaba la lista vacía si no hubo reseñas hoy — mala primera impresión. El usuario opta por un chip (Hoy/Semana/Siguiendo) si quiere acotar.

## No hay feature de "compartir"

No existe `sharesCount` ni acción de compartir en ningún contrato.

**Por qué:** decisión de producto — se deja afuera deliberadamente; los contratos del feed/reviews no la contemplan para no arrastrar un campo muerto.

## Card de reseña unificada con prop de contexto

Un solo `ReviewCard` con `context: 'feed' | 'alfajor'` (en el detalle oculta alfajor/marca, redundantes). View-model común `ReviewCardVM` con adaptadores puros.

**Por qué:** evita dos cards casi-iguales que se desincronizan. El contexto ajusta qué se oculta, no duplica el componente.

## Límite de 280 caracteres, también en el back

El tope de 280 en comentarios y comentario de reseña se valida en el front (RHF/Zod) **y** se fuerza en el back (`@MaxLength`).

**Por qué:** la validación del front es UX; sin el tope en la API, un cliente directo se la saltea. La regla vive en ambos lados a propósito.

## Convención de paginación: offset `{ items, total, page, limit }`

Todos los listados paginados (alfajores, reviews, ranking) usan paginación por offset con esa envoltura, no cursores.

**Por qué:** simple y suficiente para la escala del catálogo; el front arma el "cargar más" con `page*limit < total`. Mantener una sola convención evita mezclar cursor y offset entre features.

## Qué se testea y qué no (política de coverage)

Gate del 85% (branches/functions/lines/statements). **No** se testean: `shared/components/ui/**` (shadcn), componentes puramente presentacionales (shells visuales, skeletons, headers), wrappers `api/` (se mockean siempre), providers, `*.server.ts`, `middleware.ts`, `config/**`.

**Por qué:** testear shells visuales y wrappers triviales infla el número sin aportar señal. Se testea **comportamiento** (hooks, lógica de datos, componentes con lógica), mockeando el módulo `api/` — nunca la red.

## Micro-animaciones: un solo sistema (Framer Motion), escalonado por tanda

Las animaciones de entrada de listas (feed, ranking) usan `framer-motion` (ya instalado) vía un wrapper compartido `shared/components/motion/StaggerItem`. Se evaluó `transitions.dev` y se descartó: sumar un segundo sistema de animación (CSS suelto) lleva a timings/easings inconsistentes y deuda de mantenimiento.

El feed renderiza iterando **por página** del infinite scroll y pasa `index` = posición dentro de su página (no el índice global). Así cada página nueva escalona solo sus propios items y las cards ya montadas no vuelven a animarse.

**Por qué no el índice global:** con delay por índice global, al traer la página 2 las cards viejas conservarían su animación pero las nuevas arrancarían con un delay enorme (item 20+), y un re-render que recalcule índices podría re-disparar el fade. El índice por tanda mantiene el escalonado corto y estable. `StaggerItem` respeta `prefers-reduced-motion` (devuelve los hijos sin envolver).

## Avatar: subida multipart con preview + confirmar, validada en el cliente

La subida del avatar (`AvatarSection` en `EditProfileModal`) usa flujo **preview + confirmar**: elegir archivo muestra una vista previa local (`URL.createObjectURL`), y recién "Guardar foto" dispara la mutation (`POST /users/me/avatar`, multipart campo `file`). El back devuelve el `User` con `avatarUrl`; al éxito se invalidan `['auth','me']` y `['profile']` y se libera el objectURL.

**Por qué preview + confirmar** (no subida inmediata al elegir): da una salida sin coste — el usuario ve la foto antes de comprometerla y puede cancelar sin haber tocado Cloudinary ni el asset.

**Validación duplicada (cliente + back):** `avatarFileSchema` replica el `ImageFilePipe` del back (jpeg/png/webp, ≤5 MB). No es redundancia ociosa: corta el archivo inválido antes de gastar un round-trip y le da feedback inmediato al usuario. El back sigue siendo la autoridad (el cliente es manipulable); el schema solo mejora la UX.
