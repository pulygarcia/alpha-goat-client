import { StatsPage } from '@/features/stats/components/StatsPage';
import { AppHeader } from '@/shared/components/layout/AppHeader';
import { Footer } from '@/shared/components/layout/Footer';

export default function Stats() {
  return (
    <div className="bg-blanco-tibio text-ink flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex-1">
        <StatsPage />
      </div>
      <Footer />
    </div>
  );
}
