
// src/contexts/SidebarContext.tsx
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  authUserId: string | null; // Added to store authenticated user's ID
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null); // State for authUserId

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Function to be called by AppLayoutContent to update authUserId
  const setContextAuthUserId = useCallback((uid: string | null) => {
    setAuthUserId(uid);
  }, []);


  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, openSidebar, closeSidebar, authUserId, setContextAuthUserId } as any}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
}
