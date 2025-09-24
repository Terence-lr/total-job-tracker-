import React from 'react';
import clsx from 'clsx';
import { JOB_STATUS } from '../../lib/constants';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

// Job Status Badge Component
interface JobStatusBadgeProps {
  status: keyof typeof JOB_STATUS;
  size?: 'sm' | 'md' | 'lg';
}

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const statusConfig = JOB_STATUS[status];
  
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-0.5 text-sm',
        size === 'lg' && 'px-3 py-1 text-sm'
      )}
      style={{
        backgroundColor: statusConfig.bgColor,
        color: statusConfig.textColor,
      }}
    >
      {statusConfig.label}
    </span>
  );
};

export default Badge;


