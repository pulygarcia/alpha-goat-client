import { AlfajorDetail } from '@/features/alfajores/components/AlfajorDetail';
import { CatalogHeader } from '@/features/alfajores/components/CatalogHeader';

// Detalle público de un alfajor. En Next 16 `params` es una Promise.
export default async function AlfajorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="bg-paper text-ink min-h-screen">
      <CatalogHeader />
      <AlfajorDetail id={id} />
    </div>
  );
}
