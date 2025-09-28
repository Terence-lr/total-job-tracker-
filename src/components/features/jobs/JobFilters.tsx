import React, { useState } from 'react';
import { JobFilters as JobFiltersType, JobStatus, JobApplication } from '../../../types/job';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import SearchSuggestions from './SearchSuggestions';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
  onClearFilters: () => void;
  jobs?: JobApplication[];
}

const JobFilters: React.FC<JobFiltersProps> = ({ filters, onFiltersChange, onClearFilters, jobs = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'company' | 'position' | 'notes'>('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const statusOptions: JobStatus[] = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value
    });
  };

  const handleCompanySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      companySearch: e.target.value
    });
  };

  const handlePositionSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      positionSearch: e.target.value
    });
  };

  const handleSearchTypeChange = (type: 'all' | 'company' | 'position' | 'notes') => {
    setSearchType(type);
    // Clear search when switching types
    onFiltersChange({
      ...filters,
      search: '',
      companySearch: '',
      positionSearch: ''
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (searchType === 'company') {
      onFiltersChange({ ...filters, companySearch: suggestion });
    } else if (searchType === 'position') {
      onFiltersChange({ ...filters, positionSearch: suggestion });
    } else {
      onFiltersChange({ ...filters, search: suggestion });
    }
    setShowSuggestions(false);
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

  const hasActiveFilters = filters.search || filters.companySearch || filters.positionSearch || filters.status || filters.dateFrom || filters.dateTo;

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
        {/* Enhanced Search */}
        <div className="form-group">
          <label htmlFor="search">Search</label>
          <div className="input relative">
            <span className="input__icon">🔎</span>
            <input
              type="text"
              id="search"
              value={filters.search || ''}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search all fields..."
            />
            {jobs.length > 0 && (
              <SearchSuggestions
                jobs={jobs}
                searchType={searchType}
                onSuggestionClick={handleSuggestionClick}
                isVisible={showSuggestions && searchType === 'all'}
              />
            )}
          </div>
        </div>

        {/* Search Type Selector */}
        <div className="form-group">
          <label htmlFor="searchType">Search Type</label>
          <div className="input">
            <span className="input__icon">🎯</span>
            <select
              id="searchType"
              value={searchType}
              onChange={(e) => handleSearchTypeChange(e.target.value as any)}
            >
              <option value="all">All Fields</option>
              <option value="company">Company Only</option>
              <option value="position">Position Only</option>
              <option value="notes">Notes Only</option>
            </select>
          </div>
        </div>

        {/* Company Search */}
        {searchType === 'company' && (
          <div className="form-group">
            <label htmlFor="companySearch">Company Search</label>
            <div className="input">
              <span className="input__icon">🏢</span>
              <input
                type="text"
                id="companySearch"
                value={filters.companySearch || ''}
                onChange={handleCompanySearchChange}
                placeholder="Search companies..."
              />
            </div>
          </div>
        )}

        {/* Position Search */}
        {searchType === 'position' && (
          <div className="form-group">
            <label htmlFor="positionSearch">Position Search</label>
            <div className="input">
              <span className="input__icon">💼</span>
              <input
                type="text"
                id="positionSearch"
                value={filters.positionSearch || ''}
                onChange={handlePositionSearchChange}
                placeholder="Search positions..."
              />
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <div className="input">
            <span className="input__icon">📊</span>
            <select
              id="status"
              value={filters.status || ''}
              onChange={handleStatusChange}
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date From */}
        <div className="form-group">
          <label htmlFor="dateFrom">From Date</label>
          <div className="input">
            <span className="input__icon">📅</span>
            <input
              type="date"
              id="dateFrom"
              value={filters.dateFrom || ''}
              onChange={handleDateFromChange}
            />
          </div>
        </div>

        {/* Date To */}
        <div className="form-group">
          <label htmlFor="dateTo">To Date</label>
          <div className="input">
            <span className="input__icon">📅</span>
            <input
              type="date"
              id="dateTo"
              value={filters.dateTo || ''}
              onChange={handleDateToChange}
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
            {filters.companySearch && (
              <span className="status-pill status-interview">
                Company: "{filters.companySearch}"
              </span>
            )}
            {filters.positionSearch && (
              <span className="status-pill status-offer">
                Position: "{filters.positionSearch}"
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
