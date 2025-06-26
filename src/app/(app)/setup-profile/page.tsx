
// src/app/(app)/setup-profile/page.tsx
import { SetupProfileForm } from '@/components/profile/setup-profile-form';
import { AppLogo } from '@/components/core/app-logo';

export default function SetupProfilePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 sm:p-8">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <AppLogo iconClassName="h-10 w-10 sm:h-12 sm:w-12" textClassName="text-2xl sm:text-3xl"/>
      </div>
      <SetupProfileForm />
       <footer className="w-full text-center text-xs sm:text-sm text-muted-foreground py-4 mt-8">
        © {new Date().getFullYear()} KrishiX. Complete your profile to connect & grow.
      </footer>
    </div>
  );
}
