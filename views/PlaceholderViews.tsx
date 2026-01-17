
import React, { useState } from 'react';
import { User, Course } from '../types';
import { architectCareerRoadmap } from '../services/geminiService';
import { ChevronRight, Search, Map, Sparkles, ArrowLeft, Loader2, Target, Briefcase } from 'lucide-react';

export const Career: React.FC<{ onCourseSelect: (course: Course) => void }> = ({ onCourseSelect }) => {
  const [goal, setGoal] = useState('');
  const [roadmap, setRoadmap] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setLoading(true);
    const result = await architectCareerRoadmap(goal);
    setRoadmap(result);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-500">
        <div className="relative mb-8">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center animate-pulse">
                <Target size={40} className="text-blue-600" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 text-blue-500 animate-bounce" size={24} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Architecting your future...</h2>
        <p className="text-gray-500 text-sm max-w-xs">Gemini 3 Pro is auditing 10,000+ career paths to build your specialized roadmap.</p>
        <Loader2 className="animate-spin text-blue-600 mt-8" size={32} />
      </div>
    );
  }

  if (roadmap) {
    return (
      <div className="p-6 pb-24 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <header className="flex items-center justify-between">
           <button onClick={() => setRoadmap(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
              <ArrowLeft size={20} />
           </button>
           <div className="text-right">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">Pro Architect Active</span>
           </div>
        </header>

        <div>
           <h1 className="text-2xl font-bold dark:text-white">Your Career Path</h1>
           <p className="text-sm text-gray-500 mt-1">Goal: {goal}</p>
        </div>

        <div className="relative space-y-6">
           <div className="absolute left-6 top-10 bottom-10 w-1 bg-gradient-to-b from-blue-600 via-indigo-500 to-transparent rounded-full opacity-20" />
           {roadmap.map((course, idx) => (
             <button 
                key={idx}
                onClick={() => onCourseSelect({
                  ...course,
                  modules: [],
                  totalModules: 5,
                  reviews: []
                })}
                className="w-full relative z-10 flex gap-6 items-start text-left group"
             >
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-4 border-gray-50 dark:border-gray-950 flex items-center justify-center text-blue-600 font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-all transform group-active:scale-90">
                   {idx + 1}
                </div>
                <div className="flex-1 bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 group-hover:border-blue-500/50 transition-all">
                   <h3 className="font-bold text-gray-900 dark:text-white mb-1">{course.title}</h3>
                   <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{course.description}</p>
                   <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">{course.category}</span>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                   </div>
                </div>
             </button>
           ))}
        </div>

        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl text-center">
            <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Complete these three tracks to reach 100% Industry Readiness.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mb-12 text-center pt-8">
         <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/40 transform -rotate-6">
            <Map className="text-white" size={40} />
         </div>
         <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Architect.</h1>
         <p className="text-gray-500 mt-2">What is your ultimate career ambition?</p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4 max-w-sm mx-auto">
        <div className="relative">
          <textarea 
            rows={3}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., I want to lead a design team building sustainable homes in Mars..."
            className="w-full p-6 bg-white dark:bg-gray-900 rounded-3xl border-none shadow-xl focus:ring-2 focus:ring-blue-500/20 text-sm dark:text-white resize-none"
          />
          <div className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-lg animate-pulse">
            <Sparkles size={20} />
          </div>
        </div>
        
        <button 
          type="submit"
          className="w-full py-5 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Target size={20} />
          Architect My Path
        </button>
      </form>

      <div className="mt-12 grid grid-cols-2 gap-4 opacity-40">
         {["AI Specialist", "Game Director", "Marine Tech", "Bio Ethicist"].map(t => (
           <div key={t} className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
             {t}
           </div>
         ))}
      </div>
    </div>
  );
};

export const Books: React.FC = () => (
  <div className="p-12 pb-24 text-center">
    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
       <span className="text-3xl">📚</span>
    </div>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Knowledge Vault</h2>
    <p className="text-gray-500 dark:text-gray-400 text-sm">A centralized repository of every citation and resource referenced in your personalized path.</p>
  </div>
);

export const Learn: React.FC = () => (
  <div className="p-12 pb-24 text-center">
    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
       <span className="text-3xl">🎓</span>
    </div>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Progression</h2>
    <p className="text-gray-500 dark:text-gray-400 text-sm">Review your mastered nodes and continue your active career tracks.</p>
  </div>
);
