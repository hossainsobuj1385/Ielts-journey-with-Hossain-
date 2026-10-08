import React, { useEffect, useState } from 'react';
import { Lesson, Category } from '../../types';
import { api } from '../../api/client';
import { getModuleTheme } from '../../utils/moduleThemes';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  X,
  Video,
  FileText,
  ArrowUp,
  ArrowDown,
  Layers,
  List,
  Sparkles,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export const AdminLessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'module_sequence' | 'all_table'>('module_sequence');
  const [loading, setLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const [lData, cData] = await Promise.all([
        api.get<Lesson[]>('/api/admin/lessons'),
        api.get<Category[]>('/api/categories')
      ]);
      setLessons(lData);
      setCategories(cData.sort((a, b) => a.display_order - b.display_order));
      if (selectedModuleId === 'all' && cData.length > 0) {
        setSelectedModuleId(cData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleOpenCreateForModule = (catId?: number) => {
    const targetCatId = catId || (selectedModuleId !== 'all' ? selectedModuleId : categories[0]?.id || 1);
    const existingInCat = lessons.filter(l => l.category_id === targetCatId);
    const nextOrder = existingInCat.reduce((max, l) => Math.max(max, l.order_index || 0), 0) + 1;

    setEditingLesson({
      title: `ধাপ ${nextOrder}: `,
      category_id: targetCatId,
      order_index: nextOrder,
      prerequisite_text: nextOrder > 1 ? `ধাপ ${nextOrder - 1} সম্পন্ন করার পর পড়ুন` : 'শুরু করার প্রাথমিক ধাপ',
      level: 'Intermediate',
      description: '',
      content: '',
      video_url: '',
      pdf_url: '',
      thumbnail_url: '',
      status: 'published'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lesson: Lesson) => {
    setEditingLesson({ ...lesson });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || submitting) return;

    try {
      setSubmitting(true);
      if (editingLesson.id) {
        await api.put(`/api/admin/lessons/${editingLesson.id}`, editingLesson);
        setSaveSuccessMsg('লেসন সফলভাবে আপডেট করা হয়েছে!');
      } else {
        await api.post('/api/admin/lessons', editingLesson);
        setSaveSuccessMsg('নতুন ধারাবাহিক ধাপ সফলভাবে যুক্ত করা হয়েছে!');
      }
      setIsModalOpen(false);
      setEditingLesson(null);
      await fetchLessons();
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving lesson');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই লেসনটি ডিলিট করতে চান?')) return;
    try {
      await api.delete(`/api/admin/lessons/${id}`);
      setLessons(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting lesson');
    }
  };

  const handleToggleStatus = async (lesson: Lesson) => {
    const newStatus = lesson.status === 'published' ? 'draft' : 'published';
    try {
      await api.put(`/api/admin/lessons/${lesson.id}`, { status: newStatus });
      setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, status: newStatus } : l));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveStep = async (categoryId: number, lessonId: number, direction: 'up' | 'down') => {
    const catLessons = lessons
      .filter(l => l.category_id === categoryId)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    const index = catLessons.findIndex(l => l.id === lessonId);
    if (index < 0) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === catLessons.length - 1) return;

    const swapTargetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...catLessons];
    const temp = reordered[index];
    reordered[index] = reordered[swapTargetIndex];
    reordered[swapTargetIndex] = temp;

    const newIds = reordered.map(l => l.id);

    try {
      await api.post('/api/admin/lessons/reorder', {
        category_id: categoryId,
        lesson_ids: newIds
      });
      await fetchLessons();
    } catch (err: any) {
      alert('ধারাবাহিকতা পরিবর্তনের ক্ষেত্রে সমস্যা হয়েছে');
    }
  };

  const currentTheme = selectedModuleId !== 'all' ? getModuleTheme(selectedModuleId) : null;
  const currentCategory = categories.find(c => c.id === selectedModuleId);
  const activeModuleLessons = selectedModuleId !== 'all'
    ? lessons
        .filter(l => l.category_id === selectedModuleId)
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    : lessons;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk'] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span>মডিউল ধারাবাহিক ধাপ ও লেসন ম্যানেজার</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            প্রতিটি মডিউলের ধারাবাহিকতা বজায় রেখে নতুন ধাপ যুক্ত করুন, সাজান এবং ভিডিও/পিডিএফ ফাইল লিঙ্ক করুন।
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setViewMode('module_sequence')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition ${
                viewMode === 'module_sequence'
                  ? 'bg-white text-[#0A192F] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ধারাবাহিক ধাপ</span>
            </button>
            <button
              onClick={() => setViewMode('all_table')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition ${
                viewMode === 'all_table'
                  ? 'bg-white text-[#0A192F] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>সব তালিকা</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenCreateForModule()}
            className="px-3.5 py-2 bg-[#0A192F] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-2xs transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>নতুন ধাপ যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Module Selector Chips with Distinct Eye-Friendly Colors */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          মডিউল নির্বাচন করুন (Module Color Themes):
        </label>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedModuleId('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border ${
              selectedModuleId === 'all'
                ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            সব মডিউল ({lessons.length})
          </button>
          {categories.map((cat, idx) => {
            const theme = getModuleTheme(cat.id);
            const count = lessons.filter(l => l.category_id === cat.id).length;
            const isSelected = selectedModuleId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedModuleId(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center space-x-1.5 border ${
                  isSelected
                    ? `${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} ring-2 ring-slate-400/50 shadow-2xs`
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder}`}>
                  ধাপ {idx + 1}
                </span>
                <span>{cat.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Module Summary Card (When in Sequential View) */}
      {viewMode === 'module_sequence' && currentCategory && currentTheme && (
        <div className={`p-4 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs`}>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${currentTheme.badgeBg} ${currentTheme.badgeText} ${currentTheme.badgeBorder}`}>
                {currentTheme.step_label} - {currentTheme.colorName}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                • {activeModuleLessons.length} টি ধারাবাহিক ধাপ অন্তর্ভুক্ত
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#0A192F] mt-1">
              {currentCategory.name} – {currentTheme.name_bn}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
              {currentCategory.description || 'এই মডিউলের ধারাবাহিকতা বজায় রেখে শিক্ষার্থীদের ধাপে ধাপে শেখানো হচ্ছে।'}
            </p>
          </div>

          <button
            onClick={() => handleOpenCreateForModule(currentCategory.id)}
            className={`px-4 py-2 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shrink-0 shadow-2xs transition ${currentTheme.buttonBg} ${currentTheme.buttonHoverBg}`}
          >
            <Plus className="w-4 h-4" />
            <span>+ এই মডিউলে নতুন ধাপ যোগ করুন</span>
          </button>
        </div>
      )}

      {/* VIEW 1: Sequential Steps by Module */}
      {viewMode === 'module_sequence' ? (
        loading ? (
          <div className="py-12 text-center text-slate-400">Loading curriculum steps...</div>
        ) : activeModuleLessons.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">এই মডিউলে কোনো ধাপ যুক্ত করা হয়নি</p>
            <p className="text-xs text-slate-400">
              ধারাবাহিকতা অনুযায়ী শিক্ষার্থীদের জন্য প্রথম ধাপ যুক্ত করতে নিচের বাটনে চাপ দিন।
            </p>
            <button
              onClick={() => handleOpenCreateForModule()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl inline-flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ধাপ ১ তৈরি করুন</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeModuleLessons.map((lesson, index) => {
              const theme = getModuleTheme(lesson.category_id);
              const isFirst = index === 0;
              const isLast = index === activeModuleLessons.length - 1;

              return (
                <div
                  key={lesson.id}
                  className={`bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 p-3.5 shadow-2xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group`}
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    {/* Step Number Badge */}
                    <div className={`w-9 h-9 rounded-xl ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder} font-bold text-xs flex items-center justify-center shrink-0`}>
                      ধাপ {lesson.order_index || index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {lesson.level}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theme.badgeBg} ${theme.badgeText}`}>
                          {lesson.category_name}
                        </span>
                        {lesson.prerequisite_text && (
                          <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            পূর্বশর্ত: {lesson.prerequisite_text}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-[#0A192F] group-hover:text-amber-900 transition truncate mt-1">
                        {lesson.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {lesson.description}
                      </p>

                      <div className="flex items-center space-x-3 mt-1 text-[10px] text-slate-400">
                        {lesson.video_url && (
                          <span className="flex items-center space-x-1 text-red-600 font-semibold">
                            <Video className="w-3 h-3" />
                            <span>YouTube ভিডিও সংযুক্ত</span>
                          </span>
                        )}
                        {lesson.pdf_url && (
                          <span className="flex items-center space-x-1 text-blue-600 font-semibold">
                            <FileText className="w-3 h-3" />
                            <span>পিডিএফ গাইড যুক্ত</span>
                          </span>
                        )}
                        <span>{lesson.views_count} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Step Re-ordering */}
                  <div className="flex items-center space-x-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end">
                    {/* Move Up / Down Buttons for strict sequence */}
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 space-x-0.5">
                      <button
                        onClick={() => handleMoveStep(lesson.category_id, lesson.id, 'up')}
                        disabled={isFirst}
                        className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-20 transition"
                        title="ধারাবাহিকতায় উপরে নিন"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveStep(lesson.category_id, lesson.id, 'down')}
                        disabled={isLast}
                        className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-20 transition"
                        title="ধারাবাহিকতায় নিচে নিন"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Status Pill */}
                    <button
                      onClick={() => handleToggleStatus(lesson)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                        lesson.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {lesson.status}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(lesson)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition"
                      title="এডিট করুন"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(lesson.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="ডিলিট করুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* VIEW 2: All Lessons Table */
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">ধারাবাহিক ধাপ</th>
                  <th className="p-3.5">Lesson Title</th>
                  <th className="p-3.5">Module / Category</th>
                  <th className="p-3.5">Level</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Views</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeModuleLessons.map((lesson) => {
                  const theme = getModuleTheme(lesson.category_id);
                  return (
                    <tr key={lesson.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder}`}>
                          ধাপ {lesson.order_index || 1}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-[#0A192F] max-w-[240px] truncate">
                        {lesson.title}
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${theme.badgeBg} ${theme.badgeText}`}>
                          {lesson.category_name}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {lesson.level}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleStatus(lesson)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                            lesson.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {lesson.status}
                        </button>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {lesson.views_count}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(lesson)}
                          className="p-1 rounded text-slate-500 hover:text-amber-700 hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Step Modal with Full Sequential Controls */}
      {isModalOpen && editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-[#0A192F] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">
                  {editingLesson.id ? 'ধারাবাহিক ধাপ এডিট করুন' : 'মডিউলে নতুন ধারাবাহিক ধাপ / লেসন যুক্ত করুন'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 overflow-y-auto flex-1 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Module selection */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">মডিউল / ক্যাটাগরি (Module)</label>
                  <select
                    value={editingLesson.category_id || 1}
                    onChange={(e) => {
                      const newCatId = Number(e.target.value);
                      const existingInCat = lessons.filter(l => l.category_id === newCatId);
                      const nextOrder = existingInCat.reduce((max, l) => Math.max(max, l.order_index || 0), 0) + 1;
                      setEditingLesson({
                        ...editingLesson,
                        category_id: newCatId,
                        order_index: editingLesson.id ? editingLesson.order_index : nextOrder
                      });
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 bg-white"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Step / Order Index */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ধারাবাহিক ধাপ নং (Step Order)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingLesson.order_index ?? 1}
                    onChange={(e) => setEditingLesson({ ...editingLesson, order_index: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 bg-amber-50/50 font-bold text-amber-900"
                    placeholder="1, 2, 3..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ধাপের শিরোনাম (Step Title)</label>
                <input
                  type="text"
                  value={editingLesson.title || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  placeholder="যেমন: ধাপ ১: Basic Sentence Structure & Subject-Verb Agreement"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পূর্বশর্ত / আগের ধাপ (Prerequisite Notice)</label>
                  <input
                    type="text"
                    value={editingLesson.prerequisite_text || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, prerequisite_text: e.target.value })}
                    placeholder="যেমন: ধাপ ১ শেষ করার পর এটি শুরু করুন"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">লেভেল (Proficiency Level)</label>
                  <select
                    value={editingLesson.level || 'Intermediate'}
                    onChange={(e) => setEditingLesson({ ...editingLesson, level: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="Beginner">Beginner (Band 5-6)</option>
                    <option value="Intermediate">Intermediate (Band 6.5)</option>
                    <option value="Advanced">Advanced (Band 7.0)</option>
                    <option value="Band 7-9">Expert (Band 7.5 - 9.0)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">সংক্ষিপ্ত বিবরণ (Short Description)</label>
                <input
                  type="text"
                  value={editingLesson.description || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                  placeholder="কার্ডে প্রদর্শিত সংক্ষিপ্ত মূল ধারণা"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Video URL & PDF URL (ইচ্ছে স্বাধীন কিন্তু এড করা যাবে) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
                    <Video className="w-3.5 h-3.5 text-red-600" />
                    <span>ইউটিউব ভিডিও লিংক (YouTube Video URL - Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={editingLesson.video_url || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">ভিডিও লিংক দিলে লেসনের ভেতরে সুন্দর প্লেয়ার দেখাবে</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>সংযুক্ত পিডিএফ ফাইল লিংক (PDF Guide URL - Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={editingLesson.pdf_url || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, pdf_url: e.target.value })}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">গুগল ড্রাইভ বা ডাউনলোড লিংক</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">লেসনের মূল পাঠ ও প্র্যাকটিস ড্রিল (Markdown Content)</label>
                <textarea
                  value={editingLesson.content || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, content: e.target.value })}
                  rows={8}
                  placeholder="### মূল সূত্র ও নিয়মাবলী\n\nউদাহরণ ও অনুশীলন..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-mono text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পাবলিকেশন স্ট্যাটাস</label>
                  <select
                    value={editingLesson.status || 'published'}
                    onChange={(e) => setEditingLesson({ ...editingLesson, status: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="published">Published (প্রকাশিত)</option>
                    <option value="draft">Draft (খসড়া)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">কভার থাম্বনেইল URL</label>
                  <input
                    type="url"
                    value={editingLesson.thumbnail_url || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, thumbnail_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-2xs"
                >
                  {submitting ? 'সংরক্ষণ হচ্ছে...' : 'ধাপ সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
