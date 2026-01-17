
import React, { useState } from 'react';
import { User, Course } from '../types';
import { ChevronRight, Search, LayoutGrid, BookOpen, Sparkles, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  "Artificial Intelligence", "Blockchain Tech", "Cybersecurity", "Data Science", "Ethical Hacking", 
  "Financial Literacy", "Game Development", "History of Art", "Interstellar Travel", "JavaScript Mastery", 
  "Kitchen Chemistry", "Language Arts", "Marine Biology", "Nanotechnology", "Organic Gardening", 
  "Philosophy", "Quantum Physics", "Renewable Energy", "Space Exploration", "Theology", 
  "Urban Planning", "Visual Effects", "Web3 Architecture", "Xylography", "Yoga Science", 
  "Zoology", "Alternative Medicine", "Behavioral Economics", "Cognitive Science", "Digital Marketing", 
  "Electronic Music", "Forensic Science", "Genetic Engineering", "Human Rights", "Industrial Design", 
  "Journalism", "Kinesiology", "Law", "Macroeconomics", "Nuclear Energy", 
  "Optics", "Paleontology", "Robotics", "Social Psychology", "Thermodynamics", 
  "Virology", "Wildlife Conservation", "Xenobiology", "Youth Mentorship", "Zen Architecture"
];

// Generate 200 course titles per category logically
const generateCoursesForCategory = (category: string): string[] => {
  return Array.from({ length: 200 }, (_, i) => `${category} Specialist Level ${i + 1}`);
};

export const Career: React.FC<{ onCourseSelect: (course: Course) => void }> = ({ onCourseSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredCategories = CATEGORIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  if (selectedCategory) {
    const courses = generateCoursesForCategory(selectedCategory);
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-950 animate-in slide-in-from-right duration-300">
        <header className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 sticky top-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md z-10">
          <button onClick={() => setSelectedCategory(null)} className="p-2 text-gray-500 hover:text-black dark:hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-gray-900 dark:text-white truncate">{selectedCategory}</h2>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">200 Mastery Tracks Available</p>
          {courses.map((title, i) => (
            <button 
              key={i}
              onClick={() => onCourseSelect({
                id: `generated-${title.replace(/\s+/g, '-').toLowerCase()}`,
                title: title,
                description: `Deep dive into ${title}. Powered by Gemini.`,
                imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400',
                category: selectedCategory,
                modules: [],
                totalModules: 5,
                duration: '6 Weeks',
                reviews: []
              })}
              className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-transparent hover:border-blue-500 hover:bg-white dark:hover:bg-gray-800 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {i + 1}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600">{title}</span>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Pathways</h1>
        <p className="text-sm text-gray-500 mt-1">Explore 10,000+ AI-driven mastery tracks.</p>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-900 rounded-2xl border-none shadow-sm text-sm focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filteredCategories.map((cat, i) => (
          <button 
            key={i}
            onClick={() => setSelectedCategory(cat)}
            className="p-5 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-blue-500 hover:scale-[1.02] transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-1">{cat}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">200 Courses</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export const Books: React.FC = () => (
  <div className="p-6 pb-24 text-center">
    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
       <span className="text-3xl">📚</span>
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Library</h2>
    <p className="text-gray-500">Curated reading lists and resources to supplement your audio lessons.</p>
  </div>
);

export const Learn: React.FC = () => (
  <div className="p-6 pb-24 text-center">
    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
       <span className="text-3xl">🎓</span>
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">My Learning</h2>
    <p className="text-gray-500">Track your progress and revisit completed courses here.</p>
  </div>
);
