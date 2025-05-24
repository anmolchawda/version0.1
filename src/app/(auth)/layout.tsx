import { AppLogo } from '@/components/core/app-logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4">
      <div className="absolute top-8 left-8">
        <AppLogo />
      </div>
      {children}
       <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} FieldVerse. Connect & Grow.
      </footer>
    </div>
  );
}
