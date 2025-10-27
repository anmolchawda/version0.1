import { AppLogo } from '@/components/core/app-logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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