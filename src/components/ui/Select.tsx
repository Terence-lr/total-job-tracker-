import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  fullWidth?: boolean;
  name?: string;
  id?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  size = 'md',
  variant = 'default',
  fullWidth = false,
  name,
  id,
}) => {
  const baseClasses = `
    appearance-none relative inline-flex items-center justify-between
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-red-500
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    default: `
      bg-gray-800 hover:bg-gray-700 text-white
      border border-gray-600 hover:border-gray-500
    `,
    outline: `
      bg-transparent hover:bg-gray-800 text-white
      border border-gray-600 hover:border-gray-500
    `,
    ghost: `
      bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white
    `,
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
  };

  return (
    <div className={`relative ${className}`}>
      <motion.select
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        name={name}
        id={id}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          pr-8
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className="bg-gray-800 text-white"
          >
            {option.label}
          </option>
        ))}
      </motion.select>
      
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

export default Select;