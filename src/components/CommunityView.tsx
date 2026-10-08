import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { MessageSquare, Heart, ArrowRight, UserCheck, ShieldCheck, Sparkles } from 'lucide-react';

interface CommunityFeed {
  recent: any[];
  my: any[];
}

export const CommunityView: React.FC = () => {
  const { user, openLesson, setActiveView } = useAuth();
  const [feed, setFeed] = useState<CommunityFeed>({ recent: [], my: [] });
  const [activeTab, setActiveTab] = useState<'recent' | 'my'>('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommunity() {
      try {
        setLoading(true);
        const data = await api.get<CommunityFeed>('/api/community');
        setFeed(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCommunity();
  }, []);

  const commentsToShow = activeTab === 'recent' ? feed.recent : feed.my;

  return (
    <div className="space-y-4 pb-24 pt-2 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk'] tracking-tight">
          IELTS Community Discussions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          See questions, sentence drills, and examiner feedback from fellow candidates.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('recent')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'recent'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Recent Activity ({feed.recent.length})
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'my'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          My Comments ({feed.my.length})
        </button>
      </div>

      {/* Community Feed List */}
      {loading ? (
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-4 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : commentsToShow.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center space-y-2">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-700">No discussions yet</h3>
          <p className="text-xs text-slate-400">
            Open any lesson in the curriculum to ask questions and share sentence examples.
          </p>
          <button
            onClick={() => setActiveView('lessons')}
            className="mt-2 text-xs text-amber-700 font-bold hover:underline"
          >
            Explore Lessons
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {commentsToShow.map((item) => (
            <div
              key={item.id}
              onClick={() => openLesson(item.lesson_id)}
              className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-amber-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-[#0A192F] flex items-center space-x-1">
                      <span>{item.author_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'You')}</span>
                      {item.is_admin_author && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" /> Instructor
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      • {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded max-w-[150px] truncate">
                    {item.lesson_title}
                  </span>
                </div>

                <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                  "{item.content}"
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1 text-slate-500">
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-red-100" />
                  <span>{item.likes_count || 0} helpful</span>
                </div>
                <div className="flex items-center space-x-1 text-amber-700 font-semibold group-hover:text-amber-800 transition">
                  <span>Open Lesson Discussion</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
