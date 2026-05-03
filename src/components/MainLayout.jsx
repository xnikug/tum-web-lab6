import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { useTheme } from '../hooks/useLocalStorage';
import { Moon, Sun } from 'lucide-react';

export const MainLayout = ({ children }) => {
  const { state, dispatch } = useSubscription();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  const handleCurrencyChange = (currency) => {
    dispatch({ type: 'SET_CURRENCY', payload: currency });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg transition-colors">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-dark-border sticky top-0 bg-white dark:bg-dark-bg z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">$</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text">
                SubManager
              </h1>
              <p className="text-xs text-gray-600 dark:text-dark-text-secondary">
                Subscription Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Currency Selector */}
            <select
              value={state.currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="text-sm border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-dark-text"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="AUD">AUD ($)</option>
              <option value="CAD">CAD ($)</option>
              <option value="CHF">CHF (Fr)</option>
              <option value="CNY">CNY (¥)</option>
              <option value="INR">INR (₹)</option>
            </select>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-gray-300 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-dark-text-secondary" />
              ) : (
                <Sun className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-secondary mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-gray-600 dark:text-dark-text-secondary">
          <p>SaaS Subscription Manager © 2024. Track your subscriptions efficiently.</p>
        </div>
      </footer>
    </div>
  );
};
