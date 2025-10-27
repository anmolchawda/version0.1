'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Import your central auth hook
import { AppLogo } from '@/components/core/app-logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the auth status from the central AuthContext we created
  const { authStatus } = useAuth();
  const router = useRouter();

  // This useEffect hook handles the redirect logic
  useEffect(() => {
    // If the auth state is definitively 'authenticated',
    // the user should not be on this page.
    if (authStatus === 'authenticated_ready' || authStatus === 'authenticated_needs_profile' || authStatus === 'authenticated_needs_language') {
      console.log(`AuthLayout: User is already authenticated (status: ${authStatus}). Redirecting to home.`);
      router.replace('/'); // Redirect them to the main app homepage.
    }
  }, [authStatus, router]);

  // If the user is unauthenticated, they are allowed to see the login/signup page.
  // We also check for 'loading' to prevent a flash of the login page
  // while the initial auth check is happening.
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
  // render nothing. The main AuthProvider already shows a full-page spinner,
  // so this prevents any content from flashing on the screen.
  return null;
}
