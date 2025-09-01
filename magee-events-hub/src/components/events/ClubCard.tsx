import React from 'react';
import { Calendar, Clock, MapPin, User, Eye, Trash2 } from "lucide-react";
import type { ClubData } from './EventsPageTypes';
import { getCategoryColorGradient } from './EventsPageUtils';

interface ClubCardProps {
  club: ClubData;
  onViewDetails: (club: ClubData) => void;
  onDeleteClub?: (club: ClubData) => void;
  isAdmin: boolean;
}

/**
 * Component for displaying a club card
 */
const ClubCard: React.FC<ClubCardProps> = ({ club, onViewDetails, onDeleteClub, isAdmin }) => {
  const categoryGradient = getCategoryColorGradient(club.category);
  
  // The club icon is shown within the card already
  return (
    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-3 xs:p-4 sm:p-6 md:p-8 transition-all hover:shadow-2xl hover:-translate-y-1">
      <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 mb-2 xs:mb-3 sm:mb-4">
        <div className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white text-sm xs:text-base sm:text-lg rounded-lg sm:rounded-xl bg-gradient-to-br ${categoryGradient}`}>
          {club.category && club.category.charAt(0)}
        </div>
        <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{club.name}</h3>
      </div>
      
      <p className="text-xs xs:text-sm sm:text-base text-gray-700 dark:text-gray-300 line-clamp-2 mb-1.5 xs:mb-2 sm:mb-3">
        {club.description}
      </p>
      
      <div className="space-y-1.5 xs:space-y-2 sm:space-y-3 mb-3 xs:mb-4 sm:mb-6">
        {club.meetingDays && (
          <div className="flex items-center gap-1.5 xs:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <Calendar size={14} className="flex-shrink-0 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            <span>{club.meetingDays}</span>
          </div>
        )}
        
        {club.meetingTime && (
          <div className="flex items-center gap-1.5 xs:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <Clock size={14} className="flex-shrink-0 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            <span>{club.meetingTime}</span>
          </div>
        )}
        
        {club.location && (
          <div className="flex items-center gap-1.5 xs:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <MapPin size={14} className="flex-shrink-0 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            <span>{club.location}</span>
          </div>
        )}
        
        {club.sponsor && (
          <div className="flex items-center gap-1.5 xs:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <User size={14} className="flex-shrink-0 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            <span>{club.sponsor}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <button 
          onClick={() => onViewDetails(club)}
          className="flex items-center gap-1 xs:gap-1.5 px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs xs:text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md"
        >
          <Eye size={14} className="xs:w-4 xs:h-4 sm:w-[18px] sm:h-[18px]" />
          View Details
        </button>
        
        {isAdmin && onDeleteClub && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClub(club);
            }}
            className="p-1.5 xs:p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            <Trash2 size={14} className="xs:w-4 xs:h-4 sm:w-[18px] sm:h-[18px]" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ClubCard;
