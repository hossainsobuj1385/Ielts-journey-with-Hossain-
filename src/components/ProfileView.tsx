import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lesson, ProgressStats, SupportRequest } from '../types';
import { api } from '../api/client';
import {
  User,
  Award,
  Bookmark,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Phone,
  Share2,
  Edit3,
  Check,
  X,
  Lock,
  Mail
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, isAdmin, setActiveView, openLesson, refreshUser } = useAuth();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [bookmarks, setBookmarks] = useState<Lesson[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [facebook, setFacebook] = useState(user?.facebook || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [targetBand, setTargetBand] = useState(user?.target_band || 'Band 7.5+');
  const [savingProfile, setSavingProfile] = useState(false);

  // Verification state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState(user?.email || '');
  const [verifyCode, setVerifyCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyStatusMessage, setVerifyStatusMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const [statsData, bookmarksData, supportData] = await Promise.all([
          api.get<ProgressStats>('/api/progress/my').catch(() => null),
          api.get<Lesson[]>('/api/bookmarks/my').catch(() => []),
          api.get<SupportRequest[]>('/api/support').catch(() => [])
        ]);
        setStats(statsData);
        setBookmarks(bookmarksData);
        setSupportRequests(supportData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (user) {
      setWhatsapp(user.whatsapp || '');
      setFacebook(user.facebook || '');
      setBio(user.bio || '');
      setTargetBand(user.target_band || 'Band 7.5+');
      setVerifyEmail(user.email || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await api.put('/api/users/profile', {
        whatsapp: whatsapp.trim() || null,
        facebook: facebook.trim() || null,
        bio: bio.trim() || null,
        target_band: targetBand.trim()
      });
      alert('প্রোফাইল তথ্য সফলভাবে সেভ হয়েছে!');
      setIsEditingProfile(false);
      if (refreshUser) refreshUser();
    } catch (err: any) {
      alert(err.message || 'প্রোফাইল সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSendVerifyCode = async () => {
    if (!verifyEmail || !verifyEmail.includes('@')) {
      alert('সঠিক ইমেইল লিখুন');
      return;
    }
    try {
      setVerifying(true);
      const res = await api.post<{ success: boolean; code: string; message: string }>('/api/users/send-verification', {
        email: verifyEmail
      });
      setGeneratedCode(res.code);
      setVerifyCode(res.code); // auto-fill for free easy verification UX
      setVerifyStatusMessage(`যাচাই কোড পাঠানো হয়েছে: ${res.code}`);
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
      alert('অভিনন্দন! আপনার স্টুডেন্ট একাউন্ট সফলভাবে যাচাইকৃত (Verified) হয়েছে।');
      setShowVerifyModal(false);
      if (refreshUser) refreshUser();
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'ভেরিফিকেশন ব্যর্থ হয়েছে');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 pt-2 animate-fade-in">
      {/* User Header Profile Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={user?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.first_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <h2 className="text-lg font-bold text-[#0A192F] truncate">
                  {user ? `${user.first_name} ${user.last_name || ''}` : 'IELTS Student'}
                </h2>
                {isAdmin && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-300">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </span>
                )}
                {user?.is_verified ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 flex items-center gap-1 border border-emerald-300">
                    <Check className="w-3 h-3 text-emerald-600" /> Verified Student
                  </span>
                ) : (
                  <button
                    onClick={() => setShowVerifyModal(true)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 hover:bg-amber-100 flex items-center gap-1 border border-amber-200 transition"
                  >
                    <Mail className="w-3 h-3 text-amber-600" /> ভেরিফাই করুন (Verify)
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {user?.username ? `@${user.username}` : `Telegram ID: ${user?.telegram_id}`}
              </p>
              <div className="inline-flex items-center space-x-1 mt-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Award className="w-3 h-3 text-amber-600" />
                <span>Target: {user?.target_band || targetBand}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="p-2 text-slate-500 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition border border-slate-200"
            title="Edit Socials & Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Bio */}
        {user?.bio && (
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
            "{user.bio}"
          </p>
        )}

        {/* Social Accounts Display (WhatsApp & Facebook) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          {user?.whatsapp ? (
            <a
              href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp: {user.whatsapp}</span>
            </a>
          ) : (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center space-x-1 text-[11px] text-slate-500 hover:text-emerald-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-dashed border-slate-300"
            >
              <Phone className="w-3 h-3 text-slate-400" />
              <span>+ WhatsApp ID যোগ করুন</span>
            </button>
          )}

          {user?.facebook ? (
            <a
              href={user.facebook.startsWith('http') ? user.facebook : `https://facebook.com/${user.facebook}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold border border-blue-200 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>Facebook প্রোফাইল</span>
            </a>
          ) : (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center space-x-1 text-[11px] text-slate-500 hover:text-blue-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-dashed border-slate-300"
            >
              <Share2 className="w-3 h-3 text-slate-400" />
              <span>+ Facebook লিংক যোগ করুন</span>
            </button>
          )}
        </div>

        {/* Inline Profile Edit Form */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#0A192F]">কন্টাক্ট ও সোশ্যাল তথ্য আপডেট করুন</h3>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                WhatsApp User ID / মোবাইল নম্বর
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="যেমন: +8801700000000"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Facebook প্রোফাইল লিংক
              </label>
              <input
                type="text"
                value={facebook}
                onChange={e => setFacebook(e.target.value)}
                placeholder="যেমন: https://facebook.com/yourname"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                স্টাডি বায়ো / লক্ষ্য
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={2}
                placeholder="আপনার আইইএলটিএস লক্ষ্য ও অনুশীলনের বিষয় লিখুন..."
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1.5 text-xs text-slate-500"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-1.5 bg-[#0A192F] hover:bg-[#1E293B] text-amber-300 font-bold rounded-xl text-xs"
              >
                {savingProfile ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
              </button>
            </div>
          </form>
        )}

        {/* Progress Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50">
            <span className="text-lg font-bold text-[#0A192F]">{stats?.completed_lessons || 0}</span>
            <p className="text-[10px] text-slate-500 font-medium">Completed</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50">
            <span className="text-lg font-bold text-amber-800">{stats?.progress_percentage || 0}%</span>
            <p className="text-[10px] text-amber-800 font-medium">Mastery</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50">
            <span className="text-lg font-bold text-slate-700">{bookmarks.length}</span>
            <p className="text-[10px] text-slate-500 font-medium">Bookmarks</p>
          </div>
        </div>
      </div>

      {/* Admin Panel Quick Link */}
      {isAdmin && (
        <div className="p-4 bg-gradient-to-r from-[#0A192F] to-[#1E293B] text-white rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Instructor Admin Panel</h3>
              <p className="text-[11px] text-slate-300">Manage lessons, Google Drive PDFs, users, and moderation.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('admin')}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shrink-0 transition"
          >
            Open Admin
          </button>
        </div>
      )}

      {/* Saved Bookmarks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0A192F] flex items-center space-x-1.5">
            <Bookmark className="w-4 h-4 text-amber-600" />
            <span>Saved Bookmarks ({bookmarks.length})</span>
          </h3>
          {bookmarks.length > 0 && (
            <button
              onClick={() => setActiveView('lessons')}
              className="text-xs text-amber-700 font-semibold"
            >
              Browse more
            </button>
          )}
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-slate-200/80 space-y-1.5">
            <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">No bookmarked lessons</p>
            <p className="text-[11px] text-slate-400">Save tricky lessons while browsing to review them before exam day.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarks.map((b) => (
              <div
                key={b.id}
                onClick={() => openLesson(b.id)}
                className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 cursor-pointer flex items-center justify-between transition"
              >
                <div>
                  <div className="flex items-center space-x-1.5 text-[10px] text-amber-800 mb-0.5">
                    <span className="font-bold">{b.category_name}</span>
                    <span>• {b.level}</span>
                  </div>
                  <h4 className="font-bold text-xs text-[#0A192F] line-clamp-1">{b.title}</h4>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Support Requests */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0A192F] flex items-center space-x-1.5">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span>My Support Inquiries ({supportRequests.length})</span>
          </h3>
          <button
            onClick={() => setActiveView('support')}
            className="text-xs text-amber-700 font-semibold"
          >
            Open Desk
          </button>
        </div>

        {supportRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-5 text-center border border-slate-200/80">
            <p className="text-xs text-slate-500">No support tickets submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {supportRequests.slice(0, 3).map((r) => (
              <div
                key={r.id}
                onClick={() => setActiveView('support')}
                className="bg-white p-3 rounded-xl border border-slate-200 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 mr-2">
                    {r.status}
                  </span>
                  <span className="text-xs font-semibold text-[#0A192F]">{r.subject}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Modal in Profile */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-[#0A192F]">বিনামূল্যে স্টুডেন্ট ইমেইল ভেরিফিকেশন</h3>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ইমেইল কোড দিয়ে একাউন্ট ভেরিফাই করুন। যাচাইকৃত শিক্ষার্থী হিসেবে প্ল্যাটফর্মে স্টাডি পার্টনার ও মেন্টরদের সাথে সরাসরি সংযোগ পাবেন।
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
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    কোড পাঠান
                  </button>
                </div>
              </div>

              {generatedCode && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  <p className="font-semibold">ভেরিফিকেশন কোড: <span className="font-mono font-bold text-emerald-900 text-sm">{generatedCode}</span></p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">কোডটি নিচে টাইপ করে ভেরিফাই করুন।</p>
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
