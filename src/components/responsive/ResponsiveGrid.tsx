import React from 'react';
import clsx from 'clsx';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  className,
  cols = { default: 1, md: 2, xl: 3 }
}) => {
  const gridClasses = clsx(
    'grid gap-4',
    {
      [`grid-cols-${cols.default}`]: cols.default,
      [`sm:grid-cols-${cols.sm}`]: cols.sm,
      [`md:grid-cols-${cols.md}`]: cols.md,
      [`lg:grid-cols-${cols.lg}`]: cols.lg,
      [`xl:grid-cols-${cols.xl}`]: cols.xl,
    },
    className
  );

  return <div className={gridClasses}>{children}</div>;
};

export default ResponsiveGrid;
