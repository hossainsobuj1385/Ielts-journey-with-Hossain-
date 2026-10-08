import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  Users,
  UserCheck,
  BookOpen,
  FileText,
  MessageSquare,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalLessons: number;
  totalPdfs: number;
  totalComments: number;
  openSupport: number;
  pendingReports: number;
}

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await api.get<DashboardStats>('/api/admin/dashboard');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-12 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs">Loading analytics dashboard...</p>
      </div>
    );
  }

  const cards = [
    { label: 'Total Registered Students', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', tab: 'users' },
    { label: 'Active Students (7 Days)', value: stats.activeUsers, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', tab: 'users' },
    { label: 'Published Lessons', value: stats.totalLessons, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', tab: 'lessons' },
    { label: 'Google Drive PDFs', value: stats.totalPdfs, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', tab: 'pdfs' },
    { label: 'Student Comments', value: stats.totalComments, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50', tab: 'comments' },
    { label: 'Pending Support Tickets', value: stats.openSupport, icon: HelpCircle, color: 'text-orange-600', bg: 'bg-orange-50', tab: 'support', alert: stats.openSupport > 0 },
    { label: 'Flagged Content Reports', value: stats.pendingReports, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', tab: 'comments', alert: stats.pendingReports > 0 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk']">
          Platform Overview & Metrics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time summary of IELTS Journey with Hossain student activity, curriculum content, and support inquiries.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              onClick={() => onNavigate(c.tab)}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-amber-300 hover:shadow-xs cursor-pointer transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                {c.alert && (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                )}
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#0A192F]">{c.value}</span>
                <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">{c.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate('lessons')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-400 text-left transition flex items-center justify-between"
        >
          <div>
            <h4 className="font-bold text-xs text-[#0A192F]">Add New Lesson</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Create a grammar or writing class</p>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-600" />
        </button>

        <button
          onClick={() => onNavigate('pdfs')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-400 text-left transition flex items-center justify-between"
        >
          <div>
            <h4 className="font-bold text-xs text-[#0A192F]">Upload Drive PDF</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Add Cambridge test materials</p>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-600" />
        </button>

        <button
          onClick={() => onNavigate('notifications')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-400 text-left transition flex items-center justify-between"
        >
          <div>
            <h4 className="font-bold text-xs text-[#0A192F]">Broadcast Announcement</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Notify all enrolled students</p>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-600" />
        </button>
      </div>

      {/* Code & Full Database Backup Export Card (সব কোড ডাউনলোড) */}
      <div className="bg-gradient-to-r from-[#0A192F] to-[#1E293B] text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-400 mb-1">
            <span>📦 সম্পূর্ণ প্ল্যাটফর্ম ডাটা ও কোড ব্যাকআপ</span>
          </div>
          <h3 className="font-bold text-sm">Download All Code & Database Backup</h3>
          <p className="text-xs text-slate-300 mt-0.5 max-w-lg leading-relaxed">
            সম্পূর্ণ সিস্টেমের সমস্ত লেসন, ক্যাটাগরি, রোডম্যাপ ড্রিল, চ্যাট ডাটা ও সেটিংস এক ক্লিকে ডাউনলোড করে ব্যাকআপ রাখুন।
          </p>
        </div>
        <a
          href="/api/export-backup"
          download
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shrink-0 transition flex items-center justify-center space-x-2 shadow-sm text-center"
        >
          <span>সব কোড ও ডাটা ডাউনলোড করুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
