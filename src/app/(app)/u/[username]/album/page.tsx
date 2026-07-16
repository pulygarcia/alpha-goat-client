import { AlbumView } from '@/features/album/components/AlbumView';
import { AppHeader } from '@/shared/components/layout/AppHeader';
import { Footer } from '@/shared/components/layout/Footer';

// Álbum público por username. En Next 16 `params` es una Promise.
export default async function AlbumPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <div
      className="text-ink flex min-h-screen flex-col"
      style={{
        backgroundColor: '#f7efdb',
        backgroundImage:
          'radial-gradient(rgba(74,30,8,0.09) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }}
    >
      <AppHeader />
      <main className="mx-auto w-full max-w-[980px] flex-1 px-5 py-8 md:px-8 md:py-10">
        <AlbumView username={username} />
      </main>
      <Footer />
    </div>
  );
}
