import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SupportRequest, SupportMessage } from '../types';
import { api } from '../api/client';
import {
  MessageCircleQuestion,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const SupportView: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [activeRequestDetails, setActiveRequestDetails] = useState<{ request: SupportRequest; messages: SupportMessage[] } | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.get<SupportRequest[]>('/api/support');
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchThread = async (id: number) => {
    try {
      const data = await api.get<{ request: SupportRequest; messages: SupportMessage[] }>(`/api/support/${id}`);
      setActiveRequestDetails(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (selectedRequestId) {
      fetchThread(selectedRequestId);
    } else {
      setActiveRequestDetails(null);
    }
  }, [selectedRequestId]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim() || submitting) return;

    try {
      setSubmitting(true);
      const created = await api.post<SupportRequest>('/api/support', {
        subject: newSubject.trim(),
        message: newMessage.trim()
      });
      setNewSubject('');
      setNewMessage('');
      setIsCreatingNew(false);
      await fetchRequests();
      setSelectedRequestId(created.id);
      refreshUser();
    } catch (err: any) {
      alert(err.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !replyText.trim() || submitting) return;

    try {
      setSubmitting(true);
      const sentMsg = await api.post<SupportMessage>(`/api/support/${selectedRequestId}/message`, {
        message: replyText.trim()
      });
      setActiveRequestDetails(prev => prev ? {
        ...prev,
        messages: [...prev.messages, sentMsg]
      } : null);
      setReplyText('');
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Answered':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Answered
          </span>
        );
      case 'Closed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
            Closed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Waiting
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-24 pt-2 animate-fade-in">
      {/* If viewing a single thread */}
      {selectedRequestId && activeRequestDetails ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedRequestId(null)}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Inquiries</span>
          </button>

          {/* Ticket Header Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Ticket #{activeRequestDetails.request.id}
              </span>
              {getStatusBadge(activeRequestDetails.request.status)}
            </div>
            <h2 className="text-base font-bold text-[#0A192F]">
              {activeRequestDetails.request.subject}
            </h2>
            <p className="text-[11px] text-slate-400">
              Opened on {new Date(activeRequestDetails.request.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Message Thread */}
          <div className="space-y-3">
            {activeRequestDetails.messages.map((msg) => {
              const isAdminMsg = msg.sender_role === 'admin';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isAdminMsg ? 'items-start' : 'items-end'
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1.5 shadow-2xs ${
                      isAdminMsg
                        ? 'bg-amber-50/80 border border-amber-200/80 text-amber-950 rounded-tl-xs'
                        : 'bg-[#0A192F] text-white rounded-tr-xs'
                    }`}
                  >
                    <div className="flex items-center space-x-1 text-[10px] font-semibold opacity-80">
                      {isAdminMsg ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-amber-600" />
                          <span>Instructor Hossain</span>
                        </>
                      ) : (
                        <span>You</span>
                      )}
                      <span>• {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Form */}
          {activeRequestDetails.request.status !== 'Closed' ? (
            <form onSubmit={handleSendReply} className="pt-2 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your response..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 shadow-2xs"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || submitting}
                className="px-4 py-2.5 bg-[#0A192F] hover:bg-[#1E293B] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-2xs shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Send</span>
              </button>
            </form>
          ) : (
            <p className="text-center text-xs text-slate-400 py-3">
              This support ticket has been closed. You may submit a new question below.
            </p>
          )}
        </div>
      ) : (
        /* Support Requests Overview & New Ticket */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk'] tracking-tight">
                Support & Guidance Desk
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct questions to Instructor Hossain for personalized exam assistance.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="px-3 py-2 bg-[#0A192F] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-2xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>{isCreatingNew ? 'Cancel' : 'New Question'}</span>
            </button>
          </div>

          {/* New Ticket Form */}
          {isCreatingNew && (
            <form
              onSubmit={handleCreateTicket}
              className="bg-white p-4 rounded-2xl border border-amber-300 shadow-xs space-y-3 animate-fade-in"
            >
              <h3 className="font-bold text-sm text-[#0A192F]">Submit Question to Hossain</h3>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g., Task 2 Thesis statement structure"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Detailed Inquiry</label>
                <textarea
                  placeholder="Describe what part of the lesson or Cambridge test you need clarification on..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition"
                >
                  {submitting ? 'Sending...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          )}

          {/* Requests List */}
          {loading ? (
            <div className="space-y-3 pt-2">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 animate-pulse space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center space-y-2">
              <MessageCircleQuestion className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-700">No support requests</h3>
              <p className="text-xs text-slate-400">
                Have a question about IELTS preparation? Tap "New Question" above to ask!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {requests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className="bg-white rounded-xl border border-slate-200/80 p-3.5 hover:border-amber-300 hover:shadow-2xs transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center space-x-2 text-xs mb-1">
                      {getStatusBadge(req.status)}
                      <span className="text-[10px] text-slate-400">
                        {new Date(req.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#0A192F] truncate group-hover:text-amber-900 transition">
                      {req.subject}
                    </h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {req.last_message || 'Inquiry submitted'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0 transition" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
