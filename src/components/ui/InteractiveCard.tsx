import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

interface InteractiveCardProps {
  title: string;
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  onClick?: () => void;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  title,
  children,
  expandedContent,
  defaultExpanded = false,
  className,
  icon,
  badge,
  onClick
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = () => {
    if (expandedContent) {
      setIsExpanded(!isExpanded);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      className={clsx(
        'signature-card overflow-hidden',
        className
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <motion.div
        className={clsx(
          'flex items-center justify-between p-6 cursor-pointer',
          expandedContent && 'border-b border-gray-700'
        )}
        onClick={handleToggle}
        animate={{
          backgroundColor: isHovered ? 'rgba(220, 38, 38, 0.05)' : 'transparent'
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="text-red-500">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {badge && (
            <span className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded-full">
              {badge}
            </span>
          )}
        </div>
        
        {expandedContent && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="p-6">
        {children}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && expandedContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-gray-700"
          >
            <div className="p-6">
              {expandedContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InteractiveCard;

