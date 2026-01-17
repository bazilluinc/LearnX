
import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Explore from './views/Explore';
import { Career, Learn } from './views/PlaceholderViews';
import ForumView from './views/ForumView';
import SettingsView from './views/SettingsView';
import CourseDetail from './views/CourseDetail';
import LessonView from './views/LessonView';
import Auth from './components/Auth';
import { NavTab, Course, User, Module } from './types';

// Main App component with default export fixed
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>(NavTab.EXPLORE);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeModule, setActiveModule] = useState<{module: Module, courseTitle: string} | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync dark mode class with state
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    setUser(null);
    setCurrentTab(NavTab.EXPLORE);
    setSelectedCourse(null);
    setActiveModule(null);
  };

  // Auth Guard
  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  // Deep View Guard: Active Lesson
  if (activeModule && selectedCourse) {
    return (
      <LessonView 
        module={activeModule.module}
        courseId={selectedCourse.id}
        courseTitle={selectedCourse.title}
        userId={user.id}
        onBack={(updatedModule) => {
          setActiveModule(null);
        }}
      />
    );
  }

  // Deep View Guard: Course Detail
  if (selectedCourse) {
    return (
      <CourseDetail 
        course={selectedCourse}
        currentUser={user}
        onBack={() => setSelectedCourse(null)}
        onModuleSelect={(module, courseTitle) => setActiveModule({module, courseTitle})}
      />
    );
  }

  // Router Logic for Main Tabs
  const renderContent = () => {
    switch (currentTab) {
      case NavTab.EXPLORE:
        return <Explore onCourseSelect={setSelectedCourse} />;
      case NavTab.CAREER:
        return <Career onCourseSelect={setSelectedCourse} />;
      case NavTab.FORUM:
        return <ForumView />;
      case NavTab.LEARN:
        return <Learn />;
      case NavTab.PROFILE:
        return (
          <SettingsView 
            user={user} 
            onLogout={handleLogout} 
            isDarkMode={isDarkMode} 
            toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
          />
        );
      default:
        return <Explore onCourseSelect={setSelectedCourse} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {renderContent()}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default App;
