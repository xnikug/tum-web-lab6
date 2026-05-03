// Mock currency conversion rates (in a real app, you'd fetch these from an API)
const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  const amountInUSD = amount / (exchangeRates[fromCurrency] || 1);
  return amountInUSD * (exchangeRates[toCurrency] || 1);
};

export const formatCurrency = (amount, currency = 'USD') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

export const calculateMonthlySpend = (subscriptions, currency = 'USD') => {
  return subscriptions
    .filter((sub) => sub.status === 'active')
    .reduce((total, sub) => {
      const convertedAmount =
        sub.billingCycle === 'yearly' ? sub.cost / 12 : sub.cost;
      const amountInTargetCurrency = convertCurrency(sub.cost, sub.currency || 'USD', currency);
      return total + (sub.billingCycle === 'yearly' ? amountInTargetCurrency / 12 : amountInTargetCurrency);
    }, 0);
};

export const calculateAnnualSpend = (subscriptions, currency = 'USD') => {
  return subscriptions
    .filter((sub) => sub.status === 'active')
    .reduce((total, sub) => {
      const amountInTargetCurrency = convertCurrency(sub.cost, sub.currency || 'USD', currency);
      return total + (sub.billingCycle === 'yearly' ? amountInTargetCurrency : amountInTargetCurrency * 12);
    }, 0);
};

export const daysUntilRenewal = (renewalDate) => {
  const today = new Date();
  const renewal = new Date(renewalDate);
  const timeDiff = renewal - today;
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const isRenewalSoon = (renewalDate, days = 30) => {
  const daysLeft = daysUntilRenewal(renewalDate);
  return daysLeft > 0 && daysLeft <= days;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getCategories = (subscriptions) => {
  const categories = new Set(subscriptions.map((sub) => sub.category));
  return Array.from(categories).sort();
};

export const filterSubscriptions = (subscriptions, filters) => {
  return subscriptions.filter((sub) => {
    const statusMatch =
      filters.status === 'all' || sub.status === filters.status;
    const categoryMatch =
      filters.category === 'all' || sub.category === filters.category;
    const searchMatch =
      filters.searchTerm === '' ||
      sub.serviceName.toLowerCase().includes(filters.searchTerm.toLowerCase());

    return statusMatch && categoryMatch && searchMatch;
  });
};
