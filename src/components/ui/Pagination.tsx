import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={clsx('flex items-center justify-between', className)}>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={clsx(
            'p-2 rounded-md border border-gray-600',
            currentPage === 1
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-400">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={clsx(
                    'px-3 py-2 rounded-md text-sm font-medium',
                    currentPage === page
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-600'
                  )}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={clsx(
            'p-2 rounded-md border border-gray-600',
            currentPage === totalPages
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="text-sm text-gray-300">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
