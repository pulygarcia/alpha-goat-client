import { AlfajorDetail } from '@/features/alfajores/components/AlfajorDetail';
import { AppHeader } from '@/shared/components/layout/AppHeader';
import { Footer } from '@/shared/components/layout/Footer';

// Detalle público de un alfajor. En Next 16 `params` es una Promise.
export default async function AlfajorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="bg-paper text-ink flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex-1">
        <AlfajorDetail id={id} />
      </div>
      <Footer />
    </div>
  );
}
