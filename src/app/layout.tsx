import type { Metadata } from 'next';
import { Archivo_Black, Inter, JetBrains_Mono } from 'next/font/google';
import { QueryProvider } from '@/shared/providers/QueryProvider';
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${archivo.variable} ${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-curry">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
