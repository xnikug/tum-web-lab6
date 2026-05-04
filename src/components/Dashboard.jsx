import React, { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { filterSubscriptions, getCategories, calculateMonthlySpend, calculateAnnualSpend, formatCurrency } from '../utils/subscriptionUtils';
import { SubscriptionList } from './SubscriptionList';
import { FilterBar } from './FilterBar';
import { StatsCard } from './StatsCard';
import { BudgetAlerts } from './BudgetAlerts';
import { UpcomingRenewals } from './UpcomingRenewals';
import { ExportButton } from './ExportButton';
import { DollarSign, TrendingUp, Clock, Settings2 } from 'lucide-react';

export const Dashboard = ({ onAddClick, onEditClick }) => {
  const { state, dispatch } = useSubscription();
  const { subscriptions, filters, currency, budgetThreshold } = state;
  const [showSettings, setShowSettings] = useState(false);
  const [tempBudget, setTempBudget] = useState(budgetThreshold);

  const handleSaveBudget = () => {
    dispatch({ type: 'SET_BUDGET_THRESHOLD', payload: parseFloat(tempBudget) || 0 });
    setShowSettings(false);
  };

  const filteredSubscriptions = filterSubscriptions(subscriptions, filters);
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  
  const monthlySpend = calculateMonthlySpend(activeSubscriptions, currency);
  const annualSpend = calculateAnnualSpend(activeSubscriptions, currency);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and manage your software subscriptions and optimize your budget.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <ExportButton />
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-[#111111] hover:bg-gray-50 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-300 transition-colors shadow-sm"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            + New Subscription
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-4">Dashboard Settings</h3>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              Monthly Budget Threshold ({currency})
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                className="input-field"
                min="0"
                step="10"
              />
              <button onClick={handleSaveBudget} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts & Notifications */}
      <BudgetAlerts />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Monthly Spend"
          value={formatCurrency(monthlySpend, currency)}
          trend="+2.5%"
        />
        <StatsCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Annual Spend"
          value={formatCurrency(annualSpend, currency)}
          trend="+1.8%"
        />
        <StatsCard
          icon={<Clock className="w-6 h-6" />}
          title="Active Subscriptions"
          value={activeSubscriptions.length}
          subtitle={`of ${subscriptions.length} total`}
        />
      </div>

      {/* Filters */}
      <FilterBar categories={getCategories(subscriptions)} />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Subscription List (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
              Subscriptions ({filteredSubscriptions.length})
            </h2>
          </div>
          {filteredSubscriptions.length > 0 ? (
            <SubscriptionList
              subscriptions={filteredSubscriptions}
              onEditClick={onEditClick}
            />
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-600 dark:text-dark-text-secondary">
                No subscriptions found. Try adjusting your filters or add a new subscription.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar (1/3 width) */}
        <div className="space-y-6">
          <UpcomingRenewals />
        </div>
      </div>
    </div>
  );
};
