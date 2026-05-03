import React, { useState, useEffect } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { X } from 'lucide-react';

const categoryOptions = ['Productivity', 'Design', 'Communication', 'Analytics', 'Security', 'Storage', 'Other'];
const billingCycleOptions = ['monthly', 'yearly'];
const currencyOptions = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];

export const SubscriptionModal = ({ subscription, onClose }) => {
  const { dispatch } = useSubscription();
  const [formData, setFormData] = useState({
    serviceName: '',
    cost: '',
    billingCycle: 'monthly',
    category: 'Productivity',
    status: 'active',
    renewalDate: '',
    currency: 'USD',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (subscription) {
      setFormData(subscription);
    }
  }, [subscription]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.serviceName.trim()) {
      newErrors.serviceName = 'Service name is required';
    }

    if (!formData.cost || formData.cost <= 0) {
      newErrors.cost = 'Cost must be greater than 0';
    }

    if (!formData.renewalDate) {
      newErrors.renewalDate = 'Renewal date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cost' ? parseFloat(value) || '' : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (subscription && subscription.id) {
      dispatch({
        type: 'UPDATE_SUBSCRIPTION',
        payload: { ...formData, id: subscription.id },
      });
    } else {
      dispatch({
        type: 'ADD_SUBSCRIPTION',
        payload: formData,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg-secondary">
          <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text">
            {subscription ? 'Edit Subscription' : 'Add New Subscription'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Service Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-dark-text mb-2">
              Service Name *
            </label>
            <input
              type="text"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              placeholder="e.g., Slack, Adobe Creative Cloud"
              className="input-field"
            />
            {errors.serviceName && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {errors.serviceName}
              </p>
            )}
          </div>

          {/* Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-dark-text mb-2">
                Cost *
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="input-field"
              />
              {errors.cost && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {errors.cost}
                </p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-dark-text mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="input-field"
              >
                {currencyOptions.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Billing Cycle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-dark-text mb-2">
                Billing Cycle
              </label>
              <select
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
                className="input-field"
              >
                {billingCycleOptions.map((cycle) => (
                  <option key={cycle} value={cycle}>
                    {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-dark-text mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Renewal Date */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-dark-text mb-2">
              Renewal Date *
            </label>
            <input
              type="date"
              name="renewalDate"
              value={formData.renewalDate}
              onChange={handleChange}
              className="input-field"
            />
            {errors.renewalDate && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {errors.renewalDate}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-dark-text mb-2">
              Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-900 dark:text-dark-text">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="paused"
                  checked={formData.status === 'paused'}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-900 dark:text-dark-text">Paused</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-dark-text mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes or details..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {subscription ? 'Update' : 'Add'} Subscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
