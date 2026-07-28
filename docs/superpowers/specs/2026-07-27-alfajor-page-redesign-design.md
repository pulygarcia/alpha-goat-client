# Rediseño de `/alfajores/[id]`

Fecha: 2026-07-27
Rama: `feat/alfajor-page-redesign`
Fuente del diseño: proyecto Claude Design `AlfajorPage` (`9c539aee-b6aa-44bc-a331-8166128505e0`)

## Objetivo

Reemplazar la página de detalle del alfajor por el layout de dos columnas del
mockup: una ficha lateral sticky con el puntaje promedio como protagonista, y
una columna de reseñas con los 5 ejes de cata visibles en cada card.

Cierra la task del board "mostrar rating promedio en `/alfajores/[id]`"
(`avgRating` ya lo devuelve el back desde el PR server #31).

## Alcance

Solo front, en este repo. La página queda terminada y funcionando con los datos
que el back expone hoy; el único bloque que depende de un endpoint futuro
(`avgEjes`) renderiza su estado apagado hasta que el back lo mande.

Fuera de alcance: implementar `avgEjes` en el back (queda como task del board),
ordenamiento de reseñas, y cualquier cambio en feed, perfil o ranking.

## Layout

Dos columnas, `400px 1fr`, gap 56px, `max-width: 1280px`.

**Aside (sticky, `top: 24px`)**, de arriba a abajo:

1. Foto del alfajor, `aspect-ratio: 433/500`, `object-fit: contain`.
2. Marca: disco con inicial (o logo) + nombre + `·` + provincia.
3. Título del alfajor, Archivo Black 38px, `letter-spacing: -.035em`.
4. Pill del tipo (Chocolate/Blanco/…), mono 10px con borde.
5. Bloque de puntaje, entre dos hairlines: score 76px Archivo Black, `/ 10.0`,
   conteo de reseñas, y el botón "Reseñar" alineado a la derecha.
6. Bloque "Promedio por eje": 5 barras horizontales (`132px 1fr 34px`).
7. Descripción.

**Columna de reseñas**: header con título + etiqueta de orden sobre una regla
de 2px, y debajo el estado que corresponda.

**Breakpoints.** ≤1023px: una sola columna, el aside deja de ser sticky y la
ficha pasa a fila (foto 200px a la izquierda del texto). ≤600px: foto 104×104
cuadrada, título 23px, score 52px, barras `104px 1fr 30px`.

## Paleta

Esta página adopta los colores del mockup en vez de los tokens crema de la app
(decisión explícita del usuario, no un descuido):

| Rol               | Valor     |
| ----------------- | --------- |
| Fondo             | `#fff`    |
| Tinta             | `#2b1a10` |
| Texto secundario  | `#5d564e` |
| Texto terciario   | `#8a837b` / `#9b948b` |
| Acento            | `#b86015` |
| Acento oscuro     | `#4a3527` |
| Hairline          | `#eceae6` |
| Borde             | `#ddd8d1` |
| Superficie inerte | `#efece7` / `#f4f2ee` |

Los valores viven como CSS vars con scope en el contenedor de la página, no
como tokens globales: nada de esto debe filtrarse al resto de la app.

Tipografías: las tres que el proyecto ya carga (Archivo Black, Inter,
JetBrains Mono). Sin fuentes nuevas.

## Datos

### Lo que ya existe

`GET /alfajores/:id` → `id`, `nombre`, `marca {nombre, provincia, logoUrl}`,
`tipo`, `descripcion`, `imagenUrl`, `avgRating`.

`GET /reviews?alfajorId=` (paginado) → por reseña: `author {username,
avatarUrl}`, `ratingGeneral`, los 5 ejes, `comentario`, `fotoUrl`,
`likesCount`, `commentsCount`, `isLiked`, `createdAt`; y `total` a nivel página.

### El conteo de reseñas

Sale del `total` de la primera página de `useAlfajorReviews`. El aside llama al
mismo hook que la columna de reseñas: misma query key, mismo cache de TanStack
Query, ningún request adicional. No se pide al back un `reviewsCount` que ya
está disponible.

### `avgEjes` (pendiente de back)

Campo nuevo y aditivo en `GET /alfajores/:id`:

```ts
avgEjes: {
  dulzor: number;
  cantidadDDL: number;
  calidadBano: number;
  ratioTapaRelleno: number;
  textura: number;
} | null; // null cuando el alfajor no tiene reseñas
```

Valores 0–10 con 1 decimal, mismos nombres que `ReviewRatings`. En el front se
tipa como opcional (`avgEjes?: AlfajorAvgEjes | null`), de modo que un back que
todavía no lo manda es indistinguible de un alfajor sin reseñas.

Descartado calcularlo en el front sobre las reseñas en cache: el número
cambiaría al paginar y no coincidiría con el promedio real. Un dato engañoso es
peor que un bloque apagado.

## Componentes

Todos en `src/features/alfajores/components/`, salvo el card de reseña.

- **`AlfajorDetail`** — orquesta: llama `useAlfajor` y `useAlfajorReviews`,
  resuelve loading/404/error de la ficha y compone las dos columnas. Sigue
  siendo el dueño del estado del `QuickReviewModal`.
- **`AlfajorIdCard`** — bloques 1 a 4 del aside (foto, marca, título, tipo). El
  slot de foto es el `AlfajorImageUploader` existente, restilado: conserva el
  gating de admin y el estado "sin foto".
- **`AlfajorScoreBlock`** — score, `/ 10.0`, conteo y botón "Reseñar". Recibe
  `avgRating: number | null` y `reviewsCount: number`; con `avgRating === null`
  muestra `—.—` en gris y "todavía sin puntaje".
- **`AlfajorEjesAverage`** — las 5 barras. Recibe `avgEjes` (posiblemente
  ausente) y renderiza barras grises sin número cuando no hay dato.
- **`AlfajorReviewsPanel`** — la columna derecha entera: header, skeleton,
  error con botón de reintento, estado vacío con CTA "Ser el primero", listado
  y "Cargar más". Recibe un callback `onReview` para que tanto el CTA del
  estado vacío como el botón del aside abran el mismo `QuickReviewModal`, cuyo
  estado sigue viviendo en `AlfajorDetail`.
- **`AlfajorReviewCard`** (en `src/features/reviews/components/`) — el card del
  mockup: avatar + username + fecha, score grande a la derecha, comentario (o
  la línea "Cató sin dejar comentario"), grid de 5 ejes con mini-barras, foto
  opcional, y pie con `LikeButton` + contador de comentarios.

**Por qué un card nuevo y no `context` en `ReviewCard`.** El `ReviewCard`
compartido lo usan feed y perfil; el del mockup muestra los ejes inline, mueve
el score y vive en otra paleta. Meterlo detrás de una prop `context` daría un
componente con dos personalidades y haría frágil cualquier cambio en feed.
`ReviewCard` queda intacto.

**Interacciones que se conservan.** Like optimista vía `LikeButton`/
`useToggleLike`, apertura del `ReviewDetailModal` al clickear el card, link al
perfil del autor, e invalidación de `['alfajores','detail',id]` al reseñar (ya
la hace `useSubmitReview`, así que el promedio se actualiza solo).

## Elementos del mockup que no se implementan

- **Su header propio** (`← Catálogo` + wordmark "alfa.cata"): el layout `(app)`
  ya monta el `AppHeader`. Se conserva únicamente el link "Volver al catálogo".
- **El control "Más recientes"**: `GET /reviews` no acepta parámetro de orden.
  Queda como etiqueta fija, no como control que no hace nada.

## Manejo de errores

Ficha y reseñas fallan por separado, como en el mockup:

- Ficha 404 → mensaje de "no encontramos este alfajor" (se conserva el actual).
- Ficha error genérico → mensaje de reintento; no se renderiza la columna
  derecha.
- Reseñas error → la ficha sigue visible y el panel derecho muestra el bloque
  de error con botón "Reintentar" que dispara `refetch()`.
- Reseñas vacías → bloque punteado "Nadie lo reseñó todavía" con CTA que abre
  el `QuickReviewModal`.

## Testing

Vitest + RTL, mockeando los hooks de `api/`. Cobertura ≥85% en las 4 métricas.

- `AlfajorScoreBlock`: con puntaje, sin puntaje, singular/plural del conteo.
- `AlfajorEjesAverage`: con `avgEjes`, sin `avgEjes` (estado apagado), y que
  el ancho de cada barra corresponda al valor.
- `AlfajorReviewsPanel`: loading, error + reintento, vacío + CTA, listado y
  "Cargar más".
- `AlfajorReviewCard`: reseña con y sin comentario, con y sin foto, los 5 ejes
  presentes, contador de comentarios en singular/plural.
- `AlfajorDetail`: 404, error, y que ficha y reseñas compartan una sola query
  de reseñas.

Los tests existentes de `AlfajorDetail` se actualizan al nuevo árbol.
