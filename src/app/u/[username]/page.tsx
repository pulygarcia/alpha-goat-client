import { ProfileView } from '@/features/profile/components/ProfileView';
import { AppHeader } from '@/shared/components/layout/AppHeader';
import { Footer } from '@/shared/components/layout/Footer';

// Perfil público por username. En Next 16 `params` es una Promise.
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <div className="bg-paper text-ink flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex-1">
        <ProfileView username={username} />
      </div>
      <Footer />
    </div>
  );
}
