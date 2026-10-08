import React, { useState } from 'react';
import { api } from '../../api/client';
import { Bell, Send, CheckCircle2 } from 'lucide-react';

export const AdminNotifications: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('Admin Announcement');
  const [linkUrl, setLinkUrl] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || sending) return;

    try {
      setSending(true);
      await api.post('/api/admin/notifications', {
        title: title.trim(),
        message: message.trim(),
        type,
        link_url: linkUrl.trim() || undefined,
        target_user_id: targetUserId.trim() ? Number(targetUserId) : undefined
      });
      setSentSuccess(true);
      setTitle('');
      setMessage('');
      setLinkUrl('');
      setTargetUserId('');
      setTimeout(() => setSentSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Broadcast failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk']">
          Broadcast Student Notifications
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Send real-time alerts directly into the Telegram Mini App notification trays of all enrolled learners.
        </p>
      </div>

      {sentSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Notification broadcast delivered successfully!</span>
        </div>
      )}

      <form onSubmit={handleBroadcast} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Notification Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Live Q&A session with Hossain tonight at 8 PM"
            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Category Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
            >
              <option value="Admin Announcement">Admin Announcement</option>
              <option value="New Lesson">New Lesson</option>
              <option value="New PDF">New PDF Resource</option>
              <option value="Important Update">Important Update</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Target User ID (Optional)</label>
            <input
              type="number"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="Leave blank for ALL students"
              className="w-full p-2.5 border border-slate-200 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Action Link (Optional)</label>
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="/lessons or /pdfs or /support"
            className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-xs"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Message Content</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Write clear instructions or test updates for candidates..."
            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
            required
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={sending}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-2xs transition"
          >
            <Send className="w-4 h-4" />
            <span>{sending ? 'Broadcasting...' : 'Broadcast to Students'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
