import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  Send,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Filter
} from 'lucide-react';

export const AdminSupport: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [thread, setThread] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/api/admin/support', { filter });
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchThread = async (id: number) => {
    try {
      const data = await api.get<any>(`/api/support/${id}`);
      setThread(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  useEffect(() => {
    if (selectedId) {
      fetchThread(selectedId);
    } else {
      setThread(null);
    }
  }, [selectedId]);

  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !replyText.trim() || sending) return;

    try {
      setSending(true);
      const sent = await api.post(`/api/support/${selectedId}/message`, {
        message: replyText.trim()
      });
      setThread((prev: any) => ({
        ...prev,
        messages: [...prev.messages, sent]
      }));
      setReplyText('');
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to reply');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: 'Waiting' | 'Answered' | 'Closed', priority?: 'Normal' | 'High') => {
    if (!selectedId) return;
    try {
      await api.put(`/api/admin/support/${selectedId}/status`, { status, priority });
      setThread((prev: any) => ({
        ...prev,
        request: { ...prev.request, status, ...(priority ? { priority } : {}) }
      }));
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const filters = ['All', 'Waiting', 'Answered', 'Closed', 'Priority'];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* If Thread is selected */}
      {selectedId && thread ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tickets List</span>
            </button>

            {/* Quick Status Modifiers */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleUpdateStatus('Answered')}
                className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold"
              >
                Mark Answered
              </button>
              <button
                onClick={() => handleUpdateStatus('Closed')}
                className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close Ticket
              </button>
              <button
                onClick={() => handleUpdateStatus(thread.request.status, thread.request.priority === 'High' ? 'Normal' : 'High')}
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  thread.request.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {thread.request.priority === 'High' ? 'High Priority' : 'Normal Priority'}
              </button>
            </div>
          </div>

          {/* Ticket Header */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Student: <strong>{thread.request.user_name}</strong> (Telegram: {thread.request.user_telegram_id})</span>
              <span className="font-bold uppercase text-amber-700">{thread.request.status}</span>
            </div>
            <h3 className="font-bold text-sm text-[#0A192F]">{thread.request.subject}</h3>
          </div>

          {/* Conversation history */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 max-h-[50vh] overflow-y-auto">
            {thread.messages.map((m: any) => {
              const isAdmin = m.sender_role === 'admin';
              return (
                <div key={m.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-xs space-y-1 ${
                      isAdmin
                        ? 'bg-[#0A192F] text-white rounded-tr-xs'
                        : 'bg-amber-50 border border-amber-200 text-amber-950 rounded-tl-xs'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-[10px] opacity-80 font-bold">
                      <span>{isAdmin ? 'You (Instructor Hossain)' : thread.request.user_name}</span>
                      <span>• {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply box */}
          <form onSubmit={handleAdminReply} className="flex space-x-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write response as Instructor Hossain..."
              className="flex-1 text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 shadow-2xs"
            />
            <button
              type="submit"
              disabled={!replyText.trim() || sending}
              className="px-5 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-2xs"
            >
              <Send className="w-4 h-4" />
              <span>Send Answer</span>
            </button>
          </form>
        </div>
      ) : (
        /* List Mode */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk']">
                Student Support & Academic Desk
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Answer student grammar, writing, and test inquiry tickets directly.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 text-xs">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    filter === f ? 'bg-[#0A192F] text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading tickets...</div>
          ) : requests.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">All caught up!</p>
              <p className="text-xs text-slate-400 mt-0.5">No tickets found under filter "{filter}".</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Last Message</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {requests.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className="hover:bg-slate-50/70 cursor-pointer transition"
                    >
                      <td className="p-3.5 font-bold text-[#0A192F]">
                        {r.user_name}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800 max-w-[200px] truncate">
                        {r.subject}
                      </td>
                      <td className="p-3.5">
                        {r.priority === 'High' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                            High
                          </span>
                        ) : (
                          <span className="text-slate-400">Normal</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.status === 'Waiting'
                            ? 'bg-amber-100 text-amber-800'
                            : r.status === 'Answered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 max-w-[220px] truncate">
                        {r.last_message}
                      </td>
                      <td className="p-3.5 text-right font-bold text-amber-700">
                        Open Thread →
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
