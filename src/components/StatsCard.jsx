import React from 'react';

export const StatsCard = ({ icon, title, value, trend, subtitle }) => {
  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
              {value}
            </p>
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-2.5 bg-gray-50 dark:bg-gray-800/80 rounded-lg text-gray-600 dark:text-gray-300">
          {icon}
        </div>
      </div>
    </div>
  );
};
