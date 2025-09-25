import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  glow?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  glow = false,
  className = '',
  disabled,
  type,
  onClick
}) => {
  const baseClasses = `
    relative inline-flex items-center justify-center font-medium
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    primary: `
      bg-red-600 hover:bg-red-700 text-white
      focus:ring-red-500 border border-red-600
      ${glow ? 'shadow-lg shadow-red-500/25' : 'shadow-md'}
    `,
    secondary: `
      bg-gray-800 hover:bg-gray-700 text-white
      focus:ring-gray-500 border border-gray-600
      ${glow ? 'shadow-lg shadow-gray-500/25' : 'shadow-md'}
    `,
    outline: `
      bg-transparent hover:bg-gray-800 text-white
      border border-gray-600 hover:border-gray-500
      focus:ring-gray-500
    `,
    ghost: `
      bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white
      focus:ring-gray-500
    `,
    danger: `
      bg-red-600 hover:bg-red-700 text-white
      focus:ring-red-500 border border-red-600
      ${glow ? 'shadow-lg shadow-red-500/25' : 'shadow-md'}
    `,
    success: `
      bg-green-600 hover:bg-green-700 text-white
      focus:ring-green-500 border border-green-600
      ${glow ? 'shadow-lg shadow-green-500/25' : 'shadow-md'}
    `,
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
    xl: 'px-8 py-4 text-lg rounded-xl',
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={isDisabled}
      type={type}
      onClick={onClick}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      
      {!loading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      
      {children}
      
      {!loading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </motion.button>
  );
};

export default Button;