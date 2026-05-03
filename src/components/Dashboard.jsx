import React, { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { filterSubscriptions, getCategories, calculateMonthlySpend, calculateAnnualSpend, formatCurrency } from '../utils/subscriptionUtils';
import { SubscriptionList } from './SubscriptionList';
import { FilterBar } from './FilterBar';
import { StatsCard } from './StatsCard';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';

export const Dashboard = ({ onAddClick, onEditClick }) => {
  const { state } = useSubscription();
  const { subscriptions, filters, currency } = state;

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
        <button
          onClick={onAddClick}
          className="btn-primary"
        >
          + Add Subscription
        </button>
      </div>

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

      {/* Subscription List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-4">
          Subscriptions ({filteredSubscriptions.length})
        </h2>
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
    </div>
  );
};
