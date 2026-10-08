import React, { useEffect, useState } from 'react';
import { RoadmapStep } from '../../types';
import { api } from '../../api/client';
import { Compass, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';

export const AdminRoadmaps: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<RoadmapStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoadmaps() {
      try {
        setLoading(true);
        const data = await api.get<RoadmapStep[]>('/api/roadmaps');
        setRoadmaps(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRoadmaps();
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk']">
          Practice Roadmaps & Curriculum Drills
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          অনুশীলন ভিত্তিক শুরু থেকে ইংরেজি শেখার লেভেল ও কুইজ ড্রিল ম্যানেজমেন্ট।
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading roadmaps...</div>
      ) : (
        <div className="space-y-3">
          {roadmaps.map(step => (
            <div key={step.id} className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                    0{step.step_number}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-[#0A192F]">{step.title_bn}</h3>
                    <p className="text-[11px] text-slate-400">{step.title_en} • {step.level_tag}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                  {step.exercises.length} Interactive Drills
                </span>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                {step.description_bn}
              </p>

              <div className="text-xs space-y-1.5">
                <span className="font-bold text-slate-700">Sample Exercises in this Level:</span>
                <div className="grid sm:grid-cols-2 gap-2 pt-1">
                  {step.exercises.map(ex => (
                    <div key={ex.id} className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200/60 text-[11px]">
                      <p className="font-bold text-[#0A192F]">❓ {ex.question}</p>
                      <p className="text-emerald-700 font-medium mt-0.5">✓ Correct: {ex.correct_answer}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">{ex.explanation_bn}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
