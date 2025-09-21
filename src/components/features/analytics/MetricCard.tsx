import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: string | null;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  trend, 
  icon, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600'
  };

  const isPositiveTrend = trend && !trend.startsWith('-');
  const isNegativeTrend = trend && trend.startsWith('-');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        {icon && (
          <div className={clsx('p-3 rounded-full', colorClasses[color])}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          {isPositiveTrend ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : isNegativeTrend ? (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          ) : null}
          <span className={clsx(
            'text-sm font-medium',
            isPositiveTrend ? 'text-green-600' : 
            isNegativeTrend ? 'text-red-600' : 'text-gray-600'
          )}>
            {trend}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default MetricCard;
