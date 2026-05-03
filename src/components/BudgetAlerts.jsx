import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { calculateMonthlySpend, formatCurrency } from '../utils/subscriptionUtils';
import { AlertTriangle, TrendingDown } from 'lucide-react';

export const BudgetAlerts = () => {
  const { state } = useSubscription();
  const { subscriptions, currency, budgetThreshold } = state;
  
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const monthlySpend = calculateMonthlySpend(activeSubscriptions, currency);
  
  const isOverBudget = monthlySpend > budgetThreshold;
  // Prevent division by zero if budget is 0
  const budgetUtilization = budgetThreshold > 0 
    ? Math.min((monthlySpend / budgetThreshold) * 100, 100).toFixed(1) 
    : 100;

  // Only show if at least 80% of budget is used
  if (!isOverBudget && budgetUtilization < 80) return null;

  const expensiveSubs = [...activeSubscriptions]
    .sort((a, b) => {
      // Normalize cost to monthly for fair comparison
      const aCost = a.billingCycle === 'yearly' ? a.cost / 12 : a.cost;
      const bCost = b.billingCycle === 'yearly' ? b.cost / 12 : b.cost;
      return bCost - aCost;
    })
    .slice(0, 3);

  return (
    <div className={`card border-l-4 ${isOverBudget ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20' : 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'}`}>
      <div className="flex gap-4">
        <div className={`mt-1 ${isOverBudget ? 'text-red-500' : 'text-yellow-500'}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${isOverBudget ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
            {isOverBudget ? 'Budget Exceeded!' : 'Approaching Budget Limit'}
          </h3>
          <p className={`mt-1 text-sm ${isOverBudget ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
            You are currently spending {formatCurrency(monthlySpend, currency)} / month. 
            Your set budget threshold is {formatCurrency(budgetThreshold, currency)} ({budgetUtilization}% used).
          </p>
          
          {isOverBudget && expensiveSubs.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-1">
                <TrendingDown className="w-4 h-4" /> Optimization Suggestions
              </h4>
              <div className="text-sm text-red-700 dark:text-red-300">
                <p className="mb-2">Consider pausing these top expenses if not actively used:</p>
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 space-y-2">
                  {expensiveSubs.map(sub => (
                    <div key={sub.id} className="flex justify-between items-center py-1">
                      <span className="font-medium">{sub.serviceName}</span>
                      <span className="font-semibold">{formatCurrency(sub.cost, sub.currency || 'USD')} / {sub.billingCycle}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
