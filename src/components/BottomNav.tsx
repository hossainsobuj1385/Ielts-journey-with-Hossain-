import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, Compass, BookOpen, Users, FileText, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeView, setActiveView } = useAuth();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'roadmap', label: 'Roadmap', icon: Compass },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'peers', label: 'Peers', icon: Users },
    { id: 'pdfs', label: 'PDFs', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto px-1.5 flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
                isActive ? 'text-[#0A192F]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[#0A192F]/5 text-[#0A192F]' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5] text-[#D97706]' : 'stroke-2'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight font-medium ${
                  isActive ? 'font-bold text-[#0A192F]' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#D97706]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

