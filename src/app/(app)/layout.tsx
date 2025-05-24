import { AppHeader } from '@/components/layout/app-header';

export default function AppPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
         {children}
        </div>
      </main>
      {/* <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} FARMDOCC. All rights reserved.
      </footer> */}
    </div>
  );
}
