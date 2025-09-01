import React from 'react';
import { Users, X } from "lucide-react";
import { categories, categoryIcons } from './CategoryUtils';

interface FilterButtonsProps {
  activeFilter: string;
  selectedClubFilter: string | null;
  setActiveFilter: (filter: string) => void;
  setSelectedClubFilter: (club: string | null) => void;
}

/**
 * Modern Filter buttons component for filtering events by category
 * Simplified version with just category pills
 */
const FilterButtons: React.FC<FilterButtonsProps> = ({
  activeFilter,
  selectedClubFilter,
  setActiveFilter,
  setSelectedClubFilter
}) => {
  // Group categories for better organization
  const secondaryCategories = categories.filter(cat => cat !== "All Events");
  
  // Get gradient for pill backgrounds
  const getCategoryGradient = (category: string) => {
    switch(category) {
      case "Academic": return "from-blue-500 to-blue-600";
      case "Sports": return "from-green-500 to-green-600";
      case "Cultural": return "from-purple-500 to-purple-600";
      case "Social": return "from-pink-500 to-pink-600";
      case "Spirit Day": return "from-amber-500 to-amber-600";
      case "Club Event": return "from-teal-500 to-teal-600";
      case "Other": return "from-gray-500 to-gray-600";
      default: return "from-red-500 to-red-600";
    }
  };
  
  return (
    <div className="mb-6 sm:mb-8 md:mb-10 mt-2 sm:mt-0">
      {/* Selected Filters Area - Horizontal Pills */}
      <div className="flex flex-wrap items-center ml-4 md:ml-8 lg:ml-12 gap-2 sm:gap-3 mb-4 sm:mb-6 px-2">
        {/* Club Filter Badge - If Selected */}
        {selectedClubFilter && (
          <div className="animate-fadeIn flex items-center gap-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm py-1.5 px-3 rounded-full shadow-sm border border-gray-100/50 dark:border-gray-700/50">
            <Users className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{selectedClubFilter}</span>
            <button
              onClick={() => setSelectedClubFilter(null)}
              className="ml-1 p-0.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-all"
              aria-label="Clear club filter"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        
        {/* Active Category Badge - Only show if not "All Events" */}
        {activeFilter !== "All Events" && !selectedClubFilter && (
          <div className={`animate-fadeIn flex items-center gap-1.5 bg-gradient-to-r ${getCategoryGradient(activeFilter)} py-1.5 px-3 rounded-full shadow-sm text-white`}>
            {categoryIcons[activeFilter]}
            <span className="text-xs font-medium">{activeFilter}</span>
            <button
              onClick={() => setActiveFilter("All Events")}
              className="ml-1 p-0.5 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all"
              aria-label="Clear filter"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
      
      {/* Category Pills - Horizontal Scrollable (Primary Filtering Interface) */}
      <div className="relative">
        {/* Scrollable Categories */}
        <div className="flex overflow-x-auto pb-2 xs:pb-3 scrollbar-hide pl-4 md:pl-8 lg:pl-12 pr-4 gap-1.5 xs:gap-2 sm:gap-2.5">
          <button
            onClick={() => {
              setActiveFilter("All Events");
              setSelectedClubFilter(null);
            }}
            className={`flex-shrink-0 flex items-center gap-1 xs:gap-1.5 px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 rounded-full transition-all text-xs xs:text-sm sm:text-base ${
              activeFilter === "All Events" && !selectedClubFilter
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/20'
                : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 shadow-sm'
            }`}
            aria-label="Filter by All Events"
          >
            <div className="flex items-center justify-center w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-[25px] xl:h-[25px]">
              {categoryIcons["All Events"]}
            </div>
            <span className="whitespace-nowrap font-medium">All Events</span>
          </button>
          
          {secondaryCategories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveFilter(category);
                setSelectedClubFilter(null);
              }}
              className={`flex-shrink-0 flex items-center gap-1 xs:gap-1.5 px-2.5 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 rounded-full transition-all text-xs xs:text-sm sm:text-base ${
                activeFilter === category && !selectedClubFilter
                  ? 'bg-gradient-to-r ' + getCategoryGradient(category) + ' text-white shadow-md'
                  : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 shadow-sm'
              }`}
              aria-label={`Filter by ${category}`}
            >
              <div className="flex items-center justify-center w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-[25px] xl:h-[25px]">
                {categoryIcons[category]}
              </div>
              <span className="whitespace-nowrap font-medium">{category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterButtons;
