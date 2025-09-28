import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Phone, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { AnimatedCard } from '../ui/AnimatedCard';
import clsx from 'clsx';

interface PipelineStage {
  name: string;
  count: number;
  color: 'blue' | 'yellow' | 'orange' | 'green' | 'red' | 'gray';
  icon: React.ReactNode;
  description: string;
}

const ApplicationPipeline: React.FC = () => {
  const stages: PipelineStage[] = [
    { 
      name: 'Applied', 
      count: 12, 
      color: 'blue',
      icon: <Briefcase className="w-5 h-5" />,
      description: 'Applications submitted'
    },
    { 
      name: 'Screening', 
      count: 8, 
      color: 'yellow',
      icon: <Phone className="w-5 h-5" />,
      description: 'Phone screenings'
    },
    { 
      name: 'Interview', 
      count: 4, 
      color: 'orange',
      icon: <Users className="w-5 h-5" />,
      description: 'Interviews scheduled'
    },
    { 
      name: 'Offer', 
      count: 2, 
      color: 'green',
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'Offers received'
    },
    { 
      name: 'Rejected', 
      count: 3, 
      color: 'red',
      icon: <XCircle className="w-5 h-5" />,
      description: 'Applications rejected'
    },
    { 
      name: 'Withdrawn', 
      count: 1, 
      color: 'gray',
      icon: <Clock className="w-5 h-5" />,
      description: 'Applications withdrawn'
    }
  ];

  const totalApplications = stages.reduce((sum, stage) => sum + stage.count, 0);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500 border-blue-400 text-blue-100';
      case 'yellow':
        return 'bg-yellow-500 border-yellow-400 text-yellow-100';
      case 'orange':
        return 'bg-orange-500 border-orange-400 text-orange-100';
      case 'green':
        return 'bg-green-500 border-green-400 text-green-100';
      case 'red':
        return 'bg-red-500 border-red-400 text-red-100';
      case 'gray':
        return 'bg-gray-500 border-gray-400 text-gray-100';
      default:
        return 'bg-gray-500 border-gray-400 text-gray-100';
    }
  };

  const getGlowColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'shadow-blue-500/30';
      case 'yellow':
        return 'shadow-yellow-500/30';
      case 'orange':
        return 'shadow-orange-500/30';
      case 'green':
        return 'shadow-green-500/30';
      case 'red':
        return 'shadow-red-500/30';
      case 'gray':
        return 'shadow-gray-500/30';
      default:
        return 'shadow-gray-500/30';
    }
  };

  return (
    <AnimatedCard className="w-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Application Pipeline</h3>
        <p className="text-gray-400 text-sm">Track your job search progress through each stage</p>
      </div>

      {/* Pipeline Visualization */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const percentage = totalApplications > 0 ? (stage.count / totalApplications) * 100 : 0;
          
          return (
            <motion.div
              key={stage.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="space-y-2"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={clsx(
                    'p-2 rounded-lg border',
                    getColorClasses(stage.color)
                  )}>
                    {stage.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{stage.name}</h4>
                    <p className="text-sm text-gray-400">{stage.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{stage.count}</div>
                  <div className="text-sm text-gray-400">{percentage.toFixed(1)}%</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={clsx(
                      'h-full rounded-full border-2',
                      getColorClasses(stage.color),
                      getGlowColor(stage.color)
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ 
                      delay: index * 0.1 + 0.3, 
                      duration: 0.8,
                      ease: 'easeOut'
                    }}
                    style={{
                      boxShadow: `0 0 10px ${getGlowColor(stage.color).replace('shadow-', '').replace('/30', '')}`
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 pt-6 border-t border-gray-700"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalApplications}</div>
            <div className="text-sm text-gray-400">Total Applications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {stages.find(s => s.name === 'Offer')?.count || 0}
            </div>
            <div className="text-sm text-gray-400">Offers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {stages.find(s => s.name === 'Interview')?.count || 0}
            </div>
            <div className="text-sm text-gray-400">Interviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {stages.find(s => s.name === 'Rejected')?.count || 0}
            </div>
            <div className="text-sm text-gray-400">Rejected</div>
          </div>
        </div>
      </motion.div>
    </AnimatedCard>
  );
};

export default ApplicationPipeline;




