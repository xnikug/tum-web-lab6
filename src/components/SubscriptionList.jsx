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
    <div className="overflow-x-auto card p-0 shadow-sm rounded-xl border border-gray-200 dark:border-dark-border">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100/50 dark:bg-dark-bg/50 border-b border-gray-200 dark:border-dark-border">
          <tr>
            <th className="px-6 py-4 text-xs font-extold text-gray-500 dark:text-dark-text-secondary uppercase tracking-widest">Service Name</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-dark-text-secondary uppercase tracking-widest">Category</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-dark-text-secondary uppercase tracking-widest">Cost</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-dark-text-secondary uppercase tracking-widest">Billing</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-dark-text-secondary uppercase tracking-widest">Renewal Date</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-dark-text-secondary uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-dark-text-secondary uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-dark-border bg-white dark:bg-dark-bg-secondary">
          {subscriptions.map((subscription) => {
            const daysLeft = daysUntilRenewal(subscription.renewalDate);
            const renewalWarning = isRenewalSoon(subscription.renewalDate, 30);

            return (
              <tr
                key={subscription.id}
                className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors group"
              >
                <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                  {subscription.serviceName}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide ${getCategoryColor(subscription.category)}`}>
                    {subscription.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-bold">
                  {formatCurrency(subscription.cost, subscription.currency || 'USD')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  <span className="capitalize text-[11px] font-bold tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
                    {subscription.billingCycle}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 dark:text-gray-200 font-medium">
                      {formatDate(subscription.renewalDate)}
                    </span>
                    {renewalWarning && (
                      <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    )}
                    {daysLeft <= 7 && (
                      <span className="text-[10px] uppercase font-bold tracking-wider rounded-md bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-0.5">
                        {daysLeft} days
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${getStatusBadge(subscription.status)}`}>
                    {subscription.status === 'active' ? 'Active' : 'Paused'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(subscription)}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(subscription.id)}
                      className={`p-1.5 rounded-md transition-colors ${subscription.status === 'active' ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30' : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'}`}
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
                      className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
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
