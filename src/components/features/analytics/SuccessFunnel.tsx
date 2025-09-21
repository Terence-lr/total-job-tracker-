import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingDown, 
  Users, 
  Target, 
  Award,
  CheckCircle,
  ArrowDown,
  Percent,
  BarChart3
} from 'lucide-react';
import { AnimatedCard } from '../../ui/AnimatedCard';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import { InteractiveCard } from '../../ui/InteractiveCard';
import clsx from 'clsx';

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  description: string;
  conversionRate: number;
}

interface SuccessFunnelProps {
  applications: any[];
}

const SuccessFunnel: React.FC<SuccessFunnelProps> = ({ applications }) => {
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // Calculate funnel data from applications
  const calculateFunnelData = (apps: any[]): FunnelStage[] => {
    const totalApplications = apps.length;
    const responses = apps.filter(app => 
      ['Interview', 'Offer', 'Rejected'].includes(app.status)
    ).length;
    const interviews = apps.filter(app => 
      ['Interview', 'Offer'].includes(app.status)
    ).length;
    const offers = apps.filter(app => app.status === 'Offer').length;

    const stages: FunnelStage[] = [
      {
        stage: 'Applications',
        count: totalApplications,
        percentage: 100,
        color: '#3b82f6',
        icon: <Target className="w-5 h-5" />,
        description: 'Total applications submitted',
        conversionRate: 100
      },
      {
        stage: 'Responses',
        count: responses,
        percentage: totalApplications > 0 ? (responses / totalApplications) * 100 : 0,
        color: '#f59e0b',
        icon: <CheckCircle className="w-5 h-5" />,
        description: 'Applications that received responses',
        conversionRate: totalApplications > 0 ? (responses / totalApplications) * 100 : 0
      },
      {
        stage: 'Interviews',
        count: interviews,
        percentage: totalApplications > 0 ? (interviews / totalApplications) * 100 : 0,
        color: '#8b5cf6',
        icon: <Users className="w-5 h-5" />,
        description: 'Applications that led to interviews',
        conversionRate: responses > 0 ? (interviews / responses) * 100 : 0
      },
      {
        stage: 'Offers',
        count: offers,
        percentage: totalApplications > 0 ? (offers / totalApplications) * 100 : 0,
        color: '#10b981',
        icon: <Award className="w-5 h-5" />,
        description: 'Applications that resulted in offers',
        conversionRate: interviews > 0 ? (offers / interviews) * 100 : 0
      }
    ];

    return stages;
  };

  useEffect(() => {
    setIsAnalyzing(true);
    
    const timer = setTimeout(() => {
      const calculated = calculateFunnelData(applications);
      setFunnelData(calculated);
      setIsAnalyzing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [applications]);

  const getStageWidth = (percentage: number) => {
    return Math.max(20, percentage); // Minimum 20% width for visibility
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 70) return 'text-green-400';
    if (rate >= 50) return 'text-yellow-400';
    if (rate >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getConversionLabel = (rate: number) => {
    if (rate >= 70) return 'Excellent';
    if (rate >= 50) return 'Good';
    if (rate >= 30) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-white">Success Funnel</h2>
        </div>
        <p className="text-gray-400">Track your conversion rates through each stage</p>
      </div>

      {/* Funnel Visualization */}
      <AnimatedCard>
        <div className="space-y-6">
          {funnelData.map((stage, index) => (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              {/* Stage Card */}
              <div
                className="relative overflow-hidden rounded-lg border-2 transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: `${stage.color}20`,
                  borderColor: `${stage.color}40`,
                  width: `${getStageWidth(stage.percentage)}%`,
                  marginLeft: `${(100 - getStageWidth(stage.percentage)) / 2}%`
                }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${stage.color}40`, color: stage.color }}
                      >
                        {stage.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{stage.stage}</h3>
                        <p className="text-sm text-gray-400">{stage.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        <AnimatedCounter value={stage.count} />
                      </div>
                      <div className="text-sm text-gray-400">
                        {stage.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: stage.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.percentage}%` }}
                      transition={{ delay: index * 0.2 + 0.5, duration: 1 }}
                    />
                  </div>

                  {/* Conversion Rate */}
                  {index > 0 && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-400">Conversion Rate:</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getConversionColor(stage.conversionRate)}`}>
                          {stage.conversionRate.toFixed(1)}%
                        </span>
                        <span className={`text-xs ${getConversionColor(stage.conversionRate)}`}>
                          ({getConversionLabel(stage.conversionRate)})
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Glow Effect */}
                <div 
                  className="absolute inset-0 rounded-lg opacity-20 blur-sm"
                  style={{ backgroundColor: stage.color }}
                />
              </div>

              {/* Arrow to next stage */}
              {index < funnelData.length - 1 && (
                <div className="flex justify-center my-4">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 + 0.3 }}
                    className="p-2 bg-gray-700 rounded-full"
                  >
                    <ArrowDown className="w-4 h-4 text-gray-400" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </AnimatedCard>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Rates */}
        <InteractiveCard
          title="Conversion Analysis"
          icon={<Percent className="w-5 h-5" />}
          badge="Detailed"
          expandedContent={
            <div className="space-y-4">
              {funnelData.slice(1).map((stage, index) => (
                <div key={stage.stage} className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{stage.stage}</span>
                    <span className={`text-sm font-bold ${getConversionColor(stage.conversionRate)}`}>
                      {stage.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full`}
                      style={{ backgroundColor: stage.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.conversionRate}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-3">
            {funnelData.slice(1).map((stage, index) => (
              <div key={stage.stage} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{stage.stage}</span>
                <span className={`text-sm font-medium ${getConversionColor(stage.conversionRate)}`}>
                  {stage.conversionRate.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </InteractiveCard>

        {/* Performance Insights */}
        <InteractiveCard
          title="Performance Insights"
          icon={<TrendingDown className="w-5 h-5" />}
          badge="AI Analysis"
          expandedContent={
            <div className="space-y-4">
              {funnelData[1] && funnelData[1].conversionRate >= 60 && (
                <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-1">🎯 Strong Response Rate</h4>
                  <p className="text-sm text-green-300">
                    Your {funnelData[1].conversionRate.toFixed(1)}% response rate is excellent!
                  </p>
                </div>
              )}
              {funnelData[2] && funnelData[2].conversionRate >= 50 && (
                <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-1">💼 Interview Success</h4>
                  <p className="text-sm text-blue-300">
                    {funnelData[2].conversionRate.toFixed(1)}% of responses lead to interviews.
                  </p>
                </div>
              )}
              {funnelData[3] && funnelData[3].conversionRate >= 30 && (
                <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-1">🏆 Offer Conversion</h4>
                  <p className="text-sm text-purple-300">
                    {funnelData[3].conversionRate.toFixed(1)}% of interviews result in offers.
                  </p>
                </div>
              )}
              <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <h4 className="font-semibold text-yellow-400 mb-1">📈 Optimization Tips</h4>
                <p className="text-sm text-yellow-300">
                  Focus on improving your weakest conversion stage for maximum impact.
                </p>
              </div>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {funnelData.length > 0 ? funnelData[funnelData.length - 1].count : 0}
              </div>
              <div className="text-sm text-gray-400">Total Offers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {funnelData.length > 0 ? funnelData[funnelData.length - 1].percentage.toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-400">Overall Success Rate</div>
            </div>
          </div>
        </InteractiveCard>
      </div>

      {/* Industry Benchmarks */}
      <AnimatedCard>
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-white">Industry Benchmarks</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Industry Average</div>
            <div className="text-2xl font-bold text-white">45%</div>
            <div className="text-xs text-gray-500">Response Rate</div>
          </div>
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Your Performance</div>
            <div className="text-2xl font-bold text-green-400">
              {funnelData[1] ? funnelData[1].conversionRate.toFixed(0) : 0}%
            </div>
            <div className="text-xs text-gray-500">Response Rate</div>
          </div>
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Performance vs Industry</div>
            <div className="text-2xl font-bold text-blue-400">
              {funnelData[1] ? `+${(funnelData[1].conversionRate - 45).toFixed(0)}%` : '+0%'}
            </div>
            <div className="text-xs text-gray-500">Above Average</div>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default SuccessFunnel;
