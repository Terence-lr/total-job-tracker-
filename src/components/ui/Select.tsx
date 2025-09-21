import React from 'react';
import clsx from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ 
  label, 
  icon, 
  error, 
  helperText, 
  options,
  className,
  id,
  ...props 
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1">
      <label 
        htmlFor={selectId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="w-4 h-4 text-gray-400">
              {icon}
            </div>
          </div>
        )}
        <select
          id={selectId}
          className={clsx(
            'block w-full rounded-md border-gray-300 shadow-sm',
            'focus:border-blue-500 focus:ring-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500',
            icon ? 'pl-10' : 'pl-3',
            'pr-3 py-2 text-sm',
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Select;
