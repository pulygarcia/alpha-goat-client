# AlphaGoat · Hero v5 — Next.js

> Reseñas de alfajores argentinos. Hero section de la landing.
> Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4

---

## 1. Concepto

**"El alfajor no se discute. Ahora se puntúa."**

El hero plantea al alfajor como producto-héroe único. Tono canchero, argentino, con humor sutil; estética cálida y saturada. Fondo WebGL líquido animado (marrón profundo). La promesa de la app se insinúa en el marquee de reseñas reales — sin explicar todo en el hero.

---

## 2. Estructura del proyecto

```
app/
├── layout.tsx              # Fuentes (next/font), metadata global, <body>
├── page.tsx                # Landing — renderiza <Hero />
├── globals.css             # @theme tokens + utilities base
└── (marketing)/
    └── _components/
        ├── Hero.tsx            # Server Component — layout completo del hero
        ├── Nav.tsx             # Server Component — grid 3 cols
        ├── LogoMonogram.tsx    # Renderiza public/alphagoat-logo.svg con next/image (56×56)
        ├── AlfajorReviews.tsx  # Client Component — marquee de reseñas ficticias
        └── CtaButton.tsx       # (archivado — usar btn-curry-lg directo)

public/
├── alphagoat-logo.svg      # Logo oficial SVG circular (sello)
└── alfajor/                # Fotos reales cuando estén
```

---

## 3. Sistema de color

Paleta monocromática warm: marrón profundo + dorado curry. Sin azules, grises ni acentos. La jerarquía se resuelve con opacidad y peso tipográfico.

| Token                   | Hex        | Uso                                                  |
| ----------------------- | ---------- | ---------------------------------------------------- |
| `--color-bg`            | `#6e2f11`  | Fondo principal                                      |
| `--color-bg-deep`       | `#4f1f08`  | Áreas más profundas                                  |
| `--color-curry`         | `#f4a02b`  | Color principal: texto, botones, acentos             |
| `--color-curry-bright`  | `#ffb53d`  | Hover de botones                                     |
| `--color-curry-soft`    | `#f6c977`  | Copy secundario, texto al 70%                        |
| `--color-cinnamon`      | `#b86015`  | Acentos oscuros, sombras                             |
| `--color-sienna`        | `#5a2208`  | Texto sobre fondos curry (botones)                   |

**Regla:** curry sobre marrón profundo. Si necesitás contraste, usá `curry-soft` o `sienna`. No inventes colores.

---

## 4. Tipografía

| Familia              | Variable CSS       | Uso                                       |
| -------------------- | ------------------ | ----------------------------------------- |
| **Archivo Black**    | `--font-archivo`   | Headlines (.h-mega, .h-sub), eyebrow      |
| **Inter**            | `--font-inter`     | Body copy                                 |
| **JetBrains Mono**   | `--font-mono`      | Eyebrow, tags, coda, datos pequeños       |

### Escala de display

```css
.h-mega { font-size: clamp(64px, 14.5vw, 220px); line-height: 0.88; letter-spacing: -0.045em; }
.h-sub  { font-size: clamp(36px, 7.4vw, 112px);  line-height: 0.92; letter-spacing: -0.035em; }
```

### Escala secundaria

- `.eyebrow`: `0.78rem`, tracking `0.32em`, uppercase, Archivo Black
- `.coda`: `0.78rem`, tracking `0.28em`, uppercase, JetBrains Mono
- Nav links: `11px`, tracking `0.16em`, uppercase, weight 700

---

## 5. Layout actual del Hero

```
┌──────────────────────────────────────────────────────────┐
│  [Ranking · Comparador · Método]  [LOGO]  [Login · CTA]  │  ← <Nav />
├──────────────────────────────────────────────────────────┤
│                                                          │
│              EL ÍNDICE NACIONAL DEL ALFAJOR              │  ← eyebrow
│                                                          │
│                      EL ALFAJOR                          │  ← .h-mega
│                     NO SE DISCUTE.                       │  ← .h-sub
│                                                          │
│            · Ahora se puntúa, ningún chamuyo             │  ← coda + pulse-dot
│                                                          │
│  ◄═══════════ marquee de reseñas ════════════►           │  ← <AlfajorReviews />
│                                                          │
│               [ Dejá tus reseñas → ]                     │  ← btn-curry-lg
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Fondo:** `<WebGLLiquid>` animado (`colorDeep #3a1606`, `colorMid #6e2f11`, `colorHighlight #a85820`) + overlay `bg-black/45` + glows radiales superior e inferior.

---

## 6. Componentes

### `<Nav />` — grid 3 columnas
- Izquierda: links (Ranking, Comparador, Método)
- Centro: `<LogoMonogram />` — `next/image` con `public/alphagoat-logo.svg`, 56×56px
- Derecha: "Iniciar sesión" + `.btn-curry` "Calificar"

### `<AlfajorReviews />` — Client Component
Marquee horizontal usando `TestimonialMarquee` (shadcn `@componentry/testimonial-marquee`, en `src/shared/components/ui/testimonial-marquee.tsx`). Variant `"default"`, speed `35`.

Cards temizadas para el fondo oscuro del hero vía scope CSS `.alfajor-reviews`:
- `bg-black/5` → `rgba(0,0,0,0.55)`
- `text-muted-foreground` → `rgba(255,220,160,0.8)`
- `text-foreground` → `rgba(255,240,200,1)`
- `border-border` → `rgba(255,180,80,0.18)`

Avatares via DiceBear (`https://api.dicebear.com/9.x/thumbs/svg?seed=X`).

### Botones

```css
.btn-curry    /* pill small — CTAs secundarios, nav */
.btn-curry-lg /* pill grande, sombra dorada — CTA principal del hero */
.icon-btn     /* 44×44 circular */
```

CTA del hero: `.btn-curry-lg` con `<ArrowRight size={16} />` de lucide-react.

---

## 7. Atmósfera

- **WebGL líquido**: fondo animado orgánico en tonos marrones profundos. No es estático.
- **Overlay negro** `bg-black/45` encima del WebGL para legibilidad del texto.
- **Glow superior**: `radial-gradient` dorado tenue `rgba(255,180,80,0.08)`.
- **Glow inferior**: `radial-gradient` negro `rgba(0,0,0,0.30)`.

Nada de glassmorphism, gradientes de colores, ni borders punteados.

---

## 8. Animaciones

- **`.pulse-dot`**: punto curry que parpadea junto a la coda (1.6s, CSS).
- **Botones**: `translateY(-1px)` en hover, `0.2s`.
- **Marquee**: CSS keyframes `marquee-left` / `marquee-right`. Se pausa en hover sobre la fila.

```css
@media (prefers-reduced-motion: reduce) {
  .pulse-dot { animation: none; }
}
```

---

## 9. Copywriting

| Slot          | Copy actual                              |
| ------------- | ---------------------------------------- |
| Eyebrow       | El índice nacional del alfajor           |
| Headline      | EL ALFAJOR / NO SE DISCUTE.              |
| Coda          | Ahora se puntúa, ningún chamuyo          |
| CTA principal | Dejá tus reseñas →                       |

**Reglas:**
- Vos, no usted. Nunca tú.
- Frases cortas, declarativas. Una idea por línea.
- Humor en el contraste solemne, no en chistes.
- Modismos OK ("ningún chamuyo") pero sin abusar.

---

## 10. Handoff para herramientas de diseño (Claude Design, Figma, etc.)

> Usá esta sección textualmente cuando le pasés el diseño a otra herramienta. Describe el estado visual real, no el ideal.

### Fondo del hero

El fondo es un shader WebGL animado que simula líquido orgánico en movimiento. **No es un gradiente estático.** Para representarlo en diseño usá esto:

- Color base: `#3a1606` (marrón casi negro)
- Color medio: `#6e2f11` (marrón chocolate)
- Color de highlight: `#a85820` (marrón cobrizo cálido)
- Encima del shader hay un overlay negro semitransparente: `rgba(0, 0, 0, 0.45)` full-bleed
- Encima del overlay, en el borde superior: glow radial muy sutil dorado, `rgba(255, 180, 80, 0.08)`, ellipse centrada arriba, altura ~256px
- En el borde inferior: glow radial negro `rgba(0, 0, 0, 0.30)`, ellipse centrada abajo, altura ~288px

**Resultado visual:** fondo marrón muy oscuro, casi negro, con tonos cálidos que sugieren movimiento. El texto y elementos son legibles por el overlay negro. No hay bordes, no hay texturas geométricas, no hay gradientes de colores múltiples.

### Cards del carrusel de reseñas

El marquee tiene una fila de cards que desplazan de derecha a izquierda, ancho fijo 350px cada una.

**Anatomía de cada card:**
```
┌─────────────────────────────────────────┐
│                                         │  ← borde: 1px solid rgba(255,180,80,0.18)
│  "El texto de la reseña va acá,         │     fondo: rgba(0,0,0,0.55)
│   puede tener dos o tres líneas         │     border-radius: 16px (rounded-2xl)
│   de texto truncado."                   │     padding: 24px
│                                         │
│  ┌──┐  Nombre Usuario                   │
│  │👤│  @username                        │  ← avatar circular 40×40px, borde 1px rgba(255,180,80,0.18)
│  └──┘                                   │
└─────────────────────────────────────────┘
```

**Colores internos de la card:**
- Fondo: `rgba(0, 0, 0, 0.55)` — negro semitransparente, se ve el fondo del hero atrás
- Fondo en hover: `rgba(0, 0, 0, 0.70)`
- Borde: `1px solid rgba(255, 180, 80, 0.18)` — dorado muy tenue
- Texto del review: `rgba(255, 220, 160, 0.8)` — dorado claro, 80% opacidad, `font-size: 14px`
- Nombre: `rgba(255, 240, 200, 1)` — casi blanco cálido, `font-size: 14px`, `font-weight: 500`
- Username: mismo que texto del review pero más chico, `font-size: 12px`
- Avatar: círculo 40×40, borde igual al de la card

**Lo que NO tienen las cards:**
- No tienen sombra
- No tienen fondo blanco ni gris
- No tienen colores fríos
- No tienen rating de estrellas

### Tipografía en el hero (orden visual de arriba a abajo)

1. **Eyebrow** — `"El índice nacional del alfajor"` — `0.78rem`, `letter-spacing: 0.32em`, uppercase, color `#f4a02b`
2. **Headline** — `"EL ALFAJOR"` — Archivo Black, `clamp(64px, 14.5vw, 220px)`, `letter-spacing: -0.045em`, color blanco/crema
3. **Sub-headline** — `"NO SE DISCUTE."` — Archivo Black, `clamp(36px, 7.4vw, 112px)`, mismo tracking
4. **Coda** — `"Ahora se puntúa, ningún chamuyo"` — JetBrains Mono, `0.78rem`, `letter-spacing: 0.28em`, uppercase, color `#f4a02b`, con un punto animado a la izquierda
5. **Marquee de reseñas** — ver cards arriba
6. **CTA** — `"Dejá tus reseñas →"` — pill redondeada, fondo `#f4a02b`, texto `#5a2208`, `font-size: 14px`, uppercase, `letter-spacing: 0.06em`, sombra dorada `0 8px 24px -8px rgba(244,160,43,0.6)`

### Nav

Grid de 3 columnas, full width, padding `24px 40px`.
- **Izquierda:** links de texto — "Ranking", "Comparador", "Método" — `11px`, uppercase, tracking `0.16em`, color `#f6c977`
- **Centro:** logo SVG circular, `56×56px` — sello con texto "AG" grande en el centro, tipografía serif, borde doble circular, fondo crema `#f5ead6`, texto `#2b1810`
- **Derecha:** link "Iniciar sesión" (mismo estilo que nav links) + botón pill "Calificar" (fondo `#f4a02b`, texto `#5a2208`)

---

---

## 12. Pantallas de auth (`/register` y `/login`)

### Concepto
Layout split: hero tipográfico interactivo a la izquierda (52%) + formulario a la derecha (flex-1). En mobile el hero se oculta y el form ocupa el 100%.

### Hero (columna izquierda)
- Fondo oscuro `#1a0c05` con `box-shadow: 0 30px 80px -30px rgba(0,0,0,0.7)`.
- Tres instancias de `CursorDrivenParticleTypography` apiladas en `flex-col` absolute fill: **Probá. / Opiná. / Puntuá.**
  - Color de partículas: `#c87a20` (ámbar oscuro — visible sobre el fondo sin pelear con el formulario).
  - Font: `'Archivo Black', sans-serif`, `fontSize={400}` (cap interno: `containerWidth * 0.18`).
  - `particleSize={1.8}`, `particleDensity={4}`, `dispersionStrength={22}`, `returnSpeed={0.05}`.
  - El cursor dispersa las partículas al pasar sobre ellas.
- "made by Ignacio (Puly) G." — link a portfolio, posicionado `absolute bottom-6 left-8`, font mono `0.65rem`, color `rgba(246,201,119,0.6)`, glow sutil, hover ilumina.

### Formulario (columna derecha)
- Fondo `bg-bg-ink` (`#2c1209`) en el `<main>`.
- Texto: títulos, labels, inputs, botones en `#fdf6e8` (blanco cremita cálido). Sub-copy en `rgba(246,201,119,0.55)`.
- Campos: `InputGroup` — `48px` de alto, `border-radius: 12px`, fondo `#3b1a0a`, borde `rgba(244,160,43,0.18)`. Focus: border curry 60% + ring `3px rgba(244,160,43,0.12)`.
- Error: borde `#ff7a59` (excepción de paleta — señal de error cálida).
- Botón CTA: `.btn-curry-lg` con `!text-[#fdf6e8]`.
- `PasswordStrength`: barra de 4 niveles bajo el campo de contraseña.
- Animaciones de entrada: `.fade-in` (form completo), `.fade-up` con stagger (elementos del hero).

### Tokens nuevos en `globals.css`
| Token | Hex | Uso |
|---|---|---|
| `--color-bg-ink` | `#2c1209` | Fondo del `<main>` de auth |
| `--color-field-bg` | `#3b1a0a` | Fondo de los `<input>` |

---

## 11. Accesibilidad

- Contraste curry `#f4a02b` sobre marrón `#6e2f11` ≈ **5.6:1** — WCAG AA.
- Hit targets mínimo 44px.
- Iconos y links con `aria-label`.
- Un solo `<h1>` — el sub va en `<span>`, no `<h2>`.
- Animaciones respetan `prefers-reduced-motion`.
