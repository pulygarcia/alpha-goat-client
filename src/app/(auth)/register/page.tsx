import type { Metadata } from 'next';
import Hero from '@/features/auth/components/Hero';
import SignUpForm from '@/features/auth/components/SignUpForm';
import { GuestOnly } from '@/shared/components/auth/GuestOnly';

export const metadata: Metadata = {
  title: 'Sumate al Instituto — Alfajorímetro',
};

export default function SumatePage() {
  return (
    <GuestOnly>
      <main className="bg-bg-ink flex min-h-screen gap-4 p-2 lg:h-screen lg:overflow-hidden lg:p-4">
        <Hero />
        <div className="flex flex-1 items-center justify-center px-6 py-12 lg:overflow-hidden">
          <div className="w-full max-w-[560px]">
            <SignUpForm />
          </div>
        </div>
      </main>
    </GuestOnly>
  );
}
