
import React, { useState } from 'react';
import { Course } from '../types';
import { INITIAL_COURSES } from '../constants';
import CourseCard from '../components/CourseCard';
import { getSmartRecommendation } from '../services/geminiService';
import { Search, Sparkles, TrendingUp, Award, Zap, Loader2 } from 'lucide-react';

interface ExploreProps {
  onCourseSelect: (course: Course) => void;
}

const Explore: React.FC<ExploreProps> = ({ onCourseSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAISearch, setIsAISearch] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const filteredCourses = INITIAL_COURSES.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    setLoadingAI(true);
    const rec = await getSmartRecommendation(searchQuery, INITIAL_COURSES);
    setAiRecommendation(rec);
    setLoadingAI(false);
  };

  return (
    <div className="p-4 pb-24 space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <header className="flex justify-between items-center py-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">LearnX</h1>
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest mt-1">
            <Award size={14} />
            Mastery Curriculum
          </div>
        </div>
      </header>

      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-2xl shadow-blue-500/20">
         <div className="relative z-10 max-w-[70%]">
            <h2 className="text-2xl font-bold mb-2">Level Up.</h2>
            <p className="text-blue-100 text-sm mb-4 leading-relaxed">Personalized career roads built by Gemini 3 Pro.</p>
            <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
               <TrendingUp size={14} />
               Lynx 3.2 Engaged
            </div>
         </div>
         <Sparkles className="absolute right-4 bottom-4 opacity-20" size={120} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
           <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Search Tracks</label>
           <button 
             onClick={() => setIsAISearch(!isAISearch)}
             className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${isAISearch ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}
           >
             <Zap size={10} fill={isAISearch ? "currentColor" : "none"} />
             {isAISearch ? 'AI MODE: ON' : 'AI MODE: OFF'}
           </button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && isAISearch && handleAISearch()}
            placeholder={isAISearch ? "Describe what you want to learn..." : "Search tracks..."}
            className={`w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-900 rounded-2xl border-none shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20 dark:text-white ${isAISearch ? 'ring-2 ring-blue-500/40' : ''}`}
          />
          {isAISearch && (
            <button 
              onClick={handleAISearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600"
            >
              {loadingAI ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            </button>
          )}
        </div>
      </div>

      {aiRecommendation && isAISearch && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl animate-in zoom-in-95">
           <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-blue-600" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Gemini Recommendation</span>
           </div>
           <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
             "Based on your query, you should explore: <span className="text-blue-600 font-bold">{aiRecommendation}</span>"
           </p>
        </div>
      )}

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Available Curriculum</h3>
        <div className="grid grid-cols-1 gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} onClick={onCourseSelect} />
          ))}
        </div>
      </section>
      
      {filteredCourses.length === 0 && (
         <div className="text-center py-12">
            <p className="text-gray-500">No tracks found. Try toggling AI Mode for better discovery.</p>
         </div>
      )}
    </div>
  );
};

export default Explore;
