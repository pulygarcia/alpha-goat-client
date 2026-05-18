'use client';

import { RequireAuth } from '@/shared/components/auth/RequireAuth';
import { useAuth } from '@/shared/providers/AuthProvider';
import { useLogout } from '@/features/auth/hooks/useLogout';

function FeedContent() {
  const { user } = useAuth();
  const logout = useLogout();

  if (!user) return null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-2">
        <span className="eyebrow text-curry-soft">Tu feed</span>
        <h1 className="h-sub text-curry-bright">Hola, {user.username}</h1>
        <p className="text-curry-soft">
          Acá vas a ver las últimas reseñas de la comunidad y tus alfajores
          guardados. Por ahora está vacío — se viene.
        </p>
      </header>

      <section className="rounded-2xl border border-curry-soft/20 bg-bg-deep p-6">
        <h2 className="eyebrow mb-4 text-curry-soft">Tu cuenta</h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-curry-soft">Usuario</dt>
            <dd className="text-curry-bright">{user.username}</dd>
          </div>
          <div>
            <dt className="text-curry-soft">Email</dt>
            <dd className="text-curry-bright">{user.email}</dd>
          </div>
          <div>
            <dt className="text-curry-soft">Rol</dt>
            <dd className="text-curry-bright">{user.role}</dd>
          </div>
          <div>
            <dt className="text-curry-soft">Miembro desde</dt>
            <dd className="text-curry-bright">
              {new Date(user.createdAt).toLocaleDateString('es-AR')}
            </dd>
          </div>
        </dl>
      </section>

      <button
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="btn-curry self-start"
      >
        {logout.isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </button>
    </main>
  );
}

export default function FeedPage() {
  return (
    <RequireAuth>
      <FeedContent />
    </RequireAuth>
  );
}
