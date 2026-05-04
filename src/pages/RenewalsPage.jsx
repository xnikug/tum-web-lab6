import React from 'react';
import { UpcomingRenewals } from '../components/UpcomingRenewals';

export const RenewalsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          Alerts & Renewals
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Stay on top of upcoming charges and active alerts.
        </p>
      </div>

      <div className="max-w-xl">
        <UpcomingRenewals />
      </div>
    </div>
  );
};
