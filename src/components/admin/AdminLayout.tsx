import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminLessons } from './AdminLessons';
import { AdminRoadmaps } from './AdminRoadmaps';
import { AdminPdfs } from './AdminPdfs';
import { AdminCategories } from './AdminCategories';
import { AdminComments } from './AdminComments';
import { AdminSupport } from './AdminSupport';
import { AdminChatRequests } from './AdminChatRequests';
import { AdminUsers } from './AdminUsers';
import { AdminNotifications } from './AdminNotifications';
import { AdminSettings } from './AdminSettings';
import {
  LayoutDashboard,
  Users,
  Compass,
  BookOpen,
  FolderTree,
  FileText,
  MessageSquare,
  HelpCircle,
  Bell,
  Settings,
  ArrowLeft,
  ShieldCheck,
  Menu,
  X,
  Download
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { setActiveView } = useAuth();
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roadmaps', label: 'Roadmap & Drills', icon: Compass },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'pdfs', label: 'PDF Library', icon: FileText },
    { id: 'chat_requests', label: 'Peer Mentorships', icon: Users },
    { id: 'comments', label: 'Comments & Reports', icon: MessageSquare },
    { id: 'support', label: 'Support Desk', icon: HelpCircle },
    { id: 'users', label: 'Users Directory', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (adminTab) {
      case 'dashboard':
        return <AdminDashboard onNavigate={(t) => setAdminTab(t)} />;
      case 'roadmaps':
        return <AdminRoadmaps />;
      case 'lessons':
        return <AdminLessons />;
      case 'pdfs':
        return <AdminPdfs />;
      case 'categories':
        return <AdminCategories />;
      case 'chat_requests':
        return <AdminChatRequests />;
      case 'comments':
        return <AdminComments />;
      case 'support':
        return <AdminSupport />;
      case 'users':
        return <AdminUsers />;
      case 'notifications':
        return <AdminNotifications />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard onNavigate={(t) => setAdminTab(t)} />;
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await fetch('/api/export-backup');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ielts_journey_full_backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-12">
      {/* Mobile Top Bar for Admin */}
      <div className="md:hidden bg-[#0A192F] text-white p-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-sm">Hossain Admin Panel</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveView('home')}
            className="text-xs px-2.5 py-1 rounded bg-slate-800 text-amber-400 font-medium"
          >
            Student App
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 rounded text-slate-300"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-full md:h-screen w-64 bg-[#0A192F] text-slate-300 flex flex-col justify-between p-4 border-r border-slate-800 transition-transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white font-['Space_Grotesk']">Instructor Admin</h3>
                <p className="text-[10px] text-amber-400">Chief Control Center</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setAdminTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-amber-500 text-[#0A192F] shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0A192F]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Download Backup & Return Button */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={handleDownloadBackup}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-2xs"
            title="Download JSON Database & Content Backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data Backup</span>
          </button>

          <button
            onClick={() => setActiveView('home')}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Student App</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {renderContent()}
      </main>
    </div>
  );
};
