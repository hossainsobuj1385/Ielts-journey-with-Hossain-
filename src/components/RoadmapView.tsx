import React, { useEffect, useState } from 'react';
import { RoadmapStep, PracticeExercise } from '../types';
import { api } from '../api/client';
import {
  Compass,
  CheckCircle2,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Volume2
} from 'lucide-react';

export const RoadmapView: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number>(1);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [exerciseResults, setExerciseResults] = useState<Record<number, { is_correct: boolean; explanation_bn: string }>>({});
  const [submittingExercise, setSubmittingExercise] = useState<number | null>(null);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const data = await api.get<RoadmapStep[]>('/api/roadmaps');
      setRoadmaps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleSelectOption = (exerciseId: number, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [exerciseId]: option }));
  };

  const handleCheckAnswer = async (roadmapId: number, exercise: PracticeExercise) => {
    const chosen = selectedAnswers[exercise.id];
    if (!chosen) return;

    try {
      setSubmittingExercise(exercise.id);
      const res = await api.post<{ is_correct: boolean; explanation_bn: string }>('/api/roadmaps/' + roadmapId + '/submit', {
        exercise_id: exercise.id,
        answer: chosen
      });

      setExerciseResults(prev => ({
        ...prev,
        [exercise.id]: { is_correct: res.is_correct, explanation_bn: res.explanation_bn }
      }));

      if (res.is_correct) {
        setRoadmaps(prev => prev.map(r => r.id === roadmapId ? { ...r, is_completed: true } : r));
      }
    } catch (err: any) {
      alert(err.message || 'Error checking answer');
    } finally {
      setSubmittingExercise(null);
    }
  };

  const completedCount = roadmaps.filter(r => r.is_completed).length;

  return (
    <div className="space-y-5 pb-24 pt-2 animate-fade-in">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#0A192F] via-[#1E293B] to-[#0F172A] text-white p-5 rounded-2xl border border-slate-700 shadow-md">
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 mb-1">
          <Compass className="w-4 h-4" />
          <span>অনুশীলন ভিত্তিক রোডম্যাপ</span>
        </div>
        <h1 className="text-lg md:text-xl font-bold font-['Space_Grotesk']">
          শুরু থেকে ইংরেজি শেখার ধারাবাহিক অনুশীলন
        </h1>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          কোনোরকম মুখস্থ ছাড়াই শূন্য লেভেল থেকে নিয়মিত কুইজ ও ড্রিল প্র্যাকটিস করে আইইএলটিএস ব্যান্ড ৭+ এ পৌঁছানোর গাইড।
        </p>

        {/* Milestone Tracker */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-200">
              অগ্রগতি: {completedCount} / {roadmaps.length} লেভেল সম্পন্ন
            </span>
          </div>
          <span className="font-bold text-amber-300">
            {roadmaps.length > 0 ? Math.round((completedCount / roadmaps.length) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Roadmaps Accordion List */}
      {loading ? (
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {roadmaps.map(step => {
            const isExpanded = expandedStep === step.id;

            return (
              <div
                key={step.id}
                className={`bg-white rounded-2xl border transition overflow-hidden shadow-2xs ${
                  step.is_completed
                    ? 'border-emerald-300 ring-1 ring-emerald-300/40'
                    : isExpanded
                    ? 'border-amber-400 ring-1 ring-amber-400/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Step Bar Header */}
                <button
                  onClick={() => setExpandedStep(isExpanded ? 0 : step.id)}
                  className="w-full p-4 text-left flex items-center justify-between transition focus:outline-none"
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        step.is_completed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {step.is_completed ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : `0${step.step_number}`}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 mb-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {step.level_tag}
                        </span>
                        {step.is_completed && (
                          <span className="text-[10px] font-bold text-emerald-600">
                            সম্পন্ন ✓
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-[#0A192F] truncate">
                        {step.title_bn}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate">
                        {step.title_en}
                      </p>
                    </div>
                  </div>

                  <div className="text-slate-400 shrink-0">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Expanded Details & Practice Exercises */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-1 border-t border-slate-100 space-y-4 text-xs animate-fade-in">
                    {/* Description */}
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {step.description_bn}
                    </p>

                    {/* Key Rules */}
                    <div>
                      <h4 className="font-bold text-[#0A192F] mb-2 flex items-center space-x-1.5">
                        <BookOpen className="w-4 h-4 text-amber-600" />
                        <span>মূল নিয়ম ও প্রয়োজনীয় পয়েন্ট:</span>
                      </h4>
                      <ul className="space-y-1.5 pl-2">
                        {step.key_points.map((pt, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Interactive Practice Drills */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-[#0A192F] flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>হাতে-কলমে অনুশীলন কুইজ:</span>
                        </h4>
                        <span className="text-[11px] text-slate-400">সঠিক উত্তর নির্বাচন করুন</span>
                      </div>

                      {step.exercises.map(ex => {
                        const selected = selectedAnswers[ex.id];
                        const result = exerciseResults[ex.id];
                        const isChecking = submittingExercise === ex.id;

                        return (
                          <div
                            key={ex.id}
                            className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-3"
                          >
                            <div>
                              <p className="font-bold text-slate-900 text-xs">
                                ❓ {ex.question}
                              </p>
                              {ex.question_bn && (
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {ex.question_bn}
                                </p>
                              )}
                            </div>

                            {/* Options */}
                            <div className="space-y-1.5">
                              {ex.options?.map((opt, optIdx) => {
                                const isOptSelected = selected === opt;
                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => handleSelectOption(ex.id, opt)}
                                    className={`w-full p-2.5 rounded-lg text-left text-xs transition border flex items-center justify-between ${
                                      isOptSelected
                                        ? 'bg-[#0A192F] text-white border-[#0A192F] font-semibold'
                                        : 'bg-white border-slate-200 hover:border-amber-300 text-slate-800'
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isOptSelected && (
                                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Check Button */}
                            <div className="flex items-center justify-between pt-1">
                              {ex.hint_bn && (
                                <span className="text-[10px] text-slate-500 italic">
                                  💡 ইঙ্গিত: {ex.hint_bn}
                                </span>
                              )}
                              <button
                                onClick={() => handleCheckAnswer(step.id, ex)}
                                disabled={!selected || isChecking}
                                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition shadow-2xs ml-auto"
                              >
                                {isChecking ? 'যাচাই হচ্ছে...' : 'উত্তর যাচাই করুন'}
                              </button>
                            </div>

                            {/* Feedback Result */}
                            {result && (
                              <div
                                className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                                  result.is_correct
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                    : 'bg-red-50 text-red-900 border border-red-200'
                                }`}
                              >
                                <div className="font-bold flex items-center space-x-1 mb-0.5">
                                  <span>{result.is_correct ? 'অভিনন্দন! সঠিক উত্তর 🎉' : 'উত্তরটি সঠিক হয়নি! ❌'}</span>
                                </div>
                                <p className="text-[11px]">{result.explanation_bn}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
