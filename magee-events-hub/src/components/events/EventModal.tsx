import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, User, X } from "lucide-react";
import type { EventData } from './EventsPageTypes';
import { formatDateFull, formatTime } from './EventsPageUtils';

interface EventModalProps {
  event: EventData | null;
  onClose: () => void;
}

/**
 * Modal for displaying event details
 */
const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  
  // Handle the closing animation
  const handleClose = () => {
    setIsClosing(true);
    // Wait for the animation to finish before actually closing
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match this with the animation duration
  };

  if (!event) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl md:rounded-3xl max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl w-full max-h-[85vh] overflow-y-auto ${isClosing ? 'animate-scaleOut' : 'animate-scaleIn'} shadow-2xl border border-gray-100/50 dark:border-gray-700/50`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Background */}
        <div className="relative bg-gradient-to-r from-red-500 to-red-600 text-white p-3 xs:p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl md:rounded-t-3xl">
          <button
            className="absolute top-2 xs:top-3 sm:top-4 right-2 xs:right-3 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          
          <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
            <div className="bg-white/20 rounded-xl sm:rounded-2xl p-2 sm:p-3">
              <Calendar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            </div>
            <div>
              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-medium bg-white/20 mb-1 xs:mb-1.5 sm:mb-2">
                {event.category || "Other"}
              </div>
              <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold truncate">{event.title}</h2>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-3 xs:p-4 sm:p-5 md:p-6">
          {/* Description */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h3 className="text-base xs:text-lg font-semibold text-gray-900 dark:text-white mb-1 xs:mb-1.5 sm:mb-2">Description</h3>
            <p className="text-xs xs:text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {event.description}
            </p>
          </div>
          
          {/* Details */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
            {/* Date & Time */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 xs:p-3 sm:p-4 rounded-lg sm:rounded-xl">
              <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">When</h4>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="font-medium text-xs xs:text-sm sm:text-base text-gray-900 dark:text-white">{formatDateFull(event.date)}</span>
                </div>
                <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="font-medium text-xs xs:text-sm sm:text-base text-gray-900 dark:text-white">{formatTime(event.time)}</span>
                </div>
              </div>
            </div>
            
            {/* Location & Audience */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 xs:p-3 sm:p-4 rounded-lg sm:rounded-xl">
              <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Where & Who</h4>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="font-medium text-xs xs:text-sm sm:text-base text-gray-900 dark:text-white">{event.location || "Location TBA"}</span>
                </div>
                <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="font-medium text-xs xs:text-sm sm:text-base text-gray-900 dark:text-white">{event.audience || event.targetAudience || "Everyone"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Organizer */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 xs:p-3 sm:p-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 md:mb-8">
            <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Organizer</h4>
            <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <User className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <span className="font-medium text-xs xs:text-sm sm:text-base text-gray-900 dark:text-white block">
                  {event.organizer || event.clubName || "Organizer TBA"}
                </span>
                {(event.contactEmail || event.email) && (
                  <a 
                    href={`mailto:${event.contactEmail || event.email}`}
                    className="text-xs xs:text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    {event.contactEmail || event.email}
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          {(event.additionalInfo || event.notes) && (
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h3 className="text-base xs:text-lg font-semibold text-gray-900 dark:text-white mb-1 xs:mb-1.5 sm:mb-2">Additional Information</h3>
              <p className="text-xs xs:text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {event.additionalInfo || event.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
