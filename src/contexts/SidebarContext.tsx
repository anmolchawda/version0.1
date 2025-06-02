
// src/contexts/SidebarContext.tsx
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  authUserId: string | null;
  setContextAuthUserId: (uid: string | null) => void; // Added for explicit typing
  notificationCount: number; // Added for notification count
  setNotificationCount: (count: number) => void; // Added for notification count
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0); // Initialize notification count

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const setContextAuthUserId = useCallback((uid: string | null) => {
    setAuthUserId(uid);
  }, []);

  const updateNotificationCount = useCallback((count: number) => {
    setNotificationCount(count);
  }, []);


  return (
    <SidebarContext.Provider value={{ 
      isSidebarOpen, 
      toggleSidebar, 
      openSidebar, 
      closeSidebar, 
      authUserId, 
      setContextAuthUserId,
      notificationCount,
      setNotificationCount: updateNotificationCount
    }}>
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

