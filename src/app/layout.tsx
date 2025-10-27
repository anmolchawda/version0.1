// src/app/layout.tsx OR your root layout file

'use client';

import { type ReactNode } from 'react';import { SidebarProvider } from '@/contexts/SidebarContext';
import { NativeAuthHandler } from '@/components/auth/native-auth-handler';
import { AuthProvider } from '@/contexts/AuthContext'; // Your new provider

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
