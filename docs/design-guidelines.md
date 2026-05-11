# Alfajorímetro · Hero v4 — Next.js

> Reseñas científicas del alfajor argentino. Hero section de la landing.
> Stack: Next.js 14+ (App Router) · TypeScript · Tailwind CSS v4

---

## 1. Concepto

**"El alfajor no se discute. Ahora se puntúa."**

El hero plantea al alfajor como producto-héroe único, centrado y monumental — la página entera es una vidriera. Tono canchero, argentino, con humor sutil; estética cálida y saturada inspirada en marcas de salsas/condimentos premium (referencia: Hungry Tiger), no en panaderías de los 90.

La promesa de la app (radar de 5 ejes + ranking) se sugiere con un solo dato visible — la pill de puntaje "8.4 / Top 3 nacional" sobre el producto — en vez de explicar todo en el hero. El detalle se desarrolla más abajo en la landing.

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
        ├── LogoMonogram.tsx    # Server Component — círculo central de la nav
        ├── AlfajorHero.tsx     # Server Component — placeholder CSS, reemplazable por <Image />
        ├── ScorePill.tsx       # Server Component — pill rotada 8deg
        └── BotanicalBg.tsx     # Server Component — SVG inline de fondo

public/
└── alfajor/                # Acá van las fotos reales cuando estén
```

> Ninguna pieza del hero necesita `"use client"`. Toda la interacción (hover, drift, pulse) se resuelve con CSS. Si más adelante agregás cycling del Top 3 o un modal de "Calificar", esos sí van marcados como client.

### Fuentes (`app/layout.tsx`)

```ts
import { Archivo_Black, Inter, JetBrains_Mono } from "next/font/google";

const archivo = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono  = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
```

Después en `<body className={`${archivo.variable} ${inter.variable} ${mono.variable}`}>` y las utilities de Tailwind las leen como `font-archivo`, `font-inter`, `font-mono`.

---

## 3. Sistema de color

Paleta monocromática warm: un solo marrón profundo + un solo dorado curry. Sin azules, grises ni acentos de color. Toda la jerarquía se resuelve con **opacidad y peso tipográfico**, no con color.

Se definen en `globals.css` como tokens de Tailwind v4:

```css
@import "tailwindcss";

@theme {
  --color-bg:           #6e2f11;
  --color-bg-deep:      #4f1f08;
  --color-curry:        #f4a02b;
  --color-curry-bright: #ffb53d;
  --color-curry-soft:   #f6c977;
  --color-cinnamon:     #b86015;
  --color-sienna:       #5a2208;

  --font-archivo: var(--font-archivo);
  --font-inter:   var(--font-inter);
  --font-mono:    var(--font-mono);
}
```

Esto los expone como `bg-bg`, `text-curry`, `bg-curry-bright`, etc.

| Token             | Hex        | Uso                                                  |
| ----------------- | ---------- | ---------------------------------------------------- |
| `--color-bg`            | `#6e2f11`  | Fondo principal (marrón chocolate cálido saturado)   |
| `--color-bg-deep`       | `#4f1f08`  | Fondo del logo monograma, áreas más profundas        |
| `--color-curry`         | `#f4a02b`  | Color principal de texto, botones, todo el contenido |
| `--color-curry-bright`  | `#ffb53d`  | Hover de botones, acentos puntuales                  |
| `--color-curry-soft`    | `#f6c977`  | Subtítulos, copy secundario, texto al 70%            |
| `--color-cinnamon`      | `#b86015`  | Sombras del DDL del alfajor placeholder              |
| `--color-sienna`        | `#5a2208`  | Texto sobre fondos curry (botones)                   |

**Regla:** dorado curry sobre marrón profundo. Si necesitás contraste, no inventes un color: usá un curry más opaco (`curry-soft`) o el marrón mismo (`sienna`) sobre un bloque curry.

---

## 4. Tipografía

| Familia              | Variable CSS       | Uso                                                           |
| -------------------- | ------------------ | ------------------------------------------------------------- |
| **Archivo Black**    | `--font-archivo`   | Headline mega ("EL ALFAJOR / NO SE DISCUTE."), logo monograma |
| **Inter**            | `--font-inter`     | Body copy, subtítulos                                         |
| **JetBrains Mono**   | `--font-mono`      | Eyebrow, tags, datos pequeños, etiquetas                      |

### Escala del headline (en `globals.css`)

```css
@layer components {
  .h-mega {
    font-family: var(--font-archivo);
    font-size: clamp(64px, 14.5vw, 220px);
    line-height: 0.88;
    letter-spacing: -0.045em;
  }
  .h-sub {
    font-family: var(--font-archivo);
    font-size: clamp(36px, 7.4vw, 112px);
    line-height: 0.92;
    letter-spacing: -0.035em;
  }
}
```

- Tracking **muy apretado** (-0.04em) — las letras casi se tocan.
- Todo en mayúsculas para el display.

### Escala secundaria

- Eyebrow: `0.78rem`, tracking `0.32em`, mayúsculas, Archivo Black
- Coda mono: `0.78rem`, tracking `0.28em`, mayúsculas, JetBrains Mono
- Body: `0.85rem`, tracking `0.14em`, uppercase, leading relajado
- Nav links: `11px`, tracking `0.16em`, uppercase, weight 700

---

## 5. Layout

Single column, full bleed, centrado vertical-arriba. **No hay grid de 12 columnas**: el contenido respira en una columna y la jerarquía la dan los tamaños.

```
┌─────────────────────────────────────────────────────┐
│  [Ranking · Comparador · Método]  [LOGO]   [Login · CALIFICAR]  │  ← <Nav />
├─────────────────────────────────────────────────────┤
│              EL ÍNDICE NACIONAL DEL ALFAJOR          │  ← eyebrow
│                                                      │
│              EL ALFAJOR                              │  ← .h-mega
│              NO SE DISCUTE.                          │  ← .h-sub
│                                                      │
│           · Ahora se puntúa · 5 ejes ·               │  ← coda
│                                                      │
│                  ╭─ ─ ─ ─ ─ ─ ╮                      │
│                 ( ALFAJOR HERO )    [ScorePill]      │  ← <AlfajorHero />
│                  ╰─ ─ ─ ─ ─ ─ ╯                      │
│                                                      │
│  Reseñá cualquier...                  [⌕] [📊]      │  ← bottom row
│  [EMPEZAR A CALIFICAR →]                             │
└─────────────────────────────────────────────────────┘
```

### Breakpoints (Tailwind defaults)

- **Mobile** (`< sm`, ≤640px): nav colapsa a Ranking + logo + Calificar. Bottom row se apila. Alfajor pasa a `clamp(340px, 56vw, ...)`.
- **Tablet** (`sm:`, ≥640px): aparecen Comparador, Login, "Reseñado 1.247 veces" sobre el alfajor.
- **Desktop** (`lg:`, ≥1024px): se muestra Top 100 y Método en la nav. Alfajor llega a 720px máx.

---

## 6. Componentes

### `<Nav />` (grid de 3 columnas)
- Izquierda: links de texto (`next/link`), separados con `gap-8`. Sin underline, sin caja.
- Centro: `<LogoMonogram />` — círculo 56×56 con borde curry y texto "ALFA / JORÍ / METRO" apilado en 3 líneas (Archivo Black, 0.55rem).
- Derecha: link "Iniciar sesión" + botón pill **"Calificar"** curry.

### Botones (clases en `globals.css`)

```css
@layer components {
  .btn-curry {
    @apply inline-flex items-center rounded-full bg-curry px-[26px] py-3
           text-[13px] uppercase tracking-[0.04em] text-sienna font-bold
           transition-colors duration-200 hover:bg-curry-bright;
  }
  .btn-curry-lg {
    @apply inline-flex items-center rounded-full bg-curry px-9 py-4
           text-sm uppercase tracking-[0.06em] text-sienna font-bold
           shadow-[0_8px_24px_-8px_rgba(244,160,43,0.6)]
           transition-all duration-200 hover:bg-curry-bright hover:-translate-y-px;
  }
  .icon-btn {
    @apply inline-flex h-11 w-11 items-center justify-center rounded-full
           bg-curry text-sienna transition-colors hover:bg-curry-bright;
  }
}
```

- `.btn-curry` (small): pill, 13px uppercase. CTAs secundarios.
- `.btn-curry-lg`: pill grande, sombra dorada drop. CTA principal del hero.
- `.icon-btn`: 44×44 circular. Search + ranking abajo a la derecha. Cumple hit-target mínimo (44px).

### `<AlfajorHero />` (placeholder)

CSS-only. Dos discos chocolate (radial gradient) con franja DDL en el medio. Sombras internas profundas + glow dorado externo (`0 0 200px rgba(244, 160, 43, 0.18)`).

**Cuando llegue la foto real**, reemplazar el contenido del componente por:

```tsx
import Image from "next/image";

<Image
  src="/alfajor/jorgito-hero.png"
  alt="Alfajor Jorgito Triple visto desde arriba"
  width={720}
  height={720}
  className="aspect-square rounded-full drift"
  priority
/>
```

`priority` porque es LCP del hero. Subí la imagen optimizada (WebP/AVIF Next se encarga si usás un loader compatible).

### `<ScorePill />`
Etiqueta rotada `8deg` flotando arriba a la derecha del alfajor. Muestra "Top 3 nacional · 8.4/10". Es el único elemento que insinúa la mecánica de la app en el hero.

---

## 7. Texturas y atmósfera

- **`<BotanicalBg />`**: SVG inline al 10% de opacidad, hojas/brotes/cuadrados estilizados. Replica la tracería del ref sin caer en flowers literales. Tile de 420×420. Va como `<div>` con `position: absolute; inset: 0; pointer-events: none;` dentro del `<section>` del hero.
- **Glow radial inferior**: vignette oscuro abajo (`rgba(0,0,0,0.30)`) para que el alfajor "pise" el suelo.
- **Glow superior**: leve highlight dorado arriba (`rgba(255,180,80,0.08)`) para iluminar el headline.

Nada de gradientes payasos, glassmorphism, ni borders punteados. La textura es atmosférica, no decorativa.

---

## 8. Animaciones

Solo CSS, todas opcionales (la página funciona estática):

- **`.drift`**: el alfajor flota 8px arriba y abajo en loop de 7s.
- **`.pulse-dot`**: el dot de "Ahora se puntúa" parpadea suave (1.6s).
- **Botones**: `translateY(-1px)` en hover, transición de color `0.25s`.

Definidas en `globals.css` con `@keyframes` y envueltas en:

```css
@media (prefers-reduced-motion: reduce) {
  .drift, .pulse-dot { animation: none; }
}
```

---

## 9. Copywriting (tono argentino, humor sutil)

| Slot          | Copy                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| Eyebrow       | EL ÍNDICE NACIONAL DEL ALFAJOR                                            |
| Headline      | EL ALFAJOR / NO SE DISCUTE.                                               |
| Coda          | Ahora se puntúa · 5 ejes · ningún chamuyo                                 |
| Score         | Top 3 nacional · 8.4/10                                                   |
| Bullet        | Reseñado 1.247 veces                                                      |
| Body          | Reseñá cualquier alfajor en 5 ejes — dulzor, DDL, baño, ratio y textura.  |
|               | Te devolvemos un radar y un puesto en el ranking.                         |
| CTA principal | EMPEZAR A CALIFICAR →                                                     |

**Reglas de copy:**
- Vos, no usted. Nunca tú.
- Modismos OK ("ningún chamuyo") pero sin abusar.
- Frases cortas, declarativas. Una sola idea por línea.
- Humor en el contraste solemne ("EL ÍNDICE NACIONAL" para algo trivial), no en chistes.

---

## 10. Accesibilidad y SEO

- Contraste curry `#f4a02b` sobre marrón `#6e2f11` ≈ **5.6:1** — pasa WCAG AA para texto normal y AAA para texto grande.
- Hit targets mínimo 44px.
- Iconos con `aria-label` en `<button>` o `<Link>`.
- Headline es un único `<h1>` (el sub va en `<span>` o `<p>`, no `<h2>` falso).
- Animaciones decorativas; respetan `prefers-reduced-motion`.
- `metadata` en `app/layout.tsx`:
  ```ts
  export const metadata: Metadata = {
    title: "Alfajorímetro — El índice nacional del alfajor",
    description: "Reseñá cualquier alfajor argentino en 5 ejes. Radar y ranking nacional.",
    openGraph: { /* foto del alfajor hero */ },
  };
  ```

---

## 11. Próximos pasos sugeridos

1. **Reemplazar `<AlfajorHero />` placeholder** por `<Image />` con foto cenital real, fondo transparente, mismo treatment de glow.
2. **Sección radar**: agregar un Server Component debajo del hero con la card de Jorgito Triple del v3 (radar SVG completo, datos de un JSON en `/data` o de una API route).
3. **Marquee de marcas**: tira animada (CSS keyframe puro, server component) con Jorgito, Havanna, Cachafaz, Guaymallén, Fantoche, Balcarce, Block, Suchard.
4. **Alternancia de producto**: cyclar el alfajor central entre los Top 3. Acá sí necesitás `"use client"` + `useState` + `setInterval` (o `useEffect` con `IntersectionObserver` si querés que se dispare on-scroll).
5. **Modo "polémica"**: tomar un alfajor controversial (Guaymallén) y mostrar las dos puntuaciones extremas con sus reseñas.

---

## 12. Comandos

```bash
pnpm create next-app@latest alfajorimetro --typescript --tailwind --app
cd alfajorimetro
pnpm dev          # http://localhost:3000
pnpm build && pnpm start
```
