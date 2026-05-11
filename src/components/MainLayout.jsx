import { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { useTheme } from '../hooks/useLocalStorage';
import { Moon, Sun, LayoutDashboard, CreditCard, Bell, Settings, ChevronRight, Menu } from 'lucide-react';
import { ApiConnect } from './ApiConnect';
import { isRenewalSoon } from '../utils/subscriptionUtils';

export const MainLayout = ({ children }) => {
  const { state, dispatch } = useSubscription();
  const upcomingCount = state.subscriptions.filter(
    s => s.status === 'active' && isRenewalSoon(s.renewalDate)
  ).length;
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  const handleCurrencyChange = (currency) => {
    dispatch({ type: 'SET_CURRENCY', payload: currency });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex dark:bg-dark-bg font-sans transition-colors duration-200">
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-md flex items-center justify-center mr-3">
               <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white dark:text-black" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">SubManager</span>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <button onClick={() => window.location.hash = ''} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-900 dark:text-white ${!window.location.hash || window.location.hash === '#/' ? 'bg-gray-100 dark:bg-gray-800/80' : 'hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 transition-colors'}`}>
              <LayoutDashboard className="w-4 h-4 mr-3" />
              Dashboard
            </button>
            <button onClick={() => window.location.hash = '#/api-keys'} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 ${window.location.hash === '#/api-keys' ? 'bg-gray-100 dark:bg-gray-800/80 text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 transition-colors'}`}>
              <CreditCard className="w-4 h-4 mr-3" />
              API Usage
            </button>
            <button onClick={() => window.location.hash = '#/renewals'} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 ${window.location.hash === '#/renewals' ? 'bg-gray-100 dark:bg-gray-800/80 text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 transition-colors'}`}>
              <Bell className="w-4 h-4 mr-3" />
              Alerts & Renewals
              {upcomingCount > 0 && (
                <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {upcomingCount}
                </span>
              )}
            </button>
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            
            <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/50">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Currency</span>
                <select
                  value={state.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="text-xs font-medium bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white cursor-pointer -mr-2"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="MDL">MDL (L)</option>
                </select>
            </div>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 transition-colors"
            >
              {theme === 'light' ? (
                <><Moon className="w-4 h-4 mr-3" /> Dark Mode</>
              ) : (
                <><Sun className="w-4 h-4 mr-3" /> Light Mode</>
              )}
            </button>
            <ApiConnect />
            <a href="#" className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 transition-colors">
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header - Mobile and Breadcrumbs */}
        <header className="bg-white dark:bg-[#111111] h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 sticky top-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <nav className="hidden sm:flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <a href="#" className="font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Workspace</a>
                </li>
                <li>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </li>
                <li>
                  <span className="font-medium text-gray-900 dark:text-white">Dashboard</span>
                </li>
              </ol>
            </nav>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
