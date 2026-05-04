import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { formatCurrency } from '../utils/subscriptionUtils';
import { Cpu, AlertTriangle, Key } from 'lucide-react';

export const ApiTracker = () => {
  const { state } = useSubscription();
  const { apiKeys, currency } = state;

  if (!apiKeys || apiKeys.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">API Usage & Limits</h2>
        </div>
        <button className="text-xs font-medium text-gray-500 hover:text-indigo-500 transition-colors flex items-center gap-1">
          <Key className="w-3 h-3" />
          Manage Keys
        </button>
      </div>

      <div className="space-y-5">
        {apiKeys.map((api) => {
          const usagePercentage = (api.currentUsage / api.monthlyLimit) * 100;
          const isWarning = usagePercentage >= 85;
          const isCritical = usagePercentage >= 95;

          // Convert the USD limit/usage to the active currency if needed
          // For simplicity in this widget, we assume limits were set in the chosen currency, or we just format it.
          
          return (
            <div key={api.id} className="relative">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {api.provider}
                </span>
                <div className="flex items-center gap-2">
                  {isWarning && <AlertTriangle className={`w-3.5 h-3.5 ${isCritical ? 'text-red-500' : 'text-amber-500'}`} />}
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(api.currentUsage, currency)} <span className="text-gray-400 dark:text-gray-500 font-normal">/ {formatCurrency(api.monthlyLimit, currency)}</span>
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
              {isCritical && (
                <p className="text-[10px] text-red-500 mt-1 font-medium tracking-wide">Approaching hard limit!</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
