import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { daysUntilRenewal, isRenewalSoon, formatCurrency, formatDate } from '../utils/subscriptionUtils';
import { CalendarClock } from 'lucide-react';

export const UpcomingRenewals = () => {
  const { state } = useSubscription();
  const { subscriptions, currency } = state;
  
  const upcoming = subscriptions
    .filter(sub => sub.status === 'active' && isRenewalSoon(sub.renewalDate, 30))
    .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate));

  if (upcoming.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Upcoming Renewals</h3>
      </div>
      <div className="space-y-3">
        {upcoming.map(sub => {
          const days = daysUntilRenewal(sub.renewalDate);
          return (
            <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-100 dark:border-dark-border">
              <div>
                <p className="font-medium text-gray-900 dark:text-dark-text flex items-center gap-2">
                  {sub.serviceName}
                  {days <= 7 && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
                      Soon
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-0.5">Renews on {formatDate(sub.renewalDate)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-dark-text">{formatCurrency(sub.cost, sub.currency || 'USD')}</p>
                <span className={`text-[11px] font-medium bg-transparent mt-0.5 inline-block ${
                  days <= 7 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'
                }`}>
                  In {days} days
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
