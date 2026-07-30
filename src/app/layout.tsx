import type { Metadata } from 'next';
import { Archivo_Black, Inter, JetBrains_Mono } from 'next/font/google';
import { QueryProvider } from '@/shared/providers/QueryProvider';
import { AuthProvider } from '@/shared/providers/AuthProvider';
import { getCurrentUser } from '@/features/auth/api/getCurrentUser.server';
import { Toaster } from '@/shared/components/ui/sonner';
import './globals.css';

const archivo = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-archivo',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Alfajorímetro — El índice nacional del alfajor',
  description:
    'Reseñá cualquier alfajor argentino en 5 ejes. Radar y ranking nacional.',
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initialUser = await getCurrentUser();

  return (
    <html
      lang="es"
      className={`${archivo.variable} ${inter.variable} ${mono.variable} antialiased`}
    >
      {/*
        `dvh` y no `h-full`: en mobile el `100%` de `html` resuelve contra el
        viewport grande (el que tiene la barra del navegador retraída), así que
        el documento medía siempre más que el área visible y *toda* la app
        quedaba scrolleable por la altura de la toolbar, hero incluido. `dvh`
        sigue al viewport real, y como nada desborda tampoco cambia de valor.
      */}
      <body className="bg-blanco-tibio text-ink flex min-h-[100dvh] flex-col">
        <QueryProvider>
          <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
