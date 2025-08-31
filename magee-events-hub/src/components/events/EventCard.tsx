import React from 'react';
import { Calendar, Clock, MapPin, Users, Eye, Trash2 } from "lucide-react";
import type { EventData } from './EventsPageTypes';
import { formatDate, formatTime, getCategoryColorGradient } from './EventsPageUtils';

interface EventCardProps {
  event: EventData;
  onViewDetails: (event: EventData) => void;
  onDeleteEvent?: (event: EventData) => void;
  isAdmin: boolean;
}

/**
 * Component for displaying an event card
 */
const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails, onDeleteEvent, isAdmin }) => {
  const categoryGradient = getCategoryColorGradient(event.category);
  
  return (
    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-4 sm:p-6 md:p-8 transition-all hover:shadow-2xl hover:-translate-y-1">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white rounded-lg sm:rounded-xl bg-gradient-to-br ${categoryGradient}`}>
          {event.category && event.category.charAt(0)}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{event.title}</h3>
      </div>
      
      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 line-clamp-2 mb-2 sm:mb-3">
        {event.clubName || event.organizer || 'Organizer TBA'}
      </p>
      
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <Calendar size={16} className="flex-shrink-0" />
          <span>{formatDate(event.date)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <Clock size={16} className="flex-shrink-0" />
          <span>{formatTime(event.time)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <MapPin size={16} className="flex-shrink-0" />
          <span>{event.location || 'Location TBA'}</span>
        </div>
        
        {event.targetAudience && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <Users size={16} className="flex-shrink-0" />
            <span>{event.targetAudience}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <button 
          onClick={() => onViewDetails(event)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md"
        >
          <Eye size={18} />
          View Details
        </button>
        
        {isAdmin && onDeleteEvent && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDeleteEvent(event);
            }}
            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
