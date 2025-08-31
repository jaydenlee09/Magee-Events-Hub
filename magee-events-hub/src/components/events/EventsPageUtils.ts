// Utility functions for the Events Page

/**
 * Formats a date string into a readable format
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Date TBA';
  
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Formats a time string into a readable format
 */
export const formatTime = (timeString?: string): string => {
  if (!timeString) return 'Time TBA';
  
  try {
    // If the timeString already contains AM/PM, it's already formatted
    if (timeString.includes('AM') || timeString.includes('PM')) {
      // Check if there's a NaN in the time and fix it if possible
      if (timeString.includes('NaN')) {
        const parts = timeString.split(' ');
        if (parts.length === 2) {
          const timePart = parts[0].split(':')[0];
          return `${timePart}:00 ${parts[1]}`; // Replace NaN with 00
        }
      }
      return timeString; // Already formatted
    }
    
    // First verify that we have a valid time format (##:## or #:##)
    if (!/^\d{1,2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    
    const [hoursStr, minutesStr] = timeString.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    // Validate parsed values
    if (isNaN(hours) || isNaN(minutes)) {
      return timeString;
    }
    
    let period = 'AM';
    let hour = hours;
    
    if (hours >= 12) {
      period = 'PM';
      if (hours > 12) hour = hours - 12;
    }
    if (hours === 0) hour = 12;
    
    return `${hour}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

/**
 * Returns a tailwind color class based on the category
 */
export const getCategoryColor = (category?: string): string => {
  switch (category?.toLowerCase()) {
    case 'academic':
      return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 dark:from-red-900/40 dark:to-red-800/40 dark:text-red-200 border-red-200 dark:border-red-700';
    case 'sports':
      return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-200 border-blue-200 dark:border-blue-700';
    case 'cultural':
      return 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 dark:from-purple-900/40 dark:to-purple-800/40 dark:text-purple-200 border-purple-200 dark:border-purple-700';
    case 'social':
      return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 dark:from-green-900/40 dark:to-green-800/40 dark:text-green-200 border-green-200 dark:border-green-700';
    case 'spirit day':
      return 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 dark:from-yellow-900/40 dark:to-yellow-800/40 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
    case 'club event':
      return 'bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 dark:from-pink-900/40 dark:to-pink-800/40 dark:text-pink-200 border-pink-200 dark:border-pink-700';
    case 'other':
      return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 dark:from-gray-800/40 dark:to-gray-700/40 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    default:
      return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 dark:from-gray-800/40 dark:to-gray-700/40 dark:text-gray-200 border-gray-200 dark:border-gray-700';
  }
};

/**
 * Returns a tailwind gradient class based on the category
 */
export const getCategoryColorGradient = (category?: string): string => {
  switch (category?.toLowerCase()) {
    case 'academic':
      return 'bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700';
    case 'sports':
      return 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700';
    case 'cultural':
      return 'bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700';
    case 'social':
      return 'bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700';
    case 'spirit day':
      return 'bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700';
    case 'club event':
      return 'bg-gradient-to-r from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700';
    case 'other':
      return 'bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700';
    default:
      return 'bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700';
  }
};
