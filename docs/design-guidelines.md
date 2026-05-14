# Alphagoat · Design System

Guía abstracta del lenguaje visual. Léela antes de generar cualquier UI nueva. No describe páginas — describe criterios.

---

## 1. Esencia

**Cálido, oscuro, argentino, monumental.**

Café tostado y dorado curry sobre marrón profundo. Tipografía pesada y declarativa. Ningún azul corporate, ningún gris frío, ningún gradiente de colores múltiples. Si dudás del color, andá al ámbar; si dudás del peso, andá al negro.

Estética: editorial-moderna. Cercana a periódicos de cultura, sellos discográficos boutique y packaging artesanal. Lejos de SaaS genérico, dashboards y material design.

---

## 2. Paleta

Toda la paleta es monocromática warm. La jerarquía se resuelve con **opacidad y peso**, no con hue.

### Tierra (fondos)

| Token | Hex | Cuándo usar |
|---|---|---|
| `bg` | `#6e2f11` | Fondo principal de páginas marketing/hero |
| `bg-deep` | `#4f1f08` | Cards, botones secundarios, áreas hundidas |
| `bg-ink` | `#2c1209` | Fondo de páginas funcionales (auth, app interna) |
| `field-bg` | `#3b1a0a` | Fondo de `<input>`, selects, áreas de form |
| `#1a0c05` | `#1a0c05` | Casi-negro cálido — hero con elementos interactivos (partículas, WebGL) |

### Acentos (curry + sienna)

| Token | Hex | Cuándo usar |
|---|---|---|
| `curry` | `#f4a02b` | Color de marca: CTA, acentos, palabras clave |
| `curry-bright` | `#ffb53d` | Hover de botones y links curry |
| `curry-soft` | `#f6c977` | Copy secundario, helpers, placeholders |
| `cinnamon` | `#b86015` | Acentos profundos, divisores activos |
| `sienna` | `#5a2208` | Texto sobre fondos curry (botones llenos) |

### Crema (texto sobre oscuro)

| Token | Hex | Cuándo usar |
|---|---|---|
| Crema cálida | `#fdf6e8` | Texto principal en pantallas funcionales (titles, labels, inputs, CTAs sobre curry). **Usar en lugar de white puro** |
| `rgba(255,255,255,0.62)` | — | Sub-copy sobre fondos cálidos (hero, marketing) |
| `rgba(246,201,119,0.55)` | — | Sub-copy sobre fondos oscuros funcionales |
| `rgba(246,201,119,0.45)` | — | Helpers, microcopy, deshabilitado |

### Excepciones (usar con criterio)

| Hex | Uso único permitido |
|---|---|
| `#ff7a59` | Bordes/texto de error — único rojo, intencionalmente cálido |
| `#7dd693` | Estado "perfecto" / reward — único verde, sólo como recompensa |

**Reglas duras:**
- Nunca inventar colores fuera de la paleta.
- Si necesitás un tono intermedio, modulá opacidad de un color existente (`rgba(244,160,43,0.x)`).
- Nunca usar `text-black`, `text-white` puros — siempre crema cálida o curry.
- No mezclar warm con cool. Si un color tira a azul/violeta, está mal.

---

## 3. Tipografía

Tres familias, roles fijos. No mezclar pesos arbitrarios.

| Familia | Variable | Rol | Pesos |
|---|---|---|---|
| **Archivo Black** | `--font-archivo` | Display, headlines monumentales, palabras gigantes decorativas | 400 (único) |
| **Inter** | `--font-inter` | Body, titulares de formularios, labels, botones, prosa | 300–700 |
| **JetBrains Mono** | `--font-mono` | Microtags, eyebrows, coda, datos técnicos, etiquetas en caps | 400, 700 |

### Cuándo usar cada una

- **Archivo Black** — sólo en piezas que tienen que gritar. Headlines de hero, palabras decorativas de fondo, marcas tipográficas. Tracking siempre apretado (-0.035 a -0.045em). Nunca para body.
- **Inter** — para todo lo que se lee de cerca: titulares medianos (clamp 26–44px, weight 500), párrafos, formularios. Weight 500 para headlines (no 600/700 — se ve sobreapurado). Weight 400 para body. Tracking apretado en titulares (-0.022 a -0.025em), normal en body.
- **JetBrains Mono** — siempre uppercase, tracking ancho (0.22–0.32em). Tamaños chicos (0.6–0.78rem). Para "etiquetar" — números, versiones, microcategorías, taglines.

### Escala disponible (en `globals.css`)

```
.h-mega   → clamp(64px, 14.5vw, 220px)   line 0.88   tracking -0.045em
.h-sub    → clamp(36px, 7.4vw, 112px)    line 0.92   tracking -0.035em
.eyebrow  → 0.78rem   tracking 0.32em    uppercase   Archivo Black
.coda     → 0.78rem   tracking 0.28em    uppercase   JetBrains Mono
```

Para form headlines (no display) usar Inter directo: `clamp(26px, 2.6vw, 32px)`, weight 500, tracking `-0.022em`, color crema.

---

## 4. Layout y espaciado

**Modernidad sin frialdad.** Mucho aire, radii grandes, asimetría cuando aporta.

- **Radios**: `12px` (inputs, cards chicos), `16px` (cards medianos), `24px` (panels grandes), `9999px` (pills).
- **Padding interno de paneles grandes**: 32–48px en desktop.
- **Gap entre secciones**: usar `gap-8` a `gap-12` en flex/grid de formularios. Generoso.
- **Splits**: layouts 50/50, 52/48, 60/40. Una columna funcional y otra atmosférica.
- **Mobile**: hero atmosférico se oculta; el form/contenido ocupa todo el viewport con padding 24–48px lateral.
- **Sombras**: profundas y suaves, no chips planos. Patrón: `0 30px 80px -30px rgba(0,0,0,0.6)` para panels flotantes; `0 8px 24px -8px rgba(244,160,43,0.6)` para botones curry destacados.

**No usar:**
- Bordes finos de 1px estilo design system. Si hay borde, opacidad baja (`rgba(244,160,43,0.14)` o menos).
- Glassmorphism / blur de fondo.
- Drop-shadow chiquita estilo Bootstrap.
- Grids rígidas de columnas iguales.

---

## 5. Componentes — patrones recurrentes

### Botones

- **Pill primario** (`.btn-curry-lg`): fondo curry, texto sienna (o crema cuando el contexto lo pide), uppercase, tracking 0.06em, sombra dorada. Para CTAs principales.
- **Pill secundario** (`.btn-curry`): variante chica del primario.
- **Icon button** (`.icon-btn`): 44×44, circular, curry sólido.
- **Tertiary**: link de texto, sin fondo, color curry o crema, underline sutil en hover.
- **Cursor pointer en todo**: añadir `cursor-pointer` a `<button>` (Tailwind no lo agrega por default).

### Inputs

- Altura mínima 48px (hit target ok).
- Fondo `field-bg`, borde curry @ 18% opacidad.
- Focus: borde curry @ 60%, ring `3px rgba(244,160,43,0.12)`.
- Error: borde `#ff7a59`. Texto del input en crema.
- Label arriba en crema, helper/error abajo en mono o sans pequeño.
- Ícono derecho (toggle password, etc.): botón 40×40, posicionado `absolute right-2`.

### Cards / paneles

- Fondo `bg-deep` o `rgba(0,0,0,0.55)` si va sobre hero animado.
- Borde opcional `rgba(244,160,43,0.14)`.
- Radio 16–24px.
- Sin sombras planas — si hay sombra, profunda.

### Microtags / etiquetas

- Mono, uppercase, tracking ancho (0.22–0.32em).
- Tamaño 0.6–0.78rem.
- Color: curry o `rgba(246,201,119,0.45)`.
- Patrón típico: `AR · v1.0 · Ningún chamuyo` (separador `·`).

---

## 6. Motion

Sutil, cálido, nunca histriónico.

- **`.fade-up`** (0.5s ease-out): traslación de 10px + opacidad. Para elementos que entran de a uno (stagger 150–200ms entre items).
- **`.fade-in`** (0.8s ease-out): bloques completos.
- **`.pulse-dot`** (1.6s loop): puntos cerca de la coda — indican "vivo".
- **`.drift`** (7s loop): traslación vertical sutil de elementos atmosféricos.
- **`.spin-loader`**: spinner de submit en CTAs.
- **Hover de botones**: `translateY(-1px)` + bg → curry-bright. Transición 200ms.
- **Hover de cards**: subir opacidad de fondo, no levantar.

Todas respetan `prefers-reduced-motion`.

**No usar:**
- Animaciones bouncy / spring exageradas.
- Animaciones de entrada en cada scroll.
- Carruseles auto-play que distraen del contenido principal.

---

## 7. Atmósfera (fondos atmosféricos)

Para paneles "hero" o columnas decorativas se aceptan tres patrones:

1. **Gradiente cálido**: radiales dorados + linear marrón. Ej:
   ```
   radial-gradient(ellipse 60% 50% at 20% 10%, rgba(244,160,43,0.18) 0%, transparent 70%),
   radial-gradient(ellipse 55% 60% at 85% 90%, rgba(44,18,9,0.8) 0%, transparent 65%),
   linear-gradient(160deg, #6e2f11 0%, #4f1f08 60%, #2c1209 100%)
   ```
2. **WebGL líquido animado** (`<WebGLLiquid>`): tonos `#3a1606` → `#6e2f11` → `#a85820`, con overlay `bg-black/45` y glows radiales en top/bottom.
3. **Partículas tipográficas interactivas** (`<CursorDrivenParticleTypography>`): Archivo Black, color `#c87a20` o curry, sobre fondo casi-negro `#1a0c05`. Las palabras decorativas (Probá / Opiná / Puntuá) son una opción.

**Siempre:** el contenido lee sobre overlay oscuro. Si dudás de la legibilidad, sumá un linear-gradient negro abajo.

---

## 8. Voz / copywriting

- **Vos**, nunca tú ni usted.
- **Verbos en imperativo singular**: probá, opiná, puntuá, sumate, registrá, armá, seguí, ingresá.
- **Frases cortas, declarativas**. Una idea por línea. Punto final cuando es titular.
- **Humor en el contraste solemne**, no en chistes obvios. La gracia viene de tratar al alfajor como tema institucional.
- **Modismos OK** con moderación: "ningún chamuyo", "de fierro", "vidriera".
- **Universo Alfajorímetro**: usar el vocabulario propio — Instituto, Ficha, Catador, Paladar, Ranking. Son consistentes entre features.
- **Microcopy**: en mono uppercase para taglines y datos técnicos. En sans para errores y helpers.

Ejemplos buenos:
- "El alfajor no se discute. Ahora se puntúa."
- "Sumate al Instituto."
- "Ningún chamuyo."
- "Mínimo 8 caracteres."
- "Emitiendo ficha…"

Ejemplos malos:
- "¡Bienvenido a Alphagoat!" (genérico)
- "Por favor ingrese su dirección de correo electrónico." (frío, formal)
- "Tu cuenta ha sido creada exitosamente." (corporate)

---

## 9. Accesibilidad

- Contraste curry sobre marrón profundo ≥ 5.6:1 (AA). Crema sobre marrón profundo ≥ 11:1 (AAA).
- Hit targets ≥ 44px.
- `prefers-reduced-motion` siempre respetado.
- `aria-label` en icon buttons; `aria-hidden` en elementos decorativos (palabras gigantes de fondo, gradientes).
- Un solo `<h1>` por página — usar `<h2>` para titulares atmosféricos del hero si la página tiene un h1 funcional en el form/contenido.

---

## 10. Cheat sheet — antes de generar UI nueva

1. ¿Es un panel funcional (form, dashboard) o atmosférico (hero, landing)? Funcional → `bg-ink` + crema. Atmosférico → `bg` + gradiente cálido o WebGL.
2. ¿Qué titular? Si es monumental → Archivo Black + `.h-mega`/`.h-sub`. Si es funcional → Inter weight 500, clamp 26–32px.
3. ¿Eyebrow / coda? Mono uppercase, tracking ancho.
4. ¿Color de copy? Crema `#fdf6e8` sobre oscuro funcional. Curry sobre marrón. Nunca white puro.
5. ¿CTA? `.btn-curry-lg` con texto crema o sienna según contraste.
6. ¿Inputs? Altura 48, radio 12, fondo `field-bg`, focus ring curry @ 12%.
7. ¿Necesitás un color que no está? Modulá opacidad de uno existente.
8. ¿Es interactivo? Cursor pointer, hover sutil, transición 200ms.
9. ¿Hay copy? Voz argentina, imperativo, frase corta.
10. ¿Animación? Solo si suma — fade-up con stagger, sin springs.
