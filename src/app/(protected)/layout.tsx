'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore'; // ✅ Use the store
import { Loader2 } from 'lucide-react'; // Optional: Use your icon

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  
  // ✅ Get state directly from the store
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    // Only redirect once loading is finished and we know they aren't logged in
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // 1. Show loading while the store is hydrating/checking token
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // 2. If finished loading and still not authenticated, don't render children (redirect happens above)
  if (!isAuthenticated) {
    return null;
  }

  
  return <>{children}</>;
}