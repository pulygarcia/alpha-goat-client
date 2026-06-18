# Feedback de acciones (toasts) — Design

Fecha: 2026-06-18
Sprint: "Feedback de acciones"
Stack: Next.js 16 + Tailwind v4 + TanStack Query + shadcn (Sonner)

## Objetivo

Que toda acción/envío de formulario dé feedback de éxito/error vía un toaster
compartido, cerrando un agujero de UX transversal (hoy publicar/editar reseña,
login, etc. cargan y cierran sin avisar).

## Decisiones cerradas

- Toaster: **Sonner** (shadcn). No está instalado todavía.
- Errores de formulario → **inline + toast**: el detalle de validación/campo
  sigue inline (RHF/Zod); además se dispara un toast de error genérico desde el
  `onError` de la mutation.
- **Follow/unfollow → solo error** (acción frecuente, no spamear success).
- Disparo desde los `onSuccess`/`onError` de las mutations, no desde los
  componentes (salvo lo inline de form, que ya vive en el componente).

## Arquitectura

### 1. Primitivo + provider
- Instalar `sonner` y agregar `src/shared/components/ui/sonner.tsx` (wrapper
  shadcn) con tokens cream ("El Diario") para matchear el theme.
- Montar `<Toaster />` una sola vez en `src/app/layout.tsx`, dentro del `<body>`
  y del `QueryProvider`.

### 2. Helper compartido — `src/shared/lib/toast.ts`
Encapsula Sonner para que las features no importen `sonner` directo y los tests
mockeen un solo módulo. Expone al menos:
- `notifySuccess(message: string)`
- `notifyError(message: string)`
con duración/posición por defecto. Internamente delega en `toast` de sonner.

### 3. Cableado de mutations
Disparar desde `onSuccess`/`onError`:

| Hook              | success                                   | error |
| ----------------- | ----------------------------------------- | ----- |
| `useSubmitReview` | "Reseña publicada" / "Reseña actualizada" (según `mode`) | "No pudimos publicar la reseña" |
| `useToggleFollow` | — (silencioso)                            | "No pudimos actualizar el seguimiento" (tras rollback del optimista) |
| `useLogin`        | — (silencioso, ya redirige a `/feed`)     | "No pudimos iniciar sesión" |
| `useRegister`     | "Cuenta creada"                           | "No pudimos crear la cuenta" |
| `useLogout`       | — (silencioso)                            | "No pudimos cerrar sesión" |

Nota: donde ya hay manejo de 409/errores específicos (auth), el toast es el
fallback genérico; los mensajes finos pueden quedar inline donde ya existan.

### 4. Errores de formulario (inline + toast)
- Validación de campo: **inline** vía RHF/Zod (sin cambios).
- Fallo de la mutation: además **toast de error** en el `onError`.
- Racional: inline dice *qué* campo; toast garantiza visibilidad aunque el campo
  esté fuera del viewport (caso wizard/modal).

## Testing (TDD)
- Mockear `src/shared/lib/toast` y verificar que cada `onSuccess`/`onError`
  llama `notifySuccess`/`notifyError` con el mensaje correcto.
- No se testea el render visual de Sonner.
- Mantener suite verde y coverage (los nuevos módulos entran al coverage).

## Fuera de alcance (YAGNI)
- Toast de *like* (no existe hook de like todavía).
- Toasts de acciones admin/moderation.
- Animaciones/estilos custom más allá de los tokens cream.
- Cola/dedupe de toasts.
