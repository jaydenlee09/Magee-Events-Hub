import React from 'react';

/**
 * Skeleton card component for loading state
 */
const SkeletonCard: React.FC = () => (
  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 p-4 sm:p-6 md:p-8 animate-pulse">
    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg sm:rounded-xl" />
      <div className="h-5 sm:h-6 w-32 sm:w-40 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded" />
    </div>
    <div className="h-4 sm:h-5 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded mb-2 sm:mb-3" />
    <div className="h-3 sm:h-4 w-1/2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded mb-4 sm:mb-6" />
    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
      <div className="h-3 sm:h-4 w-1/2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded" />
      <div className="h-3 sm:h-4 w-1/3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded" />
      <div className="h-3 sm:h-4 w-1/4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded" />
    </div>
    <div className="h-8 sm:h-12 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg sm:rounded-xl" />
  </div>
);

export default SkeletonCard;
