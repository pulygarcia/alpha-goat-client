# Álbum de figuritas — `/u/[username]/album` (front)

**Fecha:** 2026-07-16 · **Estado:** aprobado (diseño iterado en claude.ai/design, proyecto "Alphagoat — Álbum de figuritas")

## Qué es

Página pública estilo álbum de figuritas del Mundial con el catálogo completo de alfajores APPROVED, agrupado en **hojas por marca**. Las figuritas que el dueño reseñó se ven a color con su nota; las que no, en blanco y negro. Muestra % de completitud por hoja y global.

## Datos

- Un solo endpoint, ya shippeado (PR server #28): `GET /users/by-username/:username/album` (público, 404 si el username no existe).
- Response: `{ owner, stats {collected,total,pct}, hojas: [{ marca, stats, alfajores: [{ id, nombre, tipo, imagenUrl, avgRating, collected, myRating, reviewId }] }] }`. Hojas alfabéticas; figuritas por `avgRating` desc nulls-last.
- Feature `src/features/album/` con `api/album.api.ts` (`albumApi.byUsername`) + `hooks/useAlbum.ts` (TanStack Query, key `['album', username]`) + `types/`. Nunca fetch desde componentes.

## Decisiones de diseño (aprobadas)

1. **Navegación: una hoja por vez** (metáfora de álbum físico), no scroll largo. La hoja activa vive en el estado del cliente y se sincroniza a la URL con `?marca=<id>` (`router.replace`, sin scroll) para deep-linking; sin param → primera hoja.
2. **Figurita V2 "Estampilla postal"**: fondo `paper-raised`, borde perforado (perforación arriba/abajo vía pseudo-elementos con radial-gradient del color de página), marco interno fino `rgba(74,30,8,.25)`, imagen del alfajor (fallback gradiente warm por tipo), nombre Inter 600, tipo + `avgRating` en mono uppercase.
   - **Conseguida**: a color; `myRating` como "valor postal" en Archivo Black arriba a la derecha.
   - **Sin conseguir**: imagen `grayscale(1)`, fondo `paper-sunken`, marco interno punteado, textos al ~45% de opacidad, tag rotado "SIN CONSEGUIR" (mono, chip marrón).
   - Toda figurita linkea a `/alfajores/[id]`.
3. **Hoja**: panel `paper-raised` radio 24, sombra profunda; header con coda "Hoja NN · Provincia", nombre de marca en Archivo Black, contador `X/Y` + "% de la hoja" y barra de progreso (gradiente cinnamon→curry sobre `paper-sunken`); inicial de la marca gigante como marca de agua (`rgba(74,30,8,.05)`, `aria-hidden`). Grilla fija: 3 columnas en `md+`, 2 en mobile.
4. **Hojas flacas (1–2 figuritas)**: la grilla se completa con una **ficha de marca** editorial (sello circular punteado con iniciales, coda "Ficha de marca", copy "Edición corta: N figuritas en catálogo", provincia en Archivo Black). Solo cuando la hoja tiene 1 ó 2 alfajores; con 3+ la grilla fluye normal sin relleno.
5. **Chrome del álbum**: header con avatar + coda "Álbum de @username", título "El Álbum" (Archivo Black), `X/Y` global + "% completo" y barra de progreso global. Debajo, **índice de marcas** como pills scrolleables horizontales (activa = fondo marrón `#4a1e08` texto crema; hoja al 100% = % en verde reward `#7dd693`). Abajo, **pager** en panel `paper-raised`: botón ghost "← marca anterior", centro "Hoja N de M" + coda de marca/provincia, botón curry "marca siguiente →". En los extremos el botón correspondiente se deshabilita.

## Estados

- **Loading**: skeleton de hoja (header + grilla) en tonos paper, patrón de los skeletons del feed.
- **404** (username inexistente): `notFound()` de Next.
- **Error**: mensaje con retry vía `isError` de la query — nunca pantalla en blanco.
- El catálogo APPROVED siempre tiene contenido en producción; si `hojas` viene vacío, empty state simple con coda ("Todavía no hay alfajores en el catálogo").

## Motion

Figuritas entran con fade-up + stagger al montar y al cambiar de hoja (framer-motion, patrón `StaggerItem`); respeta `prefers-reduced-motion`. Sin springs ni page-flip 3D (YAGNI).

## Componentes

```
src/app/(app)/u/[username]/album/page.tsx   — thin, resuelve params y monta AlbumView
src/features/album/
  api/album.api.ts        hooks/useAlbum.ts        types/index.ts
  components/
    AlbumView.tsx         — orquesta: query, hoja activa, sync ?marca=
    AlbumHeader.tsx       — owner + stats globales + barra
    MarcaIndex.tsx        — pills scrolleables
    HojaPager.tsx         — anterior / posición / siguiente
    AlbumHoja.tsx         — header de hoja + grilla + watermark
    FiguritaCard.tsx      — estampilla (conseguida / sin conseguir)
    FichaMarca.tsx        — relleno editorial para hojas de 1–2
    AlbumSkeleton.tsx     — loading
```

## Testing

Vitest + RTL, mock del módulo `api/`: `useAlbum` (éxito/error), `AlbumView` (hoja default, cambio por pill y pager, sync de `?marca=`, extremos deshabilitados), `FiguritaCard` (conseguida vs sin conseguir: valor postal, tag, link), `AlbumHoja`/`FichaMarca` (relleno solo con 1–2). Cobertura ≥85%. No se testean skeletons puramente presentacionales.

## Fuera de alcance (MVP)

- Logro "hoja completa" (gancho futuro del board).
- Cambios en el back (contrato cerrado en PR server #28).
