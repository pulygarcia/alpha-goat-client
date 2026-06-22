import { AlfajoresCatalog } from '@/features/alfajores/components/AlfajoresCatalog';
import { AppHeader } from '@/shared/components/layout/AppHeader';
import { Footer } from '@/shared/components/layout/Footer';

// Catálogo público: no requiere sesión (a diferencia del feed).
export default function AlfajoresPage() {
  return (
    <div className="bg-paper text-ink flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex-1">
        <AlfajoresCatalog />
      </div>
      <Footer />
    </div>
  );
}
