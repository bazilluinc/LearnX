import React, { useState } from 'react';
import { User } from '../types';
import { Moon, Sun, Bell, User as UserIcon, Shield, LogOut, ChevronRight, Zap, BookOpen } from 'lucide-react';

interface SettingsViewProps {
  user: User | null;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout, isDarkMode, toggleDarkMode }) => {
  const [notifications, setNotifications] = useState(true);
  const [learningPace, setLearningPace] = useState('Adaptive');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-6 pb-8 rounded-b-3xl shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-blue-500/30 ring-4 ring-white dark:ring-gray-700">
            {user?.name.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          <div className="mt-3 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
            Premium Member
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        
        {/* Appearance Section */}
        <section>
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">Appearance</h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                  {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                    <span className="font-medium text-gray-800 dark:text-white block">Dark Mode</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Easier on the eyes at night</span>
                </div>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Personalization Section */}
        <section>
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">Personalization</h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                  <Zap size={20} />
                </div>
                <div>
                    <span className="font-medium text-gray-800 dark:text-white block">Learning Pace</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">AI adjusts to your speed</span>
                </div>
              </div>
              <button 
                onClick={() => setLearningPace(prev => prev === 'Adaptive' ? 'Intensive' : 'Adaptive')}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1"
              >
                {learningPace} <ChevronRight size={16} />
              </button>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                  <Bell size={20} />
                </div>
                <div>
                    <span className="font-medium text-gray-800 dark:text-white block">Notifications</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Study reminders & updates</span>
                </div>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${notifications ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section>
          <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">Account</h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <UserIcon size={20} />
                </div>
                <span className="font-medium text-gray-800 dark:text-white">Edit Profile</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
            <button className="w-full p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg">
                  <BookOpen size={20} />
                </div>
                <span className="font-medium text-gray-800 dark:text-white">Learning History</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
            <button className="w-full p-4 flex items-center justify-between active:bg-gray-50 dark:active:bg-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">
                  <Shield size={20} />
                </div>
                <span className="font-medium text-gray-800 dark:text-white">Privacy & Security</span>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          </div>
        </section>

        <button 
          onClick={onLogout}
          className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-red-600 font-semibold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
        >
          <LogOut size={20} />
          Sign Out
        </button>
        
        <p className="text-center text-xs text-gray-400 py-2">Version 3.2.0 • Build 8942</p>
      </div>
    </div>
  );
};

export default SettingsView;