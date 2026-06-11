import type { Metadata } from 'next';
import { Suspense } from 'react';
import Hero from '@/features/auth/components/Hero';
import LoginForm from '@/features/auth/components/LoginForm';
import { GuestOnly } from '@/shared/components/auth/GuestOnly';

export const metadata: Metadata = {
  title: 'Iniciar sesión — Alfajorímetro',
};

export default function LoginPage() {
  return (
    <GuestOnly>
      <main className="bg-bg-ink flex min-h-screen gap-4 p-2 lg:h-screen lg:overflow-hidden lg:p-4">
        <Hero />
        <div className="flex flex-1 items-center justify-center px-6 py-12 lg:overflow-hidden">
          <div className="w-full max-w-[560px]">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>
    </GuestOnly>
  );
}
