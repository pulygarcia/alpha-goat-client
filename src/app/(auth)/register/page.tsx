import type { Metadata } from 'next'
import Hero from '@/features/auth/components/Hero'
import SignUpForm from '@/features/auth/components/SignUpForm'

export const metadata: Metadata = {
  title: 'Sumate al Instituto — Alfajorímetro',
}

export default function SumatePage() {
  return (
    <main className="flex min-h-screen gap-4 bg-bg-ink p-2 lg:h-screen lg:overflow-hidden lg:p-4">
      <Hero />
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:overflow-hidden">
        <div className="w-full max-w-[560px]">
          <SignUpForm />
        </div>
      </div>
    </main>
  )
}
