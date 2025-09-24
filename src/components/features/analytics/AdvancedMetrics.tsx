import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Clock, Users, Award } from 'lucide-react';
import { AnimatedCard } from '../../ui/AnimatedCard';
import { ProgressRing } from '../../ui/ProgressRing';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import { InteractiveCard } from '../../ui/InteractiveCard';

interface MetricData {
  label: string;
  value: number;
  previousValue: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const AdvancedMetrics: React.FC = () => {
  const metrics: MetricData[] = [
    {
      label: 'Response Rate',
      value: 68,
      previousValue: 45,
      icon: <Target className="w-6 h-6" />,
      color: '#10b981',
      description: 'Percentage of applications that received a response'
    },
    {
      label: 'Interview Rate',
      value: 32,
      previousValue: 28,
      icon: <Users className="w-6 h-6" />,
      color: '#f59e0b',
      description: 'Percentage of applications that led to interviews'
    },
    {
      label: 'Offer Rate',
      value: 18,
      previousValue: 15,
      icon: <Award className="w-6 h-6" />,
      color: '#3b82f6',
      description: 'Percentage of applications that resulted in offers'
    },
    {
      label: 'Avg Response Time',
      value: 5.2,
      previousValue: 7.8,
      icon: <Clock className="w-6 h-6" />,
      color: '#8b5cf6',
      description: 'Average days to receive a response'
    }
  ];

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    }
    return null;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-400';
    if (current < previous) return 'text-red-400';
    return 'text-gray-400';
  };

  const getTrendText = (current: number, previous: number) => {
    const diff = current - previous;
    const percentage = previous > 0 ? ((diff / previous) * 100).toFixed(1) : '0';
    
    if (diff > 0) return `+${percentage}%`;
    if (diff < 0) return `${percentage}%`;
    return '0%';
  };

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <AnimatedCard key={metric.label} delay={index * 0.1} className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: `${metric.color}20`, color: metric.color }}
              >
                {metric.icon}
              </div>
            </div>
            
            <div className="mb-2">
              <AnimatedCounter
                value={metric.value}
                suffix={metric.label.includes('Rate') ? '%' : metric.label.includes('Time') ? ' days' : ''}
                className="text-3xl font-bold text-white"
              />
            </div>
            
            <h3 className="text-sm font-medium text-gray-400 mb-2">{metric.label}</h3>
            
            <div className="flex items-center justify-center space-x-1">
              {getTrendIcon(metric.value, metric.previousValue)}
              <span className={`text-sm font-medium ${getTrendColor(metric.value, metric.previousValue)}`}>
                {getTrendText(metric.value, metric.previousValue)}
              </span>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Rate Breakdown */}
        <InteractiveCard
          title="Response Rate Analysis"
          icon={<Target className="w-5 h-5" />}
          badge="68%"
          expandedContent={
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">This Month</span>
                <span className="text-sm font-medium text-white">68%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Last Month</span>
                <span className="text-sm font-medium text-white">45%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-2 bg-green-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '68%' }}
                  transition={{ delay: 0.5, duration: 1 }}
                />
              </div>
            </div>
          }
        >
          <div className="flex items-center justify-center">
            <ProgressRing
              progress={68}
              size={120}
              color="#10b981"
              className="mb-4"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white">68%</div>
                <div className="text-xs text-gray-400">Response Rate</div>
              </div>
            </ProgressRing>
          </div>
          <p className="text-sm text-gray-400 text-center">
            {metrics[0].description}
          </p>
        </InteractiveCard>

        {/* Interview Pipeline */}
        <InteractiveCard
          title="Interview Pipeline"
          icon={<Users className="w-5 h-5" />}
          badge="4 Active"
          expandedContent={
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-sm text-white">Technical Round</span>
                <span className="text-sm text-green-400">2</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-sm text-white">HR Round</span>
                <span className="text-sm text-yellow-400">1</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-sm text-white">Final Round</span>
                <span className="text-sm text-blue-400">1</span>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Total Interviews</span>
              <AnimatedCounter
                value={4}
                className="text-xl font-bold text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Success Rate</span>
              <span className="text-xl font-bold text-green-400">32%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 bg-yellow-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '32%' }}
                transition={{ delay: 0.7, duration: 1 }}
              />
            </div>
          </div>
        </InteractiveCard>
      </div>
    </div>
  );
};

export default AdvancedMetrics;


