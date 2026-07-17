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
        backgroundColor: '#efe0b6',
        backgroundImage: [
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.29 0 0 0 0 0.12 0 0 0 0 0.03 0 0 0 0.4 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          'radial-gradient(ellipse 55% 40% at 12% 8%, rgba(184,96,21,0.12) 0%, transparent 60%)',
          'radial-gradient(ellipse 45% 55% at 88% 15%, rgba(246,201,119,0.18) 0%, transparent 65%)',
          'radial-gradient(ellipse 60% 45% at 20% 85%, rgba(74,30,8,0.06) 0%, transparent 60%)',
          'radial-gradient(ellipse 50% 60% at 95% 90%, rgba(184,96,21,0.10) 0%, transparent 65%)',
          'radial-gradient(ellipse 70% 50% at 55% 45%, rgba(217,181,105,0.14) 0%, transparent 70%)',
        ].join(', '),
        backgroundSize: '180px 180px, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%',
        backgroundRepeat: 'repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat',
      }}
    >
      <div className="flex h-screen flex-col">
        <AppHeader />
        <main className="mx-auto w-full max-w-[980px] flex-1 overflow-y-auto px-5 py-8 md:px-8 md:py-10">
          <AlbumView username={username} />
        </main>
      </div>
      <Footer />
    </div>
  );
}
