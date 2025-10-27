// src/app/layout.tsx OR your root layout file

'use client';

import { type ReactNode } from 'react';import { SidebarProvider } from '@/contexts/SidebarContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { NativeAuthHandler } from '@/components/auth/native-auth-handler';

// This is the entire file. It is clean and has no logic.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SidebarProvider>
            <NativeAuthHandler />
            {children}
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
