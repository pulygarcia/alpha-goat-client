import { RankingList } from '@/features/ranking/components/RankingList';
import { AppHeader } from '@/shared/components/layout/AppHeader';
import { Footer } from '@/shared/components/layout/Footer';

// Ranking global público: no requiere sesión.
export default function RankingPage() {
  return (
    <div className="bg-paper text-ink flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex-1">
        <RankingList />
      </div>
      <Footer />
    </div>
  );
}
