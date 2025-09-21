import React, { useState } from 'react';
import { JobFilters as JobFiltersType, JobStatus } from '../../types/job';
import { Search, Filter, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
  onClearFilters: () => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({ filters, onFiltersChange, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusOptions: JobStatus[] = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      status: e.target.value as JobStatus || undefined
    });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      dateFrom: e.target.value || undefined
    });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      dateTo: e.target.value || undefined
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.dateFrom || filters.dateTo;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-var(--accent) hover:text-var(--accent-2) min-h-[44px] px-2 cursor-halo"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden p-2 text-var(--muted) hover:text-var(--text) min-h-[44px] min-w-[44px] flex items-center justify-center cursor-halo"
            aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={`filters-grid ${isExpanded ? 'block' : 'hidden md:grid'}`}>
        {/* Search */}
        <div>
          <label htmlFor="search" className="form-label">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-var(--muted)" />
            </div>
            <input
              type="text"
              id="search"
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="form-input w-full pl-10"
              placeholder="Company, position, notes..."
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="form-label">
            Status
          </label>
          <select
            id="status"
            value={filters.status || ''}
            onChange={handleStatusChange}
            className="form-input w-full"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label htmlFor="dateFrom" className="form-label">
            From Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-var(--muted)" />
            </div>
            <input
              type="date"
              id="dateFrom"
              value={filters.dateFrom || ''}
              onChange={handleDateFromChange}
              className="form-input w-full pl-10"
            />
          </div>
        </div>

        {/* Date To */}
        <div>
          <label htmlFor="dateTo" className="form-label">
            To Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-var(--muted)" />
            </div>
            <input
              type="date"
              id="dateTo"
              value={filters.dateTo || ''}
              onChange={handleDateToChange}
              className="form-input w-full pl-10"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-var(--border)">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-var(--muted)">Active filters:</span>
            {filters.search && (
              <span className="status-pill status-applied">
                Search: "{filters.search}"
              </span>
            )}
            {filters.status && (
              <span className="status-pill status-interview">
                Status: {filters.status}
              </span>
            )}
            {filters.dateFrom && (
              <span className="status-pill status-offer">
                From: {new Date(filters.dateFrom).toLocaleDateString()}
              </span>
            )}
            {filters.dateTo && (
              <span className="status-pill status-offer">
                To: {new Date(filters.dateTo).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Mobile Quick Filter Toggle */}
      {!isExpanded && (
        <div className="md:hidden mt-4 pt-4 border-t border-var(--border)">
          <button
            onClick={() => setIsExpanded(true)}
            className="btn btn-secondary w-full cursor-halo"
          >
            <Filter className="h-4 w-4 mr-2" />
            {hasActiveFilters ? 'View Active Filters' : 'Show Filters'}
          </button>
        </div>
      )}
    </div>
  );
};

export default JobFilters;
