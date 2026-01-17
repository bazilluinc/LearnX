import React from 'react';
import { Compass, Briefcase, MessageCircle, GraduationCap, User } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: NavTab.EXPLORE, icon: Compass, label: 'Explore' },
    { id: NavTab.CAREER, icon: Briefcase, label: 'Career' },
    { id: NavTab.FORUM, icon: MessageCircle, label: 'Forum' },
    { id: NavTab.LEARN, icon: GraduationCap, label: 'Learn' },
    { id: NavTab.PROFILE, icon: User, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-2 z-50 transition-colors duration-300">
      <div className="flex justify-around items-center max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300'
              }`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;