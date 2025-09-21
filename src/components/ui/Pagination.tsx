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
            'p-2 rounded-md border border-gray-300',
            currentPage === 1
              ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={clsx(
                    'px-3 py-2 rounded-md text-sm font-medium',
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
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
            'p-2 rounded-md border border-gray-300',
            currentPage === totalPages
              ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
