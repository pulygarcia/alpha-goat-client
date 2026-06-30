import { ReviewFab } from '@/features/feed/components/ReviewFab';

/**
 * Layout de las páginas "app" (feed, alfajores, ranking, perfiles). Monta el
 * `ReviewFab` flotante una sola vez para que aparezca en todas por defecto
 * —incluidas las nuevas— en lugar de sumarlo sección por sección.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ReviewFab />
    </>
  );
}
