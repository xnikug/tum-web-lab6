import React from 'react';

export const StatsCard = ({ icon, title, value, trend, subtitle }) => {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">
              {value}
            </p>
            {trend && (
              <span className="text-xs text-green-600 dark:text-green-400">
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className="text-blue-500 dark:text-blue-400">
          {icon}
        </div>
      </div>
    </div>
  );
};
