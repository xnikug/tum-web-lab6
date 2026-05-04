import React from 'react';
import { ApiTracker } from '../components/ApiTracker';

export const ApiKeysPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          API Keys & Usage
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your API limits and monitor usage across different LLM providers.
        </p>
      </div>

      <div className="max-w-2xl">
        <ApiTracker />
      </div>
    </div>
  );
};
