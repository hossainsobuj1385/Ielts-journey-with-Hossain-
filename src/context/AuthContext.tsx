import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, NotificationItem } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  unreadCount: number;
  activeView: 'home' | 'lessons' | 'roadmap' | 'peers' | 'pdfs' | 'community' | 'support' | 'profile' | 'admin';
  selectedLessonId: number | null;
  selectedCategoryId: number | null;
  setActiveView: (view: 'home' | 'lessons' | 'roadmap' | 'peers' | 'pdfs' | 'community' | 'support' | 'profile' | 'admin') => void;
  setSelectedCategoryId: (id: number | null) => void;
  openLesson: (id: number) => void;
  closeLesson: () => void;
  refreshUser: () => Promise<void>;
  switchUser: (mockUser: { id: number; first_name: string; last_name?: string; username?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeView, setActiveView] = useState<'home' | 'lessons' | 'roadmap' | 'peers' | 'pdfs' | 'community' | 'support' | 'profile' | 'admin'>('home');
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const fetchProfileAndNotifications = useCallback(async () => {
    try {
      const data = await api.get<{ user: User; isAdmin: boolean }>('/api/auth/me');
      setUser(data.user);
      setIsAdmin(data.isAdmin);

      const notifs = await api.get<NotificationItem[]>('/api/notifications');
      const unread = notifs.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('[Auth] Error fetching user profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Notify Telegram WebApp that app is ready
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        try {
          tg.ready();
          tg.expand();
          if (tg.initDataUnsafe?.user) {
            const u = tg.initDataUnsafe.user;
            api.setActiveUser({
              id: u.id,
              first_name: u.first_name,
              last_name: u.last_name,
              username: u.username
            });
          }
        } catch (e) {
          console.warn('[Telegram WebApp] Init call failed', e);
        }
      }
    }

    fetchProfileAndNotifications();
  }, [fetchProfileAndNotifications]);

  const switchUser = async (mockUser: { id: number; first_name: string; last_name?: string; username?: string }) => {
    setIsLoading(true);
    api.setActiveUser(mockUser);
    await fetchProfileAndNotifications();
    setIsLoading(false);
  };

  const openLesson = (id: number) => {
    setSelectedLessonId(id);
  };

  const closeLesson = () => {
    setSelectedLessonId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        unreadCount,
        activeView,
        selectedLessonId,
        selectedCategoryId,
        setActiveView,
        setSelectedCategoryId,
        openLesson,
        closeLesson,
        refreshUser: fetchProfileAndNotifications,
        switchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
