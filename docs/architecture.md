# Frontend Architecture - AlphaGoat

Este documento describe la arquitectura del frontend en detalle. Léelo completo antes de crear o modificar features.

## Filosofía: feature-based architecture

Agrupamos código **por funcionalidad de negocio**, no por tipo de archivo. Cada feature vive en su carpeta y contiene **todo lo que necesita**: componentes, hooks, llamadas API, tipos, schemas de validación, store local.

**Ventajas:**
- Cuando trabajás en una feature, todo está en un mismo lugar.
- Si algún día sacás una feature, borrás la carpeta y listo.
- Escala bien cuando hay muchas features (no se ensucia un `components/` gigante).
- Claude Code entiende mejor el contexto si le decís "trabajá en `features/reviews/`".
- Es lo que se usa en empresas medianas/grandes hoy.

**Regla de oro:**
- Si algo se usa en **2 o más features** → va a `src/shared/`.
- Si lo usa solo una feature → vive dentro de esa feature.

## Estructura completa

```
src/
├── app/                                  # App Router (rutas)
│   ├── layout.tsx                        # layout raíz (providers, fonts)
│   ├── page.tsx                          # home
│   ├── globals.css                       # Tailwind + variables
│   ├── (auth)/                           # route group sin URL
│   │   ├── login/page.tsx                # /login
│   │   └── register/page.tsx             # /register
│   ├── alfajores/
│   │   ├── page.tsx                      # /alfajores
│   │   └── [id]/page.tsx                 # /alfajores/:id
│   ├── ranking/page.tsx
│   ├── comparador/page.tsx
│   ├── perfil/
│   │   ├── page.tsx                      # mi perfil
│   │   └── [username]/page.tsx           # perfil público
│   └── admin/
│       ├── layout.tsx                    # protege con role admin
│       └── moderacion/page.tsx
│
├── features/                             # ⭐ carne del proyecto
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LoginForm.test.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── RegisterForm.test.tsx
│   │   ├── hooks/
│   │   │   ├── useLogin.ts
│   │   │   ├── useLogin.test.ts
│   │   │   ├── useRegister.ts
│   │   │   └── useCurrentUser.ts
│   │   ├── api/
│   │   │   └── auth.api.ts
│   │   ├── store/
│   │   │   └── auth.store.ts             # Zustand
│   │   ├── schemas/
│   │   │   ├── login.schema.ts           # Zod
│   │   │   └── register.schema.ts
│   │   └── types/
│   │       └── auth.types.ts
│   │
│   ├── alfajores/
│   │   ├── components/
│   │   │   ├── AlfajorCard.tsx
│   │   │   ├── AlfajorList.tsx
│   │   │   ├── AlfajorDetail.tsx
│   │   │   ├── AlfajorFilters.tsx
│   │   │   ├── AlfajorRadarChart.tsx
│   │   │   └── ProposeAlfajorForm.tsx
│   │   ├── hooks/
│   │   │   ├── useAlfajores.ts
│   │   │   ├── useAlfajorById.ts
│   │   │   └── useProposeAlfajor.ts
│   │   ├── api/
│   │   ├── schemas/
│   │   └── types/
│   │
│   ├── reviews/
│   │   ├── components/
│   │   │   ├── ReviewForm.tsx
│   │   │   ├── ReviewCard.tsx
│   │   │   ├── ReviewList.tsx
│   │   │   └── EjesSlider.tsx            # los 5 ejes en sliders
│   │   ├── hooks/
│   │   ├── api/
│   │   └── ...
│   │
│   ├── ranking/
│   ├── comparador/
│   └── moderation/                       # admin
│
├── shared/
│   ├── components/
│   │   ├── ui/                           # shadcn/ui (Button, Input, Dialog, etc)
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Container.tsx
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── useMediaQuery.ts
│   ├── lib/
│   │   ├── api-client.ts                 # axios instance + interceptors
│   │   ├── utils.ts                      # cn(), formatters
│   │   └── cloudinary.ts                 # helpers de imagen
│   ├── providers/
│   │   ├── QueryProvider.tsx             # TanStack Query
│   │   └── AuthProvider.tsx
│   └── types/
│       └── api.types.ts                  # Pagination, ApiError, etc
│
└── config/
    ├── env.ts                            # validación de env vars con Zod
    └── query-client.ts                   # config global de QueryClient
```

## Anatomía de una feature

Una feature **completa** suele tener:

| Carpeta       | Qué va ahí                                                     |
|---------------|----------------------------------------------------------------|
| `components/` | Componentes específicos de la feature + sus tests.             |
| `hooks/`      | Custom hooks (incluyen los de TanStack Query).                 |
| `api/`        | Funciones que llaman al backend (axios calls).                 |
| `store/`      | Zustand store si la feature tiene client state global.         |
| `schemas/`    | Schemas de Zod para validación de forms.                       |
| `types/`      | Tipos TypeScript propios de la feature.                        |
| `utils/`      | Helpers internos (formatters, transformers).                   |

No todas las features necesitan todas las carpetas. Solo creá las que uses.

## Ejemplo completo: feature `auth`

### `features/auth/api/auth.api.ts`

```typescript
import { apiClient } from '@/shared/lib/api-client';
import { LoginInput, RegisterInput, AuthResponse } from '../types/auth.types';

export const authApi = {
  login: async (input: LoginInput): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', input);
    return data;
  },

  register: async (input: RegisterInput): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', input);
    return data;
  },

  me: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
};
```

### `features/auth/schemas/login.schema.ts`

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export type LoginSchema = z.infer<typeof loginSchema>;
```

### `features/auth/hooks/useLogin.ts`

```typescript
'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user);
      router.push('/alfajores');
    },
  });
}
```

### `features/auth/components/LoginForm.tsx`

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useLogin } from '../hooks/useLogin';
import { loginSchema, LoginSchema } from '../schemas/login.schema';

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });
  const login = useLogin();

  const onSubmit = (data: LoginSchema) => login.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input {...register('email')} placeholder="Email" />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <Input type="password" {...register('password')} placeholder="Contraseña" />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>
      <Button type="submit" disabled={login.isPending} className="w-full">
        {login.isPending ? 'Entrando...' : 'Entrar'}
      </Button>
      {login.isError && (
        <p className="text-sm text-red-500">Email o contraseña incorrectos</p>
      )}
    </form>
  );
}
```

### `features/auth/components/LoginForm.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from './LoginForm';
import { authApi } from '../api/auth.api';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../api/auth.api', () => ({
  authApi: { login: vi.fn() },
}));

function renderWithProviders(ui: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('LoginForm', () => {
  it('shows validation errors when fields are empty', async () => {
    renderWithProviders(<LoginForm />);
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/email inválido/i)).toBeInTheDocument();
  });

  it('calls authApi.login with valid data', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ user: { id: '1' }, token: 'x' } as any);
    renderWithProviders(<LoginForm />);

    await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText(/contraseña/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
  });
});
```

### `features/auth/store/auth.store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = { id: string; username: string; email: string; role: 'USER' | 'ADMIN' };

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'auth-storage' },
  ),
);
```

### `app/(auth)/login/page.tsx`

```typescript
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="container max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Iniciar sesión</h1>
      <LoginForm />
    </main>
  );
}
```

Como ven, la página queda mínima: importa de `features/` y arma el layout.

## Server vs Client Components

**Server Components (default):**
- Listados que solo leen datos.
- Páginas estáticas.
- Layouts.
- Detalle de alfajor cuando solo muestra info.

**Client Components (`'use client'`):**
- Cualquier componente con hooks (useState, useEffect, useQuery).
- Formularios.
- Componentes con eventos (onClick que cambia estado).
- Componentes que usan Zustand o TanStack Query.

**Regla**: ponés `'use client'` solo en el componente que lo necesita, no en el padre. Eso permite que el resto siga renderizando en el server.

## Fetching de datos: dos modos

### A) Server Component (preferido para reads simples)

```typescript
// app/alfajores/page.tsx
import { alfajoresApi } from '@/features/alfajores/api/alfajores.api';
import { AlfajorList } from '@/features/alfajores/components/AlfajorList';

export default async function AlfajoresPage() {
  const alfajores = await alfajoresApi.search({ status: 'APPROVED' });
  return <AlfajorList alfajores={alfajores} />;
}
```

### B) Client Component con TanStack Query (cuando hay interactividad)

```typescript
// features/alfajores/hooks/useAlfajores.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { alfajoresApi } from '../api/alfajores.api';

export function useAlfajores(filters: SearchFilters) {
  return useQuery({
    queryKey: ['alfajores', filters],
    queryFn: () => alfajoresApi.search(filters),
  });
}
```

Usás A) cuando la pantalla solo lee datos y no necesita refetch interactivo. B) cuando hay filtros, búsqueda en vivo, infinite scroll, etc.

## Auth flow

1. Usuario manda credenciales con `LoginForm`.
2. `useLogin` llama a `authApi.login`.
3. Backend devuelve `{ user, token }`. El token va a un cookie HTTP-only **set por el backend** (vía `Set-Cookie`).
4. `useAuthStore` guarda el user (no el token, eso vive en cookie).
5. El interceptor de Axios manda el cookie automáticamente con `withCredentials: true`.
6. Para rutas protegidas, usamos un **middleware de Next** (`middleware.ts`) que valida la cookie y redirige a `/login` si no existe.
7. Para rutas admin, además validamos `user.role === 'ADMIN'` desde el AuthProvider.

### Hidratación en SSR (evitar el flash invitado → autenticado)

El estado de auth se resuelve **en el servidor** en el primer render, no solo en el cliente:

- El `RootLayout` es un Server Component `async` que llama `getCurrentUser()` (`features/auth/api/getCurrentUser.server.ts`, marcado `server-only`).
- En el navegador la cookie HTTP-only viaja sola, pero en el servidor no hay "cookie jar": `getCurrentUser()` lee la cookie de la request con `cookies()` de `next/headers` y la reenvía a `GET /auth/me` con `fetch` (`cache: 'no-store'`). Por eso vive aparte del `api-client` axios (que es client-side).
- El `User | null` resultante baja como `initialUser` al `AuthProvider` y se siembra en la query `['auth','me']` como `initialData`. Así el HTML del servidor y el primer render del cliente ya conocen la sesión: sin parpadeo ni `/me` redundante en el cliente.
- Trade-off: leer cookies en el root layout opta a todas las rutas a **render dinámico** (correcto para una app con sesión por-request).

```typescript
// shared/lib/api-client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // logout local + redirect
    }
    return Promise.reject(err);
  },
);
```

## Variables de entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

Variables que usás solo en server components (sin `NEXT_PUBLIC_`):
```env
# (de momento ninguna, todo se hace via cookies del backend)
```

## Testing - estrategia para llegar al 85%

1. **Cada componente con lógica** tiene su `.test.tsx` al lado.
2. **Cada hook custom** tiene su `.test.ts` al lado.
3. **Mockear las llamadas a `api/`**, no testear la red.
4. **Testear comportamiento, no implementación**: "muestra error si email es inválido", no "el state cambia a X".
5. **No testear shadcn/ui** ni componentes presentacionales puros.
6. **Configuración de coverage en `vitest.config.ts`**:

```typescript
test: {
  environment: 'jsdom',
  coverage: {
    provider: 'v8',
    thresholds: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    exclude: [
      '**/*.config.*',
      '**/types/**',
      '**/schemas/**',
      'src/app/**',                    // las páginas se testean con E2E (futuro)
      'src/shared/components/ui/**',   // shadcn/ui
      '**/*.d.ts',
    ],
  },
},
```

## Diseño - vibes para la UI

(Detalle completo en `docs/design-guidelines.md` cuando lo creemos.)

- **Paleta**: marrones cálidos (#5C3A21, #8B5E3C), dorado (#D4A24E), crema (#FAF3E7), tonos chocolate y dulce de leche. Nada de azul corporate.
- **Tipografía**: serif con personalidad para titulares (Fraunces, Playfair, Recoleta), sans neutra para el resto (Inter, Geist).
- **Microinteracciones**: hover en cards de alfajor con lift sutil, animación al enviar review (algo de confeti o un alfajor que "cae"), loading states con humor.
- **Tono de copy**: argentino canchero pero no forzado. "Todavía no probaste ningún alfajor, ¿qué hacés acá?", "Calificá sin piedad".

## Roadmap (fases)

### Fase 1 - MVP
1. Setup (Next.js + Tailwind + shadcn + TanStack Query + Zustand + Vitest).
2. Feature `auth` (login, register, useCurrentUser).
3. Feature `alfajores` (listado + detalle, sin proponer todavía).
4. Feature `reviews` (form + listado en detalle de alfajor).
5. Layout principal (Header, Footer, navegación).

### Fase 2 - Modelo híbrido
6. Form de proponer alfajor.
7. Feature `moderation` (panel admin).
8. Estados visuales para PENDING/APPROVED/REJECTED.

### Fase 3 - Lo que la hace especial
9. Feature `ranking` (top alfajores con filtros).
10. Feature `comparador` (radar charts superpuestos).
11. Perfil de usuario con "paladar promedio".
12. Sistema de recomendaciones.

### Fase 4 - Polish
13. Animaciones, microinteracciones.
14. Modo oscuro.
15. PWA / responsive completo.

## Reglas que Claude Code debe seguir

1. **Antes de crear una feature**, leer este archivo y `progress.md`.
2. **Cada feature en su carpeta** con la estructura definida arriba.
3. **Server Components por default**, Client Components solo donde haga falta.
4. **Componentes con lógica → tienen test**. Sin excepciones.
5. **Nunca llamar a la API directamente desde un componente**: siempre via hook (`useX`) que usa la función de `api/`.
6. **Imports con alias `@/`**, nunca rutas relativas largas.
7. **Después de terminar una feature**, actualizar `progress.md`.
8. Si dudás sobre qué es feature vs shared, **preguntá**.
