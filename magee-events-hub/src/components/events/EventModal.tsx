import React from 'react';
import { Calendar, Clock, MapPin, Users, User, X } from "lucide-react";
import type { EventData } from './EventsPageTypes';
import { formatDate, formatTime } from './EventsPageUtils';

interface EventModalProps {
  event: EventData | null;
  onClose: () => void;
}

/**
 * Modal for displaying event details
 */
const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-gray-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn shadow-2xl border border-gray-100/50 dark:border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Background */}
        <div className="relative bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-3xl">
          <button
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-2xl p-3">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 mb-2">
                {event.category || "Other"}
              </div>
              <h2 className="text-2xl font-bold">{event.title}</h2>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {event.description}
            </p>
          </div>
          
          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Date & Time */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">When</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{formatTime(event.time)}</span>
                </div>
              </div>
            </div>
            
            {/* Location & Audience */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Where & Who</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{event.location || "Location TBA"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{event.audience || event.targetAudience || "Everyone"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Organizer */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl mb-8">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Organizer</h4>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <User className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-white block">
                  {event.organizer || event.clubName || "Organizer TBA"}
                </span>
                {(event.contactEmail || event.email) && (
                  <a 
                    href={`mailto:${event.contactEmail || event.email}`}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    {event.contactEmail || event.email}
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          {(event.additionalInfo || event.notes) && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Additional Information</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
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
