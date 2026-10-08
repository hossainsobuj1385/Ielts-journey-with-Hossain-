import React, { useEffect, useState } from 'react';
import { NotificationItem } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { X, Bell, CheckCheck, BookOpen, FileText, MessageSquare, Info } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { setActiveView, openLesson, refreshUser } = useAuth();

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await api.get<NotificationItem[]>('/api/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleActionClick = (notif: NotificationItem) => {
    markAsRead(notif.id);
    onClose();
    if (!notif.link_url) return;

    if (notif.link_url.startsWith('/lessons/')) {
      const id = parseInt(notif.link_url.replace('/lessons/', ''), 10);
      if (!isNaN(id)) {
        setActiveView('lessons');
        openLesson(id);
      }
    } else if (notif.link_url === '/lessons') {
      setActiveView('lessons');
    } else if (notif.link_url === '/pdfs') {
      setActiveView('pdfs');
    } else if (notif.link_url.startsWith('/support')) {
      setActiveView('support');
    }
  };

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'New Lesson':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'New PDF':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'Support Reply':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-[#0A192F]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-[#0A192F] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="font-bold text-base">Notifications</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllRead}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center space-x-1 px-2 py-1 rounded bg-slate-800"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-600">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-1">Updates on lessons and answers will appear here.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleActionClick(n)}
                className={`py-3 px-2 rounded-xl transition cursor-pointer flex items-start space-x-3 hover:bg-slate-50 ${
                  !n.is_read ? 'bg-amber-50/40 font-medium' : ''
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-100 mt-0.5 shrink-0">
                  {getTypeIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[#0A192F] truncate">{n.title}</h4>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-slate-400">
                      {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {n.link_url && (
                      <span className="text-[11px] text-amber-700 font-semibold hover:underline">
                        View details →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
