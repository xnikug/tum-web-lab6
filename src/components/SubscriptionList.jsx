import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { formatCurrency, formatDate, daysUntilRenewal, isRenewalSoon } from '../utils/subscriptionUtils';
import { Trash2, Edit2, Pause, Play, AlertCircle } from 'lucide-react';

export const SubscriptionList = ({ subscriptions, onEditClick }) => {
  const { state, dispatch } = useSubscription();

  const handleToggleStatus = (id) => {
    dispatch({ type: 'TOGGLE_SUBSCRIPTION_STATUS', payload: id });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      dispatch({ type: 'DELETE_SUBSCRIPTION', payload: id });
    }
  };

  const handleEdit = (subscription) => {
    onEditClick(subscription);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Productivity': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
      'Design': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100',
      'Communication': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
      'Analytics': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100',
      'Security': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
      'Storage': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100',
      'Other': 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100',
    };
    return colors[category] || colors['Other'];
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
      'paused': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
    };
    return badges[status] || badges['paused'];
  };

  return (
    <div className="overflow-x-auto card p-0">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">Service Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">Cost</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">Billing</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">Renewal Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
          {subscriptions.map((subscription) => {
            const daysLeft = daysUntilRenewal(subscription.renewalDate);
            const renewalWarning = isRenewalSoon(subscription.renewalDate, 30);

            return (
              <tr
                key={subscription.id}
                className="hover:bg-gray-50 dark:hover:bg-dark-bg-secondary transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-dark-text">
                  {subscription.serviceName}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(subscription.category)}`}>
                    {subscription.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-dark-text font-semibold">
                  {formatCurrency(subscription.cost, subscription.currency || 'USD')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary">
                  <span className="capitalize text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded">
                    {subscription.billingCycle}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-dark-text">
                      {formatDate(subscription.renewalDate)}
                    </span>
                    {renewalWarning && (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                    {daysLeft <= 7 && (
                      <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-2 py-1 rounded">
                        {daysLeft} days
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(subscription.status)}`}>
                    {subscription.status === 'active' ? '✓ Active' : '⊘ Paused'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(subscription)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(subscription.id)}
                      className={`p-1 ${subscription.status === 'active' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}
                      title={subscription.status === 'active' ? 'Pause' : 'Resume'}
                    >
                      {subscription.status === 'active' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(subscription.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
