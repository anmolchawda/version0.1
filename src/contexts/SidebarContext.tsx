// src/contexts/SidebarContext.tsx
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
// Import `useAuth` to get the REAL user.
import { useAuth } from './AuthContext'; 

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  authUserId: string | null; // This will now hold the REAL user ID
  notificationCount: number;
  setNotificationCount: (count: number) => void;
  unreadMessageCount: number;
  setUnreadMessageCount: (count: number) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Get the REAL user directly from `useAuth`. This is the single source of truth.
  const { user } = useAuth();
  
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // This new effect simply listens for changes from AuthProvider and updates the ID.
  // It contains NO mock logic and performs NO redirects.
  useEffect(() => {
    if (user) {
      // A real user is logged in.
      console.log(`[SidebarContext] Real user detected from AuthContext: ${user.uid}`);
      setAuthUserId(user.uid);
    } else {
      // The user is logged out.
      console.log(`[SidebarContext] No user detected from AuthContext.`);
      setAuthUserId(null);
    }
    // This effect runs only when the user object from AuthProvider changes.
  }, [user]); 

  // The rest of your functions are good.
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);
  
  const updateNotificationCount = useCallback((count: number) => {
    setNotificationCount(count);
  }, []);

  const updateUnreadMessageCount = useCallback((count: number) => {
    setUnreadMessageCount(count);
  }, []);

  return (
    <SidebarContext.Provider value={{ 
      isSidebarOpen, 
      toggleSidebar, 
      openSidebar, 
      closeSidebar, 
      authUserId, // Provide the real (or null) user ID
      notificationCount,
      setNotificationCount: updateNotificationCount,
      unreadMessageCount,
      setUnreadMessageCount: updateUnreadMessageCount
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
