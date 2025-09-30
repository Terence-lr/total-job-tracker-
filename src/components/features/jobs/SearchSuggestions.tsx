import React, { useState, useEffect } from 'react';
import { Search, Building, Briefcase, FileText } from 'lucide-react';
import { getSearchSuggestions } from '../../../utils/searchUtils';
import { JobApplication } from '../../../types/job';

interface SearchSuggestionsProps {
  jobs: JobApplication[];
  searchType: 'all' | 'company' | 'position' | 'notes';
  onSuggestionClick: (suggestion: string) => void;
  isVisible: boolean;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  jobs,
  searchType,
  onSuggestionClick,
  isVisible
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (searchType === 'company') {
      setSuggestions(getSearchSuggestions(jobs, 'company'));
    } else if (searchType === 'position') {
      setSuggestions(getSearchSuggestions(jobs, 'position'));
    } else {
      // For 'all' and 'notes', combine suggestions
      const companySuggestions = getSearchSuggestions(jobs, 'company');
      const positionSuggestions = getSearchSuggestions(jobs, 'position');
      setSuggestions([...companySuggestions, ...positionSuggestions]);
    }
  }, [jobs, searchType]);

  if (!isVisible || suggestions.length === 0) return null;

  const getIcon = () => {
    switch (searchType) {
      case 'company':
        return <Building className="w-4 h-4" />;
      case 'position':
        return <Briefcase className="w-4 h-4" />;
      case 'notes':
        return <FileText className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      <div className="p-2">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          {getIcon()}
          <span>Suggestions</span>
        </div>
        <div className="space-y-1">
          {suggestions.slice(0, 10).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchSuggestions;

