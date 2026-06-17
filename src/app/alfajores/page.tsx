import { AlfajoresCatalog } from '@/features/alfajores/components/AlfajoresCatalog';
import { CatalogHeader } from '@/features/alfajores/components/CatalogHeader';

// Catálogo público: no requiere sesión (a diferencia del feed).
export default function AlfajoresPage() {
  return (
    <div className="bg-paper text-ink min-h-screen">
      <CatalogHeader />
      <AlfajoresCatalog />
    </div>
  );
}
