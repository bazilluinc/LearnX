
import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { setOfflineItem, getOfflineItem } from '../services/storageService';
import { Clock, Book, Bookmark, BookmarkCheck } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const checkSavedStatus = async () => {
      const savedCourses = await getOfflineItem<string[]>('learnx_bookmarks');
      if (savedCourses && savedCourses.includes(course.id)) {
        setIsSaved(true);
      }
    };
    checkSavedStatus();
  }, [course.id]);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const savedCourses = await getOfflineItem<string[]>('learnx_bookmarks') || [];
    let newSavedCourses: string[];
    
    if (isSaved) {
      newSavedCourses = savedCourses.filter(id => id !== course.id);
    } else {
      newSavedCourses = [...savedCourses, course.id];
    }
    
    await setOfflineItem('learnx_bookmarks', newSavedCourses);
    setIsSaved(!isSaved);
  };

  return (
    <div 
      onClick={() => onClick(course)}
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden active:scale-[0.98] transition-all duration-200 cursor-pointer hover:shadow-md"
    >
      <div className="h-40 w-full overflow-hidden relative">
        <img 
          src={course.imageUrl} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-blue-600 dark:text-blue-400 shadow-sm uppercase tracking-wider">
          {course.category}
        </div>

        <button 
          onClick={toggleBookmark}
          className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
            isSaved 
              ? 'bg-blue-600 text-white scale-110 shadow-lg' 
              : 'bg-white/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900'
          }`}
          aria-label={isSaved ? "Remove from saved" : "Save course"}
        >
          {isSaved ? <BookmarkCheck size={18} fill="currentColor" /> : <Bookmark size={18} />}
        </button>

        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10 leading-relaxed">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <Book size={14} className="text-blue-500" />
            <span>{course.modules.length} Modules</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-indigo-500" />
            <span>{course.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
