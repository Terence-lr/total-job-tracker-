import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  className,
  hover = true,
  padding = 'md',
  shadow = 'md',
  onClick
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={hover ? { 
        y: -4, 
        transition: { duration: 0.2 },
        boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)'
      } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={clsx(
        'signature-card',
        paddingClasses[padding],
        shadowClasses[shadow],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;

