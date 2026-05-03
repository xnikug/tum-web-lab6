import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Download } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/subscriptionUtils';

export const ExportButton = () => {
  const { state } = useSubscription();
  const { subscriptions, currency } = state;

  const handleExport = () => {
    // 1. Define CSV headers
    const headers = ['Service Name', 'Category', 'Cost', 'Currency', 'Converted Cost (' + currency + ')', 'Billing Cycle', 'Renewal Date', 'Status', 'Notes'];

    // 2. Map data to rows
    const rows = subscriptions.map(sub => {
      // Basic conversion logic (simplified for export)
      const convertedCost = sub.cost; // In a full app, apply exchange rates here if exporting normalized data
      
      return [
        `"${sub.serviceName.replace(/"/g, '""')}"`,
        `"${sub.category}"`,
        sub.cost,
        sub.currency || 'USD',
        convertedCost,
        sub.billingCycle,
        formatDate(sub.renewalDate),
        sub.status,
        `"${(sub.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    // 3. Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // 4. Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `subscriptions_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      disabled={subscriptions.length === 0}
      className={`btn-secondary flex items-center gap-2 ${subscriptions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
      title="Export to CSV"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Export Data</span>
    </button>
  );
};