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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Track and manage all your software subscriptions
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-end">
          <ExportButton />
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button
            onClick={onAddClick}
            className="btn-primary"
          >
            + Add Subscription
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="card bg-gray-50 dark:bg-dark-bg">
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
