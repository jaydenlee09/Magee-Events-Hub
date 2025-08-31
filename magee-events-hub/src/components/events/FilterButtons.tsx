import React from 'react';
import { Users } from "lucide-react";
import { categories, categoryIcons } from './CategoryUtils';

interface FilterButtonsProps {
  activeFilter: string;
  selectedClubFilter: string | null;
  setActiveFilter: (filter: string) => void;
  setSelectedClubFilter: (club: string | null) => void;
}

/**
 * Filter buttons component for filtering events by category
 */
const FilterButtons: React.FC<FilterButtonsProps> = ({
  activeFilter,
  selectedClubFilter,
  setActiveFilter,
  setSelectedClubFilter
}) => {
  return (
    <div className="mb-6 sm:mb-8 md:mb-10">
      {selectedClubFilter && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm py-2 sm:py-3 px-3 sm:px-5 rounded-xl sm:rounded-2xl shadow-md border border-gray-100/50 dark:border-gray-700/50 max-w-fit mx-auto mb-4 sm:mb-6">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-0.5 sm:mr-1" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Showing events for</span>
          <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-600">{selectedClubFilter}</span>
          <button
            onClick={() => setSelectedClubFilter(null)}
            className="ml-1 sm:ml-2 p-1 sm:p-1.5 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-all duration-300"
            aria-label="Clear club filter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="flex justify-center px-2 overflow-x-auto pb-2 sm:pb-4 scrollbar-hide -mx-2 px-2">
        <div className="inline-flex gap-1.5 sm:gap-2.5 md:gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveFilter(category);
                setSelectedClubFilter(null);
              }}
              className={`px-2.5 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium sm:font-semibold transition-all duration-300 whitespace-nowrap flex items-center justify-center ${
                activeFilter === category && !selectedClubFilter
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105'
                  : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 shadow border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm hover:scale-105'
              }`}
            >
              {categoryIcons[category]}
              <span className="relative top-[1px]">{category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterButtons;
