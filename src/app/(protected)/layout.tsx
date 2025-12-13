'use client'; // Must be client-side to check localStorage

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/auth';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 1. Check if user is logged in
    if (!authService.isAuthenticated()) {
      // 2. Redirect if not
      router.push('/login');
    } else {
      // 3. Allow access
      setIsAuthenticated(true);
    }
  }, [router]);

  // While checking, show a loading spinner or nothing
  // This prevents the "flash" of protected content
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p> 
      </div>
    );
  }

  // Once authenticated, render the page requested (Dashboard, Profile, etc.)
  return <>{children}</>;
}