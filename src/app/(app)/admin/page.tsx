import { AdminGuard } from '@/features/moderation/components/AdminGuard';
import { ModerationQueue } from '@/features/moderation/components/ModerationQueue';
import { AppHeader } from '@/shared/components/layout/AppHeader';
import { Footer } from '@/shared/components/layout/Footer';

/** Panel de moderación (solo ADMIN; el guard muestra 404 al resto). */
export default function AdminPage() {
  return (
    <div className="bg-blanco-tibio text-ink flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex-1">
        <AdminGuard>
          <ModerationQueue />
        </AdminGuard>
      </div>
      <Footer />
    </div>
  );
}
