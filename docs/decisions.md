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

## Foto de alfajor: mismo patrón que el avatar, validación movida a shared

La subida de la foto del alfajor (`AlfajorImageUploader` en `AlfajorDetail`) reusa el flujo del avatar: preview + confirmar, multipart campo `file` a `POST /alfajores/:id/imagen`, override de `Content-Type` a `multipart/form-data` (el default global del client es JSON y serializaría el `FormData` mal). Al éxito invalida `['alfajores']` (cubre detalle y catálogo, que comparten `imagenUrl`).

**Validación a `shared/schemas/imageFile.schema.ts`:** al aparecer el segundo consumidor de la misma validación (avatar + alfajor), `avatarFileSchema` se extrajo a `imageFileSchema` genérico en shared (regla "2+ features → shared"). `editProfile.schema` lo re-exporta con el nombre del avatar para no tocar a sus consumidores.

**Control solo para admins (gate client-side):** el botón "Cambiar foto" solo se renderiza si `user.role === 'ADMIN'`. El back autoriza además al creador cuando el alfajor está `PENDING`, pero hoy ese camino no tiene pantalla (el catálogo público solo lista `APPROVED` y "Proponer alfajor" está en backlog) → gatearlo en el front sería código muerto. Se amplía cuando exista esa superficie. El gate es solo UX: el back es la autoridad real de autorización.

## Foto de reseña: paso opcional del wizard (subir después de crear)

La foto de la reseña se elige en el paso "puntajes" del `ReviewWizardForm` (preview local + confirmar al publicar) y se sube por separado a `POST /reviews/:id/foto` (multipart campo `file`, override de `Content-Type`), reusando `imageFileSchema` de shared. El back autoriza solo al autor.

**Por qué subir después de crear (no en el mismo `POST /reviews`):** el endpoint de foto necesita el id de la reseña, que no existe hasta crearla. El flujo encadena: al "Publicar", se crea/edita la reseña y, en su `onSuccess(review)`, si hay foto se dispara `useUploadReviewPhoto({ reviewId: review.id, file })` y recién ahí se cierra el modal (`onSettled`). Sin foto, cierra de una.

**Un fallo de la foto no bloquea la reseña:** la reseña ya quedó publicada (toast "Reseña publicada"); si la foto falla, el hook avisa por su propio toast de error pero el modal cierra igual. El hook de foto **no** emite toast de éxito para no duplicar el de la reseña. Invalida las mismas caches que `useSubmitReview` (lista del alfajor, su detalle y el feed) para que la foto aparezca.

## Proponer alfajor: modal propio, queda PENDING (confirmación in-modal)

El CTA "Solicitá agregarlo" del `QuickReviewModal` abre un `ProposeAlfajorModal` (form nombre + marca + tipo) que crea vía `POST /alfajores` → el back lo deja en estado `PENDING` con el usuario como `createdById`. Solo se mandan los 3 campos requeridos (`descripcion`/`imagenUrl` del contrato quedan fuera del form público; YAGNI).

**Por qué un modal propio en `features/alfajores` (no un paso del wizard de reseña):** proponer un alfajor es del dominio del catálogo, no de reviews. El `QuickReviewModal` solo dispara el `open` (`proposeOpen`) y se cierra al abrirlo para no apilar dos Dialogs. Así el mismo modal sirve a futuro desde otros entry points (catálogo vacío) sin acoplarse a reviews.

**Por qué confirmación in-modal y no permitir reseñar al toque:** el alfajor nace `PENDING` y el catálogo público solo lista `APPROVED`, así que no es reseñable hasta que un admin lo apruebe. En vez de devolver al flujo de reseña (que confundiría: el que propuso no aparece), el modal muestra una pantalla "pendiente de aprobación". La mutación es fina: no invalida caches (no hay lista pública que refrescar) ni emite toast de éxito.

**Selector de marca en `features/marcas`:** `MarcaCombobox` + `useMarcasSearch` (`GET /marcas?q=` debounced) viven en `marcas` (su dominio), no en `alfajores`. Un `409` del create (ya existe ese nombre+marca) se muestra inline bajo el nombre; otros errores van a toast.

## Panel admin: guard client-side que responde 404, no redirect ni middleware

`/admin` monta un `AdminGuard` que, resuelta la sesión, llama al `notFound()` de Next para cualquier visitante no-ADMIN; mientras carga muestra skeleton. No hay chequeo en `middleware.ts` ni redirect a `/feed`.

**Por qué:** el JWT es HTTP-only y en Edge no se puede leer el rol sin verificar el token (o pegarle al back en cada request); y un redirect delata que la ruta existe. El 404 no revela nada. Es solo UX: la seguridad real la pone el back (401/403 en `/admin/alfajores/*`). Moderar usa **invalidación simple** en vez del update optimista de likes/follows — cola de un solo operador, la corrección vale más que los milisegundos; un 400 (ya moderado en otra pestaña) muestra toast específico e invalida para despawnear el card viejo.

## Álbum: hoja transparente sin watermark, layout de viewport fijo con footer bajo el fold

El diseño aprobado en claude.ai/design (spec `docs/superpowers/specs/2026-07-16-album-page-design.md`) tenía la hoja (`AlbumHoja`) como panel `paper-raised` con sombra profunda + una inicial gigante de la marca como watermark de fondo. Ambos se sacaron durante la ronda de pulido en vivo tras probar el fondo jaspeado de la página: el panel raised + sombra competía visualmente con la textura jaspeada nueva, y el watermark quedaba redundante sobre un fondo que ya tiene "alma" propia. La hoja quedó transparente (`AlbumHoja.tsx`), dejando que el fondo de la página se vea directo.

**Layout de viewport fijo:** `AppHeader` + `main` quedan envueltos en un bloque `h-screen` con `main` `flex-1 overflow-y-auto`, para que el álbum siempre ocupe exactamente el viewport sin importar cuántas figuritas tenga la hoja activa (antes, con pocas figuritas, el `Footer` quedaba asomando porque el `flex-1` dentro de un `min-h-screen` solo reparte espacio _sobrante_, y el contenido del álbum ya casi llenaba el viewport típico). El `Footer` queda como hermano fuera de ese bloque — visible solo si se scrollea la página entera más allá del viewport, a diferencia del resto de las páginas donde el footer cierra el contenido normal. Es consistente solo dentro de esta ruta (sensación de "app" para el álbum), no un patrón a copiar en otras páginas sin la misma justificación. El paginador (`HojaPager`) se ancla al fondo del área visible vía `mt-auto` en `AlbumView`, así su posición no depende de la cantidad de figuritas de la hoja activa.

**Pendiente en el board:** rediseñar la load bar de completitud (lineal simple hoy) y evaluar un chart tipo medidor en su lugar — ver Backlog.

## Fondos animados: CSS sobre `transform`, no WebGL ni `background-position`

El sidebar del perfil usa un mesh animado hecho con radiales y dos capas que derivan (`sidebar-bg-mesh` en `globals.css`). Se evaluó y descartó calcar el `WebGLLiquid` del hero de `/`.

**Por qué no WebGL:** en la landing el canvas ocupa el viewport, es lo único en pantalla y se ve una vez. En el perfil sería un panel de 300px que compite con contenido real y se monta en cada perfil visitado — un contexto WebGL, un `requestAnimationFrame` corriendo y su propio arnés de error boundary + skeleton excluido de cobertura, para decorar. Peor en mobile, donde el sidebar pasa a full-width y el costo de GPU se nota.

**Por qué `transform` y no `background-position`:** mover la posición de un gradiente obliga a rasterizar el degradé entero en cada frame; `translate3d`/`scale` los resuelve el compositor sin repintar. Es lo que hace que un fondo animado sea gratis en vez de comerse frames — y es la razón por la que no hizo falta subir a WebGL.

**Por qué dos capas y no una:** una sola capa de manchas difusas desplazándose en bloque es imperceptible: no hay bordes contra los cuales medir el movimiento. Lo que se percibe es cómo cambia el solapamiento entre dos capas con recorridos opuestos. Los períodos (13s/17s) no son múltiplos, así que el ciclo combinado tarda en repetirse. El grano queda fijo: moverlo con las manchas hace que la textura "nade".

## Liquid glass: descartado — el efecto necesita un fondo que no tenemos

Se probó `backdrop-filter` (a mano y con el componente `liquid-glass` de ui-layouts) en las review cards y en modales. Se revirtió por completo; no quedó nada en el repo.

**Por qué:** el vidrio no tiene apariencia propia, muestra lo que hay detrás desenfocado. El feed es `--color-paper` liso y las cards `--color-paper-raised`: difuminar un color plano devuelve el mismo color plano, por más blur o transparencia que se le ponga. Lo mismo en modales, donde el `bg-black/80` del overlay del `Dialog` es una capa casi uniforme — de ahí que el primer intento "no se notara" y que bajar la opacidad del overlay fuera parte necesaria del efecto (y que sobre papel crema un velo negro produzca gris barroso, no vidrio).

Hacerlo visible exige darle materia al fondo de la app (mesh o imagen bajo la lista), y eso cambia la identidad "El Diario / papel crema": el vidrio es el idioma de visionOS/iOS, no el de un sistema de imprenta con sellos y figuritas. Sumado al costo de `backdrop-filter` en una lista larga con scroll en mobile, y a que el contraste del texto deja de ser constante para pasar a depender de lo que pase por detrás, no compensa. **Si algún día se retoma, el orden correcto es el fondo primero, las superficies después** — al revés no se puede evaluar.

De paso: el paquete `motion` que arrastra ese registry es el sucesor de `framer-motion`, que ya está instalado. Instalarlo deja las dos librerías en el bundle.

## Recorte del feed en mobile: de render, no de query

Bajo 768px `FeedReviews` muestra 8 reseñas y el resto queda detrás de "Ver más". El `limit` de `useFeedReviews` sigue en 20 para todos.

**Por qué no bajar el `limit` en mobile:** la queryKey no incluye el tamaño de página, así que un límite distinto por viewport duplicaría la entrada de cache (y al rotar el dispositivo se pediría de nuevo); además convertiría un request en tres para la misma cantidad de contenido. El recorte es de render: los datos ya están, "Ver más" no pide nada y recién después el mismo botón pasa a paginar de verdad.

**Un solo botón para las dos cosas:** revelar el recorte y pedir la página siguiente son la misma intención para quien lee ("mostrame más"), así que comparten nombre y estilo. Dos etiquetas distintas para la misma acción era la inconsistencia visible.

**`useMediaQuery` con `useSyncExternalStore`** en vez de `useState` + `useEffect`: evita un primer frame con el valor equivocado y declara explícitamente el snapshot de servidor (`false` = forma de escritorio, se corrige al hidratar).

## Confirmación sólo al dejar de seguir

`FollowButton` abre un `Dialog` de confirmación al tocar "Siguiendo"; "Seguir" dispara la mutación directo.

**Por qué asimétrico:** seguir es barato y reversible, y meterle fricción penaliza la acción que se quiere fomentar. Dejar de seguir suele ser un click accidental sobre el botón de estado. El gate va sólo en la dirección destructiva.

**Por qué `Dialog` y no `AlertDialog`:** el componente semánticamente correcto para un confirm destructivo es `alert-dialog`, pero no está instalado y traerlo suma `@radix-ui/react-alert-dialog`. Ya existía el precedente de `RejectAlfajorDialog` resolviendo lo mismo con `Dialog`.

**Cierra en `onSettled`, no al click:** `useToggleFollow` es optimista con rollback. Cerrar al confirmar dejaría al usuario viendo el modal desaparecer mientras el estado vuelve atrás por un error de red.

## Sugeridos del buscador: pila de avatares, sin `FollowButton`

Los sugeridos (`SuggestedUsersGroup`) son una pila superpuesta con contador `+N` que se despliega en columna al tocarlo.

**Por qué se sacó el `FollowButton` de las tarjetas:** no entra en una baldosa de 80px sin romper la proporción, y competía con el tap que abre el perfil. En los resultados de búsqueda (cuando hay query) sigue estando.

**Por qué no el `avatar` de shadcn:** el que se evaluó es la variante **Base UI** del registry, otra familia de primitivos que la del resto de la app (Radix). Habría dejado dos librerías de primitivos conviviendo para reemplazar algo que `UserAvatar` ya resuelve, incluido el fallback del gato.

**Por qué el username no va bajo cada avatar:** en una pila superpuesta no hay ancho. Colapsado se muestra el del avatar apuntado en una línea al pie, con alto reservado para que no empuje la lista; expandido, cada fila lo lleva al lado. La transición entre ambos estados es una animación de _layout_: los avatares ya montados viajan a su nueva posición en vez de desmontarse y volver a aparecer.
