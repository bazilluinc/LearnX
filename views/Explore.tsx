
import React, { useState } from 'react';
import { Course } from '../types';
import { INITIAL_COURSES } from '../constants';
import CourseCard from '../components/CourseCard';
import { Search, Sparkles, TrendingUp, Award } from 'lucide-react';

interface ExploreProps {
  onCourseSelect: (course: Course) => void;
}

const Explore: React.FC<ExploreProps> = ({ onCourseSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = INITIAL_COURSES.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">CURRICULUM SYNCED</span>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-2xl shadow-blue-500/20">
         <div className="relative z-10 max-w-[70%]">
            <h2 className="text-2xl font-bold mb-2">Be the best in the world.</h2>
            <p className="text-blue-100 text-sm mb-4 leading-relaxed">Our AI-guided mastery tracks ensure you don't just learn—you excel. One-on-one tutoring for every student.</p>
            <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
               <TrendingUp size={14} />
               Lynx 3.2 Engaged
            </div>
         </div>
         <Sparkles className="absolute right-4 bottom-4 opacity-20" size={120} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search curriculum..." 
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white"
        />
      </div>

      {/* Course List */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Featured Tracks</h3>
        <div className="grid grid-cols-1 gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} onClick={onCourseSelect} />
          ))}
        </div>
      </section>
      
      {filteredCourses.length === 0 && (
         <div className="text-center py-12">
            <p className="text-gray-500">No tracks found. Our team is constantly auditing new courses.</p>
         </div>
      )}
    </div>
  );
};

export default Explore;
