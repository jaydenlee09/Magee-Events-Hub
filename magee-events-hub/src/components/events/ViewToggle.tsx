import React from 'react';
import { Calendar, Users } from 'lucide-react';
import type { ViewType } from './EventsPageTypes';

interface ViewToggleProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

/**
 * Component for toggling between events and clubs views
 */
const ViewToggle: React.FC<ViewToggleProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="flex justify-center mb-6 sm:mb-8">
      <div className="relative inline-flex bg-gray-100/70 dark:bg-gray-800/70 backdrop-blur-md rounded-full p-0.5 sm:p-1 shadow-lg border border-gray-200/30 dark:border-gray-700/30">
        {/* Animated Background Indicator */}
        <div 
          className={`absolute h-full top-0 transition-all duration-300 ease-in-out rounded-full bg-white dark:bg-gray-700 shadow-md ${
            activeView === 'events' ? 'left-0.5 w-[calc(50%-1px)]' : 'left-[calc(50%+1px)] w-[calc(50%-1px)]'
          }`} 
          style={{
            boxShadow: '0 0 15px 2px rgba(239, 68, 68, 0.15)'
          }}
        ></div>
        
        {/* Events Tab */}
        <button
          onClick={() => onViewChange('events')}
          className={`relative z-10 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full text-sm sm:text-base font-medium sm:font-semibold transition-all duration-300 ${
            activeView === 'events'
              ? 'text-red-500 dark:text-red-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <span className="flex items-center gap-1.5 sm:gap-2">
            <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${activeView === 'events' ? 'scale-110' : ''}`} />
            <span className="transition-all duration-300 transform origin-left">Events</span>
          </span>
        </button>
        
        {/* Clubs Tab */}
        <button
          onClick={() => onViewChange('clubs')}
          className={`relative z-10 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full text-sm sm:text-base font-medium sm:font-semibold transition-all duration-300 ${
            activeView === 'clubs'
              ? 'text-red-500 dark:text-red-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <span className="flex items-center gap-1.5 sm:gap-2">
            <Users className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${activeView === 'clubs' ? 'scale-110' : ''}`} />
            <span className="transition-all duration-300 transform origin-left">Clubs</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default ViewToggle;
