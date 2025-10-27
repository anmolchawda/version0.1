'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppLogo } from '@/components/core/app-logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the simple auth status from the central AuthContext
  const { authStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // THIS IS THE FIX:
    // We only need to check for the simple 'authenticated' state.
    // We don't care if they need to set up their profile or language here.
    // If they are authenticated in any way, they don't belong on the login page.
    if (authStatus === 'authenticated') {
      console.log(`AuthLayout: User is authenticated. Redirecting to home.`);
      router.replace('/'); // Redirect them to the main app homepage.
    }
  }, [authStatus, router]);

  // If the user is unauthenticated, they are allowed to see the login/signup page.
  if (authStatus === 'unauthenticated') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4">
        <div className="absolute top-8 left-8">
          <AppLogo />
        </div>
        
        <main className="flex flex-1 flex-col items-center justify-center w-full">
          {children}
        </main>
        
        <footer className="w-full text-center text-sm text-muted-foreground py-4">
          © {new Date().getFullYear()} KrishiX. Connect & Grow.
        </footer>
      </div>
    );
  }

  // If the auth status is 'loading' or the user is being redirected,
  // render nothing. The main AuthProvider shows a spinner.
  return null;
}
