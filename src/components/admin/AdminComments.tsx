import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  MessageSquare,
  Pin,
  EyeOff,
  Eye,
  Trash2,
  AlertTriangle,
  CornerDownRight,
  Send,
  CheckCircle2
} from 'lucide-react';

export const AdminComments: React.FC = () => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/api/admin/comments');
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleModerate = async (commentId: number, action: 'pin' | 'hide' | 'unhide' | 'delete') => {
    try {
      await api.post(`/api/admin/comments/${commentId}/moderate`, { action });
      if (action === 'delete') {
        setComments(prev => prev.filter(c => c.id !== commentId));
      } else {
        await fetchComments();
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleAdminReply = async (comment: any) => {
    if (!replyContent.trim()) return;
    try {
      await api.post('/api/comments', {
        lesson_id: comment.lesson_id,
        parent_id: comment.id,
        content: replyContent.trim()
      });
      setReplyingId(null);
      setReplyContent('');
      alert('Reply published as Instructor Hossain!');
      fetchComments();
    } catch (err: any) {
      alert(err.message || 'Failed to post reply');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk']">
          Community Discussions & Moderation
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review student sentence drills, answer grammar questions as Instructor Hossain, and handle reports.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">No comments posted yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`bg-white p-4 rounded-xl border transition ${
                comment.reports_count > 0
                  ? 'border-red-300 bg-red-50/20'
                  : comment.is_hidden
                  ? 'border-slate-200 opacity-60 bg-slate-50'
                  : 'border-slate-200/90'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#0A192F]">{comment.author_name}</span>
                  <span className="text-slate-400">@{comment.author_username || comment.author_telegram_id}</span>
                  <span className="text-slate-400">• on <strong>{comment.lesson_title}</strong></span>
                </div>

                <div className="flex items-center space-x-1">
                  {comment.reports_count > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[10px] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {comment.reports_count} Reports
                    </span>
                  )}
                  {comment.is_pinned ? (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                      Pinned
                    </span>
                  ) : null}
                  {comment.is_hidden ? (
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-bold text-[10px]">
                      Hidden
                    </span>
                  ) : null}
                </div>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap pl-1 border-l-2 border-slate-200 py-1">
                {comment.content}
              </p>

              {/* Reports list if flagged */}
              {comment.reports && comment.reports.length > 0 && (
                <div className="mt-2 p-2 bg-red-50 rounded-lg text-[11px] text-red-800 border border-red-200">
                  <span className="font-bold">Flagged reasons: </span>
                  {comment.reports.map((r: any) => r.reason).join(', ')}
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                  <span>{new Date(comment.created_at).toLocaleString()}</span>
                  <span>{comment.likes_count || 0} Likes</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setReplyingId(replyingId === comment.id ? null : comment.id)}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded font-semibold text-[11px] flex items-center space-x-1"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    <span>Reply as Hossain</span>
                  </button>

                  <button
                    onClick={() => handleModerate(comment.id, 'pin')}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                    title={comment.is_pinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className={`w-3.5 h-3.5 ${comment.is_pinned ? 'text-blue-600 fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleModerate(comment.id, comment.is_hidden ? 'unhide' : 'hide')}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                    title={comment.is_hidden ? 'Unhide' : 'Hide from students'}
                  >
                    {comment.is_hidden ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleModerate(comment.id, 'delete')}
                    className="p-1.5 rounded hover:bg-red-50 text-red-600"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Admin Reply Box */}
              {replyingId === comment.id && (
                <div className="mt-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                    <span>Replying as Chief Instructor Hossain:</span>
                  </div>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Provide constructive feedback, grammar corrections, or praise..."
                    rows={2}
                    className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg focus:outline-none"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setReplyingId(null)}
                      className="px-3 py-1 text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAdminReply(comment)}
                      className="px-3.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold flex items-center space-x-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post Reply</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
