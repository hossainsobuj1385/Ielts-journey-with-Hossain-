import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lesson, CommentItem } from '../types';
import { api } from '../api/client';
import {
  X,
  Bookmark,
  CheckCircle2,
  Video,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Pin,
  Flag,
  Trash2,
  Edit2,
  CornerDownRight,
  ShieldCheck,
  Check
} from 'lucide-react';

interface LessonDetailModalProps {
  lessonId: number;
  onClose: () => void;
}

export const LessonDetailModal: React.FC<LessonDetailModalProps> = ({ lessonId, onClose }) => {
  const { user, isAdmin, refreshUser } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchLessonDetails = async () => {
    try {
      setLoading(true);
      const [lData, cData] = await Promise.all([
        api.get<Lesson>(`/api/lessons/${lessonId}`),
        api.get<CommentItem[]>(`/api/comments/lesson/${lessonId}`)
      ]);
      setLesson(lData);
      setComments(cData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonDetails();
  }, [lessonId]);

  const handleToggleComplete = async () => {
    if (!lesson) return;
    try {
      const res = await api.post<{ is_completed: boolean }>('/api/progress/toggle-complete', { lesson_id: lesson.id });
      setLesson(prev => prev ? { ...prev, is_completed: res.is_completed } : null);
      showToast(res.is_completed ? 'Lesson marked as completed! 🎉' : 'Marked as uncompleted');
      refreshUser();
    } catch (err: any) {
      showToast('Error updating progress');
    }
  };

  const handleToggleBookmark = async () => {
    if (!lesson) return;
    try {
      const res = await api.post<{ is_bookmarked: boolean }>('/api/bookmarks/toggle', { lesson_id: lesson.id });
      setLesson(prev => prev ? { ...prev, is_bookmarked: res.is_bookmarked } : null);
      showToast(res.is_bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
      refreshUser();
    } catch (err) {
      showToast('Error updating bookmark');
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      const newComment = await api.post<CommentItem>('/api/comments', {
        lesson_id: lessonId,
        content: commentText.trim()
      });
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      showToast('Comment posted!');
    } catch (err: any) {
      showToast(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handlePostReply = async (parentId: number) => {
    if (!replyText.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      const newReply = await api.post<CommentItem>('/api/comments', {
        lesson_id: lessonId,
        parent_id: parentId,
        content: replyText.trim()
      });

      setComments(prev => prev.map(c => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply]
          };
        }
        return c;
      }));

      setReplyingToId(null);
      setReplyText('');
      showToast('Reply submitted!');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit reply');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleToggleLike = async (commentId: number, isReply: boolean = false, parentId?: number) => {
    try {
      const res = await api.post<{ is_liked: boolean; likes_count: number }>(`/api/comments/${commentId}/like`);

      if (!isReply) {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, is_liked_by_me: res.is_liked, likes_count: res.likes_count } : c));
      } else if (parentId) {
        setComments(prev => prev.map(c => {
          if (c.id === parentId && c.replies) {
            return {
              ...c,
              replies: c.replies.map(r => r.id === commentId ? { ...r, is_liked_by_me: res.is_liked, likes_count: res.likes_count } : r)
            };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editText.trim()) return;
    try {
      await api.put(`/api/comments/${commentId}`, { content: editText.trim() });
      setComments(prev => prev.map(c => {
        if (c.id === commentId) return { ...c, content: editText.trim() };
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map(r => r.id === commentId ? { ...r, content: editText.trim() } : r)
          };
        }
        return c;
      }));
      setEditingCommentId(null);
      setEditText('');
      showToast('Comment updated');
    } catch (err: any) {
      showToast(err.message || 'Failed to update');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.delete(`/api/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId).map(c => ({
        ...c,
        replies: c.replies ? c.replies.filter(r => r.id !== commentId) : []
      })));
      showToast('Comment deleted');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete');
    }
  };

  const handleReportComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingCommentId || !reportReason.trim()) return;
    try {
      await api.post(`/api/comments/${reportingCommentId}/report`, { reason: reportReason.trim() });
      showToast('Report submitted for admin review');
      setReportingCommentId(null);
      setReportReason('');
    } catch (err: any) {
      showToast(err.message || 'Failed to report');
    }
  };

  const extractYouTubeId = (url: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading || !lesson) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading lesson content...</p>
        </div>
      </div>
    );
  }

  const ytVideoId = extractYouTubeId(lesson.video_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-60 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-slide-down flex items-center space-x-2">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header Bar */}
        <div className="p-4 bg-[#0A192F] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 overflow-hidden">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
              {lesson.level}
            </span>
            <h2 className="text-sm font-bold truncate max-w-[280px] sm:max-w-md">{lesson.title}</h2>
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={handleToggleBookmark}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
              title="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${lesson.is_bookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* YouTube Video Player Embed */}
          {ytVideoId ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-md bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${ytVideoId}?rel=0`}
                title={lesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : lesson.video_url ? (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-amber-600" />
                <span>Video Masterclass link available</span>
              </div>
              <a
                href={lesson.video_url}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline text-amber-800"
              >
                Watch on YouTube →
              </a>
            </div>
          ) : null}

          {/* Title & Metadata */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Module: <strong className="text-slate-700">{lesson.category_name}</strong></span>
              <span>{lesson.views_count} views</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-[#0A192F] font-['Space_Grotesk'] leading-tight">
              {lesson.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {lesson.description}
            </p>
          </div>

          {/* Action Bar (Complete & Bookmark) */}
          <div className="flex items-center space-x-3 pt-1">
            <button
              onClick={handleToggleComplete}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                lesson.is_completed
                  ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                  : 'bg-[#0A192F] hover:bg-[#1E293B] text-white shadow-xs'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>{lesson.is_completed ? 'Completed ✓ (Tap to Undo)' : 'Mark Lesson as Completed'}</span>
            </button>
            <button
              onClick={handleToggleBookmark}
              className={`p-2.5 rounded-xl border transition ${
                lesson.is_bookmarked
                  ? 'border-amber-400 bg-amber-50 text-amber-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${lesson.is_bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Formatted Lesson Content */}
          <div className="border-t border-slate-200/80 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Study Notes & Breakdown</h3>
            <div className="prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-3 font-normal">
              {lesson.content}
            </div>
          </div>

          {/* Instructor Hossain Note */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-transparent border border-amber-300/40 flex items-start space-x-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-400/40">
              HA
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0A192F] flex items-center space-x-1">
                <span>Instructor Hossain's Note</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Consistency is key to a 7.5+ band score. Don't just read the lesson: write down your own examples in the discussion box below. I review and comment on student submissions regularly!
              </p>
            </div>
          </div>

          {/* Threaded Discussion Section */}
          <div className="border-t border-slate-200/80 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0A192F] flex items-center space-x-1.5">
                <MessageCircle className="w-4 h-4 text-amber-600" />
                <span>Discussion & Questions ({comments.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">Post sentences for review</span>
            </div>

            {/* Post new comment form */}
            <form onSubmit={handlePostComment} className="space-y-2">
              <textarea
                placeholder="Ask a question or practice writing a sentence from this lesson..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50 focus:bg-white transition"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  className="px-4 py-2 bg-[#0A192F] hover:bg-[#1E293B] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Comment</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3 divide-y divide-slate-100">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No comments yet. Be the first student to practice a sentence!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="pt-3 first:pt-0 space-y-2">
                    {/* Main comment card */}
                    <div className="flex items-start space-x-3">
                      <img
                        src={comment.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={comment.first_name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-[#0A192F]">
                            {comment.first_name} {comment.last_name}
                          </span>
                          {comment.is_admin_author && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" /> Instructor
                            </span>
                          )}
                          {comment.is_pinned && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 flex items-center gap-0.5">
                              <Pin className="w-2.5 h-2.5" /> Pinned
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            • {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Content or Edit mode */}
                        {editingCommentId === comment.id ? (
                          <div className="mt-1 space-y-1.5">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                              rows={2}
                            />
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditComment(comment.id)}
                                className="px-2.5 py-1 bg-amber-600 text-white rounded text-[11px] font-semibold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingCommentId(null)}
                                className="text-[11px] text-slate-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        )}

                        {/* Actions: Like, Reply, Edit, Delete, Report */}
                        <div className="flex items-center space-x-4 mt-2 text-[11px] text-slate-500">
                          <button
                            onClick={() => handleToggleLike(comment.id)}
                            className={`flex items-center space-x-1 transition ${
                              comment.is_liked_by_me ? 'text-red-600 font-bold' : 'hover:text-red-500'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${comment.is_liked_by_me ? 'fill-current' : ''}`} />
                            <span>{comment.likes_count || 0}</span>
                          </button>

                          <button
                            onClick={() => {
                              setReplyingToId(replyingToId === comment.id ? null : comment.id);
                              setReplyText('');
                            }}
                            className="hover:text-slate-900 font-medium"
                          >
                            Reply
                          </button>

                          {user?.id === comment.user_id && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditText(comment.content);
                                }}
                                className="hover:text-amber-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="hover:text-red-600"
                              >
                                Delete
                              </button>
                            </>
                          )}

                          {user?.id !== comment.user_id && (
                            <button
                              onClick={() => setReportingCommentId(comment.id)}
                              className="hover:text-amber-700"
                              title="Report inappropriate content"
                            >
                              <Flag className="w-3 h-3 text-slate-400" />
                            </button>
                          )}
                        </div>

                        {/* Reply Form */}
                        {replyingToId === comment.id && (
                          <div className="mt-2.5 pl-4 border-l-2 border-amber-300 space-y-2">
                            <input
                              type="text"
                              placeholder={`Reply to ${comment.first_name}...`}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                            />
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handlePostReply(comment.id)}
                                disabled={!replyText.trim() || submittingComment}
                                className="px-3 py-1 bg-[#0A192F] text-white rounded-lg text-[11px] font-semibold"
                              >
                                Send Reply
                              </button>
                              <button
                                onClick={() => setReplyingToId(null)}
                                className="text-[11px] text-slate-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Nested Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-2.5 space-y-2 pl-3 border-l-2 border-slate-200">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                <div className="flex items-center space-x-1.5">
                                  <CornerDownRight className="w-3 h-3 text-slate-400" />
                                  <span className="font-bold text-[11px] text-[#0A192F]">
                                    {reply.first_name} {reply.last_name}
                                  </span>
                                  {reply.is_admin_author && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                                      <ShieldCheck className="w-2.5 h-2.5" /> Instructor
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400">
                                    • {new Date(reply.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-slate-700 mt-1 pl-4 leading-relaxed whitespace-pre-wrap text-[11px]">
                                  {reply.content}
                                </p>
                                <div className="flex items-center space-x-3 mt-1.5 pl-4 text-[10px] text-slate-500">
                                  <button
                                    onClick={() => handleToggleLike(reply.id, true, comment.id)}
                                    className={`flex items-center space-x-1 ${reply.is_liked_by_me ? 'text-red-600 font-bold' : ''}`}
                                  >
                                    <Heart className={`w-3 h-3 ${reply.is_liked_by_me ? 'fill-current' : ''}`} />
                                    <span>{reply.likes_count || 0}</span>
                                  </button>
                                  {(user?.id === reply.user_id || isAdmin) && (
                                    <button
                                      onClick={() => handleDeleteComment(reply.id)}
                                      className="text-red-500 hover:underline"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportingCommentId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full space-y-3">
            <h4 className="font-bold text-sm text-[#0A192F]">Report Inappropriate Comment</h4>
            <p className="text-xs text-slate-500">Please provide a reason for our moderation team:</p>
            <form onSubmit={handleReportComment} className="space-y-3">
              <input
                type="text"
                placeholder="Spam, disrespectful language, off-topic..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReportingCommentId(null)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!reportReason.trim()}
                  className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
