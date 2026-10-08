import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Category, Lesson, PdfItem, ProgressStats, RoadmapStep } from '../types';
import { api } from '../api/client';
import {
  Sparkles,
  BookOpen,
  FileText,
  PlayCircle,
  ArrowRight,
  TrendingUp,
  MessageCircleQuestion,
  Award,
  CheckCircle2,
  Clock,
  ChevronRight,
  Compass,
  Users,
  ShieldCheck,
  Check
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { user, setActiveView, openLesson } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredLessons, setFeaturedLessons] = useState<Lesson[]>([]);
  const [roadmaps, setRoadmaps] = useState<RoadmapStep[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Quick verification modal state for home page
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState(user?.email || '');
  const [verifyCode, setVerifyCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [catsData, lessonsData, pdfsData, roadmapsData, statsData, settingsData] = await Promise.all([
          api.get<Category[]>('/api/categories'),
          api.get<Lesson[]>('/api/lessons'),
          api.get<PdfItem[]>('/api/pdfs'),
          api.get<RoadmapStep[]>('/api/roadmaps').catch(() => []),
          api.get<ProgressStats>('/api/progress/my').catch(() => null),
          api.get<Record<string, string>>('/api/settings').catch(() => ({} as Record<string, string>))
        ]);

        // Order categories by display_order
        setCategories([...catsData].sort((a, b) => a.display_order - b.display_order));
        setFeaturedLessons(lessonsData.slice(0, 4));
        setRoadmaps(roadmapsData.slice(0, 4)); // First 4 steps for Home sequence
        setStats(statsData);
        if (settingsData && 'announcement_banner' in settingsData && settingsData.announcement_banner) {
          setAnnouncement(settingsData.announcement_banner);
        }
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, [user]);

  const handleSendVerifyCode = async () => {
    if (!verifyEmail || !verifyEmail.includes('@')) {
      alert('সঠিক ইমেইল এড্রেস লিখুন');
      return;
    }
    try {
      setVerifying(true);
      const res = await api.post<{ success: boolean; code: string; message: string }>('/api/users/send-verification', {
        email: verifyEmail
      });
      setGeneratedCode(res.code);
      setVerifyCode(res.code); // auto-fill free test code for effortless UX
      setVerifyMessage(`যাচাই কোড পাঠানো হয়েছে: ${res.code}`);
    } catch (err: any) {
      alert(err.message || 'কোড পাঠাতে সমস্যা হয়েছে');
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;
    try {
      setVerifying(true);
      await api.post('/api/users/verify-email', {
        email: verifyEmail,
        code: verifyCode.trim()
      });
      alert('অভিনন্দন! আপনার স্টুডেন্ট প্রোফাইল সফলভাবে ভেরিফাই হয়েছে।');
      setShowVerifyModal(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'ভেরিফিকেশন কোড ভুল হয়েছে');
    } finally {
      setVerifying(false);
    }
  };

  const continueLesson = featuredLessons.find(l => !l.is_completed) || featuredLessons[0];

  return (
    <div className="space-y-6 pb-20 pt-2 animate-fade-in">
      {/* Announcement Banner */}
      {announcement && (
        <div className="bg-amber-500/10 border border-amber-300/40 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-amber-900 shadow-2xs">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{announcement}</p>
        </div>
      )}

      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#0A192F] text-white p-5 md:p-6 shadow-xl border border-slate-700/60">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-400/30">
              <Award className="w-3.5 h-3.5" />
              <span>Target Band 7.5 - 8.5 Master</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-['Space_Grotesk'] tracking-tight flex items-center gap-2">
              <span>স্বাগতম, {user ? user.first_name : 'Learner'}! 👋</span>
              {user?.is_verified && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> ভেরিফাইড
                </span>
              )}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-md leading-relaxed">
              আইইএলটিএস প্রস্তুতি শুরু করুন ধারাবাহিক রোডম্যাপ ও ভিডিও লেসনের সাথে।
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10 min-w-[200px] flex items-center justify-around">
            <div className="text-center">
              <span className="text-xl font-bold text-amber-400">{stats?.completed_lessons || 0}</span>
              <p className="text-[11px] text-slate-300 font-medium">Completed</p>
            </div>
            <div className="w-[1px] h-8 bg-white/20" />
            <div className="text-center">
              <span className="text-xl font-bold text-emerald-400">{stats?.progress_percentage || 0}%</span>
              <p className="text-[11px] text-slate-300 font-medium">Progress</p>
            </div>
            <div className="w-[1px] h-8 bg-white/20" />
            <div className="text-center">
              <span className="text-xl font-bold text-amber-300">{stats?.bookmarks_count || 0}</span>
              <p className="text-[11px] text-slate-300 font-medium">Saved</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
            <span>Curriculum Mastery</span>
            <span className="text-amber-300 font-bold">{stats?.progress_percentage || 0}% Complete</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-2 rounded-full transition-all duration-700"
              style={{ width: `${stats?.progress_percentage || 5}%` }}
            />
          </div>
        </div>
      </div>

      {/* User Verification Prompt (if unverified) */}
      {user && !user.is_verified && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#0A192F]">স্টুডেন্ট একাউন্ট ভেরিফিকেশন (বিনামূল্যে)</h4>
              <p className="text-[11px] text-slate-600">
                ইমেইল কোড দিয়ে একাউন্ট যাচাই করুন এবং ভেরিফাইড শিক্ষার্থী ব্যাজ পেয়ে পার্টনারদের সাথে কানেক্ট হন।
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowVerifyModal(true)}
            className="px-3.5 py-2 bg-[#0A192F] hover:bg-[#1E293B] text-amber-300 font-bold rounded-xl text-xs shrink-0 transition shadow-2xs flex items-center justify-center space-x-1"
          >
            <span>যাচাই কোড নিন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SEQUENTIAL ROADMAP SECTION ON HOME PAGE (কোনটার পরে কোনটা শিখবেন) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-bold text-[#0A192F] flex items-center space-x-2">
              <Compass className="w-5 h-5 text-amber-600" />
              <span>ইংরেজি শেখার ধারাবাহিক রোডম্যাপ</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              কোনটার পরে কোনটা শিখবেন – শূন্য লেভেল থেকে ধারাবাহিক তালিকা
            </p>
          </div>
          <button
            onClick={() => setActiveView('roadmap')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-0.5"
          >
            <span>See more...</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Roadmap Steps Sequence (First few steps) */}
        <div className="space-y-2.5">
          {roadmaps.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => setActiveView('roadmap')}
              className="bg-white rounded-xl p-3.5 border border-slate-200/90 hover:border-amber-400 hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200">
                  ধাপ {idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {step.level_tag || `Level ${idx}`}
                    </span>
                    <span className="text-[10px] text-slate-400">ধারাবাহিক ধাপ</span>
                  </div>
                  <h3 className="font-bold text-xs text-[#0A192F] group-hover:text-amber-900 transition truncate mt-0.5">
                    {step.title_bn}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {step.description_bn}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center space-x-1 text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
                <span>অনুশীলন</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}

          {/* Explicit See More Button for Roadmap */}
          <button
            onClick={() => setActiveView('roadmap')}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-amber-50 text-slate-800 hover:text-amber-900 font-bold rounded-xl text-xs transition border border-slate-200/80 flex items-center justify-center space-x-1.5 shadow-2xs"
          >
            <Compass className="w-4 h-4 text-amber-600" />
            <span>See more... (বাকি সব ধারাবাহিক ধাপ ও সম্পূর্ণ রোডম্যাপ দেখুন)</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>

      {/* Feature Split Banner: Peer Study Partners */}
      <div
        onClick={() => setActiveView('peers')}
        className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-amber-300 hover:shadow-2xs transition cursor-pointer flex items-center justify-between group"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0A192F] text-amber-400 flex items-center justify-center shadow-2xs shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-[#0A192F] group-hover:text-amber-900 transition">
              স্টাডি পার্টনার ও মেন্টর ফলো সিস্টেম
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              যে ভালো পারে তাকে ফলো করে চ্যাট রিকুয়েষ্ট দিন এবং স্পিকিং পার্টনার হিসেবে প্র্যাকটিস করুন।
            </p>
          </div>
        </div>
        <div className="text-xs font-bold text-amber-700 flex items-center space-x-1 shrink-0 ml-2">
          <span>খুঁজুন</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* MODULES & CATEGORIES (ধাপে ধাপে ধারাবাহিকতা বজায় রাখা) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-base font-bold text-[#0A192F] flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Modules & Categories</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ধারাবাহিকতা অনুযায়ী একের পর এক মডিউল শিখুন (Step 1 থেকে শুরু করুন)
            </p>
          </div>
          <button
            onClick={() => setActiveView('lessons')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center"
          >
            <span>All Lessons</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {categories.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => setActiveView('lessons')}
              className="bg-white hover:bg-amber-50/40 p-3.5 rounded-xl border border-slate-200/90 hover:border-amber-300 text-left transition group shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    ধাপ {idx + 1}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {cat.lessons_count || 0} Lessons
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[#0A192F] group-hover:text-amber-900 transition truncate">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {cat.description || 'Core preparation module'}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-amber-700 font-bold">
                <span>মডিউল ওপেন করুন</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Lessons */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-[#0A192F] flex items-center space-x-1.5">
            <PlayCircle className="w-4 h-4 text-amber-600" />
            <span>Recommended Lessons</span>
          </h2>
          <button
            onClick={() => setActiveView('lessons')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center"
          >
            <span>Browse All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {featuredLessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => openLesson(lesson.id)}
              className="bg-white rounded-xl border border-slate-200/80 p-3.5 hover:border-slate-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {lesson.category_name}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {lesson.level}
                  </span>
                </div>
                <h3 className="font-bold text-xs text-[#0A192F] line-clamp-2 leading-snug">
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {lesson.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{lesson.views_count} views</span>
                </span>
                {lesson.is_completed ? (
                  <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold flex items-center space-x-0.5">
                    <span>Study Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PDF Study Materials Teaser */}
      <div className="bg-[#0A192F] rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-400 mb-1">
              <FileText className="w-4 h-4" />
              <span>Google Drive PDF Library</span>
            </div>
            <h3 className="text-base font-bold">Cambridge & IELTS Practice Books</h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-sm">
              Free access to Cambridge audio scripts, Writing Task 2 band 9 model answers, and speaking predictions.
            </p>
          </div>
          <button
            onClick={() => setActiveView('pdfs')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shrink-0 transition flex items-center justify-center space-x-1.5 shadow-xs"
          >
            <span>Open PDF Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Verification Modal for Home */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-[#0A192F]">বিনামূল্যে ইমেইল ভেরিফিকেশন কোড</h3>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              আপনার ইমেইল দিয়ে কোড সংগ্রহ করুন। যাচাইকৃত প্রোফাইল দিয়ে স্টাডি পার্টনার রিকুয়েষ্ট পাঠানো ও গ্রহণ করা সহজ হবে।
            </p>

            <form onSubmit={handleVerifySubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  আপনার ইমেইল এড্রেস
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={verifyEmail}
                    onChange={(e) => setVerifyEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendVerifyCode}
                    disabled={verifying}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    কোড পাঠান
                  </button>
                </div>
              </div>

              {generatedCode && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  <p className="font-semibold">আপনার ভেরিফিকেশন কোড: <span className="font-mono font-bold text-emerald-900 text-sm">{generatedCode}</span></p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">কোডটি নিচে টাইপ করে ভেরিফাই বাটনে চাপ দিন।</p>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  ৬-ডিজিটের ভেরিফিকেশন কোড
                </label>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="যেমন: 123456"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-mono tracking-widest text-center font-bold"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-3 py-2 text-xs text-slate-600 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={verifying || !verifyCode}
                  className="px-4 py-2 bg-[#0A192F] hover:bg-[#1E293B] text-amber-300 font-bold rounded-xl text-xs disabled:opacity-50"
                >
                  {verifying ? 'যাচাই হচ্ছে...' : 'ভেরিফাই সম্পন্ন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
