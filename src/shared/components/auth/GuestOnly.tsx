'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/shared/providers/AuthProvider';

interface GuestOnlyProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function GuestOnly({ children, redirectTo = '/' }: GuestOnlyProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, router]);

  if (isAuthenticated) return null;
  return <>{children}</>;
}
