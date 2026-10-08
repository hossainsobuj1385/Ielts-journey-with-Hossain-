import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, ShieldCheck, GraduationCap, Users, Share2 } from 'lucide-react';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenUserSwitch: () => void;
  onOpenShare: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications, onOpenUserSwitch, onOpenShare }) => {
  const { user, isAdmin, activeView, setActiveView, unreadCount } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0A192F] text-white shadow-md border-b border-[#1E293B]">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center space-x-3 text-left focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D97706] to-[#F59E0B] flex items-center justify-center shadow-lg shadow-[#D97706]/20">
            <GraduationCap className="w-6 h-6 text-[#0A192F]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base md:text-lg tracking-tight font-['Space_Grotesk'] text-white">
                IELTS Journey
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 uppercase">
                Band 7+
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium -mt-0.5">with Hossain</p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Admin Toggle Button */}
          {isAdmin && (
            <button
              onClick={() => setActiveView(activeView === 'admin' ? 'home' : 'admin')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'admin'
                  ? 'bg-[#F59E0B] text-[#0A192F] shadow-sm'
                  : 'bg-[#1E293B] text-[#F59E0B] hover:bg-[#334155] border border-[#F59E0B]/30'
              }`}
              title="Admin Panel"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">
                {activeView === 'admin' ? 'Student View' : 'Admin Panel'}
              </span>
            </button>
          )}

          {/* User Switch / Demo Simulator Button */}
          <button
            onClick={onOpenUserSwitch}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-300 text-xs transition border border-slate-700/60"
            title="Switch Simulated Telegram User"
          >
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="max-w-[70px] truncate hidden xs:inline">
              {user ? user.first_name : 'User'}
            </span>
          </button>

          {/* Share App Button */}
          <button
            onClick={onOpenShare}
            className="p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-amber-400 hover:text-amber-300 transition"
            title="Share Telegram App & Download Backup"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-300 transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
