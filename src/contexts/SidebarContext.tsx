
// src/contexts/SidebarContext.tsx
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { MOCK_USER_ID } from '@/lib/placeholders'; // Import MOCK_USER_ID

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  authUserId: string | null;
  setContextAuthUserId: (uid: string | null) => void;
  notificationCount: number;
  setNotificationCount: (count: number) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  // Simulate a logged-in user in mock mode
  useEffect(() => {
    // Check if we are in a mock environment (e.g., based on an env variable or a global const)
    // For now, let's assume if src/lib/firebase.ts is in mock mode, this should also behave as mock.
    // A more robust way would be a shared constant or env variable.
    // For this exercise, we'll directly use MOCK_USER_ID if no Firebase auth happens.
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !authUserId) { // Fallback if auth flow is bypassed
      setAuthUserId(MOCK_USER_ID);
      console.log("[SidebarContext] Mock mode: Setting authUserId to MOCK_USER_ID:", MOCK_USER_ID);
    }
  }, [authUserId]); // Re-evaluate if authUserId changes externally (though less likely in full mock)


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
