/**
 * Enhanced search utilities for better job filtering
 */

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

/**
 * Calculate Levenshtein distance between two strings
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Enhanced search function that supports fuzzy matching
 */
export const fuzzySearch = (
  items: any[],
  searchTerm: string,
  fields: string[],
  threshold: number = 0.3
): any[] => {
  if (!searchTerm.trim()) return items;
  
  const term = searchTerm.toLowerCase().trim();
  
  return items.filter(item => {
    // Exact match (highest priority)
    for (const field of fields) {
      if (item[field] && item[field].toLowerCase().includes(term)) {
        return true;
      }
    }
    
    // Fuzzy match (lower priority)
    for (const field of fields) {
      if (item[field]) {
        const similarity = calculateSimilarity(term, item[field].toLowerCase());
        if (similarity >= threshold) {
          return true;
        }
      }
    }
    
    return false;
  });
};

/**
 * Search jobs with enhanced matching
 */
export const searchJobs = (
  jobs: any[],
  searchTerm: string,
  searchType: 'all' | 'company' | 'position' | 'notes' = 'all'
): any[] => {
  if (!searchTerm.trim()) return jobs;
  
  const term = searchTerm.toLowerCase().trim();
  
  return jobs.filter(job => {
    switch (searchType) {
      case 'company':
        return job.company && job.company.toLowerCase().includes(term);
      case 'position':
        return job.position && job.position.toLowerCase().includes(term);
      case 'notes':
        return (job.notes && job.notes.toLowerCase().includes(term)) ||
               (job.job_description && job.job_description.toLowerCase().includes(term));
      case 'all':
      default:
        return (
          (job.company && job.company.toLowerCase().includes(term)) ||
          (job.position && job.position.toLowerCase().includes(term)) ||
          (job.notes && job.notes.toLowerCase().includes(term)) ||
          (job.job_description && job.job_description.toLowerCase().includes(term))
        );
    }
  });
};

/**
 * Get search suggestions based on existing data
 */
export const getSearchSuggestions = (jobs: any[], field: 'company' | 'position'): string[] => {
  const suggestions = new Set<string>();
  
  jobs.forEach(job => {
    if (job[field]) {
      // Add the full value
      suggestions.add(job[field]);
      
      // Add individual words
      const words = job[field].split(/\s+/).filter((word: string) => word.length > 2);
      words.forEach((word: string) => suggestions.add(word));
    }
  });
  
  return Array.from(suggestions).sort();
};

/**
 * Highlight search terms in text
 */
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};
