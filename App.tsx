
import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import Auth from './components/Auth';
import BottomNav from './components/BottomNav';
import Explore from './views/Explore';
import CourseDetail from './views/CourseDetail';
import LessonView from './views/LessonView';
import SettingsView from './views/SettingsView';
import ForumView from './views/ForumView';
import { Career, Books, Learn } from './views/PlaceholderViews';
import { NavTab, User, Course, Module } from './types';

const MainContent = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('learnx_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState<NavTab>(NavTab.EXPLORE);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('learnx_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('learnx_user');
    }
  }, [user]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleModuleUpdate = (updatedModule: Module) => {
    if (selectedCourse) {
      const updatedModules = selectedCourse.modules.map(m => 
        m.id === updatedModule.id ? updatedModule : m
      );
      setSelectedCourse({ ...selectedCourse, modules: updatedModules });
    }
    setSelectedModule(null);
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  if (selectedModule && selectedCourse) {
    return (
      <LessonView 
        module={selectedModule} 
        courseId={selectedCourse.id}
        courseTitle={selectedCourse.title}
        userId={user.id}
        onBack={handleModuleUpdate}
      />
    );
  }

  if (selectedCourse) {
    return (
      <CourseDetail 
        course={selectedCourse} 
        currentUser={user}
        onBack={() => setSelectedCourse(null)} 
        onModuleSelect={(module) => setSelectedModule(module)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <main className="max-w-md mx-auto min-h-screen bg-white dark:bg-gray-900 shadow-2xl overflow-hidden relative transition-colors duration-300">
        {activeTab === NavTab.EXPLORE && <Explore onCourseSelect={setSelectedCourse} />}
        {activeTab === NavTab.CAREER && <Career onCourseSelect={setSelectedCourse} />}
        {activeTab === NavTab.BOOKS && <Books />}
        {activeTab === NavTab.FORUM && <ForumView />}
        {activeTab === NavTab.LEARN && <Learn />}
        {activeTab === NavTab.PROFILE && (
          <SettingsView 
            user={user} 
            onLogout={() => setUser(null)} 
            isDarkMode={isDarkMode} 
            toggleDarkMode={toggleDarkMode}
          />
        )}
        
        <BottomNav currentTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <MainContent />
    </HashRouter>
  );
};

export default App;
