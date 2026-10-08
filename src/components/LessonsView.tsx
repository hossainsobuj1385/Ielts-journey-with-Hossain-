import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Category, Lesson } from '../types';
import { api } from '../api/client';
import {
  Search,
  Filter,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock,
  Video,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export const LessonsView: React.FC = () => {
  const { openLesson } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const data = await api.get<Category[]>('/api/categories');
      setCategories([...data].sort((a, b) => a.display_order - b.display_order));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string | number | undefined> = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedLevel !== 'all') params.level = selectedLevel;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await api.get<Lesson[]>('/api/lessons', params);
      setLessons(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [selectedCategory, selectedLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLessons();
  };

  const handleToggleBookmark = async (e: React.MouseEvent, lessonId: number) => {
    e.stopPropagation();
    try {
      const res = await api.post<{ is_bookmarked: boolean }>('/api/bookmarks/toggle', { lesson_id: lessonId });
      setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, is_bookmarked: res.is_bookmarked } : l));
    } catch (err) {
      console.error(err);
    }
  };

  const levels = [
    { id: 'all', label: 'All Levels' },
    { id: 'Beginner', label: 'Beginner (Band 5-6)' },
    { id: 'Intermediate', label: 'Intermediate (Band 6.5)' },
    { id: 'Advanced', label: 'Advanced (Band 7.0)' },
    { id: 'Band 7-9', label: 'Expert (Band 7.5 - 9.0)' }
  ];

  return (
    <div className="space-y-4 pb-24 pt-2 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk'] tracking-tight">
          IELTS Curriculum & Lessons
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Step-by-step masterclasses covering writing templates, speaking fluency, and grammar rules.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2.5">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search lessons (e.g., complex sentences, collocations)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-20 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0A192F] text-white text-[11px] font-semibold rounded-lg hover:bg-slate-800 transition"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              selectedCategory === undefined
                ? 'bg-[#0A192F] text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            All Modules
          </button>
          {categories.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition flex items-center space-x-1.5 ${
                selectedCategory === c.id
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${selectedCategory === c.id ? 'bg-amber-800/40 text-white' : 'bg-amber-50 text-amber-800'}`}>
                ধাপ {idx + 1}
              </span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Level Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
            {levels.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevel(lvl.id)}
                className={`px-2 py-1 rounded text-[11px] whitespace-nowrap transition ${
                  selectedLevel === lvl.id
                    ? 'bg-amber-100 text-amber-800 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lesson List State */}
      {loading ? (
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 animate-pulse space-y-2.5">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl p-8 border border-red-200 text-center space-y-3">
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <button
            onClick={fetchLessons}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : lessons.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center space-y-2">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-700">No lessons found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Try adjusting your search keywords or clearing selected filters to find available content.
          </p>
          <button
            onClick={() => {
              setSelectedCategory(undefined);
              setSelectedLevel('all');
              setSearchQuery('');
              fetchLessons();
            }}
            className="mt-2 text-xs text-amber-700 font-bold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => openLesson(lesson.id)}
              className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-amber-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                      {lesson.category_name}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      • {lesson.level}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => handleToggleBookmark(e, lesson.id)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition"
                    title={lesson.is_bookmarked ? 'Remove Bookmark' : 'Save Lesson'}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        lesson.is_bookmarked
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    />
                  </button>
                </div>

                <h3 className="font-bold text-sm md:text-base text-[#0A192F] group-hover:text-amber-900 transition leading-snug">
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {lesson.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{lesson.views_count} views</span>
                  </span>
                  {lesson.video_url && (
                    <span className="flex items-center space-x-1 text-red-600 font-medium">
                      <Video className="w-3.5 h-3.5" />
                      <span>Video</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {lesson.is_completed && (
                    <span className="text-emerald-600 font-semibold flex items-center space-x-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
