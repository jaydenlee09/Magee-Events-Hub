import React from 'react';
import { 
  Calendar, 
  Trophy, 
  Theater, 
  HeartHandshake, 
  Sparkles, 
  Users, 
  ClipboardList,
  GraduationCap as AcademicIcon
} from "lucide-react";

/**
 * List of available event categories
 */
export const categories = [
  "All Events", 
  "Academic", 
  "Sports", 
  "Cultural", 
  "Social", 
  "Spirit Day", 
  "Club Event", 
  "Other"
];

/**
 * Map each category to its corresponding icon with responsive sizing
 */
export const categoryIcons: Record<string, React.ReactNode> = {
  "All Events": <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 mr-1 sm:mr-1.5 md:mr-2" />,
  "Academic": <AcademicIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 mr-1 sm:mr-1.5 md:mr-2" />,
  "Sports": <Trophy className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 mr-1 sm:mr-1.5 md:mr-2" />,
  "Cultural": <Theater className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 mr-1 sm:mr-1.5 md:mr-2" />,
  "Social": <HeartHandshake className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 mr-1 sm:mr-1.5 md:mr-2" />,
  "Spirit Day": <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 mr-1 sm:mr-1.5 md:mr-2" />,
  "Club Event": <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 mr-1 sm:mr-1.5 md:mr-2" />,
  "Other": <ClipboardList className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 mr-1 sm:mr-1.5 md:mr-2" />,
};

/**
 * Filter events based on active filter
 * @param events Event data array to filter
 * @param activeFilter Current active filter
 * @param selectedClubFilter Optional club filter
 * @returns Filtered events array
 */
export const filterEvents = (
  events: any[], 
  activeFilter: string, 
  selectedClubFilter: string | null
): any[] => {
  return events.filter(event => {
    // If a club filter is selected, only show events from that club
    if (selectedClubFilter) {
      return event.clubName === selectedClubFilter;
    }
    // Otherwise filter by category (or show all if "All Events" is selected)
    return activeFilter === "All Events" ? true : event.category === activeFilter;
  });
};
