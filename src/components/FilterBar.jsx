import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Search, Filter } from 'lucide-react';

export const FilterBar = ({ categories }) => {
  const { state, dispatch } = useSubscription();
  const { filters } = state;

  const handleStatusChange = (value) => {
    dispatch({
      type: 'UPDATE_FILTERS',
      payload: { status: value },
    });
  };

  const handleCategoryChange = (value) => {
    dispatch({
      type: 'UPDATE_FILTERS',
      payload: { category: value },
    });
  };

  const handleSearchChange = (value) => {
    dispatch({
      type: 'UPDATE_FILTERS',
      payload: { searchTerm: value },
    });
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600 dark:text-dark-text-secondary" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="input-field"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="input-field"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
