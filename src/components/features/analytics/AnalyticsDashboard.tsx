import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Users, 
  Award,
  Activity,
  Zap
} from 'lucide-react';
import { AnimatedCard } from '../../ui/AnimatedCard';
import { ProgressRing } from '../../ui/ProgressRing';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import { InteractiveCard } from '../../ui/InteractiveCard';

interface AnalyticsData {
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  avgResponseTime: number;
  totalApplications: number;
  weeklyApplications: number;
  monthlyApplications: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    responseRate: 68,
    interviewRate: 32,
    offerRate: 18,
    avgResponseTime: 5.2,
    totalApplications: 45,
    weeklyApplications: 8,
    monthlyApplications: 23
  });

  // Mock data for charts
  const responseData = [
    { month: 'Jan', rate: 45, applications: 12 },
    { month: 'Feb', rate: 52, applications: 15 },
    { month: 'Mar', rate: 61, applications: 18 },
    { month: 'Apr', rate: 68, applications: 23 },
    { month: 'May', rate: 72, applications: 28 },
    { month: 'Jun', rate: 68, applications: 25 }
  ];

  const applicationVelocity = [
    { week: 'Week 1', applications: 3 },
    { week: 'Week 2', applications: 5 },
    { week: 'Week 3', applications: 7 },
    { week: 'Week 4', applications: 8 },
    { week: 'Week 5', applications: 6 },
    { week: 'Week 6', applications: 9 }
  ];

  const statusDistribution = [
    { name: 'Applied', value: 25, color: '#3b82f6' },
    { name: 'Interview', value: 12, color: '#f59e0b' },
    { name: 'Offer', value: 5, color: '#10b981' },
    { name: 'Rejected', value: 8, color: '#ef4444' },
    { name: 'Withdrawn', value: 3, color: '#6b7280' }
  ];

  const successFunnel = [
    { stage: 'Applications', count: 53, percentage: 100 },
    { stage: 'Responses', count: 36, percentage: 68 },
    { stage: 'Interviews', count: 17, percentage: 32 },
    { stage: 'Offers', count: 5, percentage: 18 }
  ];

  const velocityScore = Math.min(100, (analyticsData.weeklyApplications / 10) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Track your job search performance and insights</p>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Response Rate',
            value: analyticsData.responseRate,
            suffix: '%',
            icon: <Target className="w-6 h-6" />,
            color: '#10b981',
            trend: '+12%'
          },
          {
            label: 'Interview Rate',
            value: analyticsData.interviewRate,
            suffix: '%',
            icon: <Users className="w-6 h-6" />,
            color: '#f59e0b',
            trend: '+8%'
          },
          {
            label: 'Offer Rate',
            value: analyticsData.offerRate,
            suffix: '%',
            icon: <Award className="w-6 h-6" />,
            color: '#3b82f6',
            trend: '+5%'
          },
          {
            label: 'Avg Response Time',
            value: analyticsData.avgResponseTime,
            suffix: ' days',
            icon: <Clock className="w-6 h-6" />,
            color: '#8b5cf6',
            trend: '-2.6 days'
          }
        ].map((metric, index) => (
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
                suffix={metric.suffix}
                className="text-3xl font-bold text-white"
              />
            </div>
            
            <h3 className="text-sm font-medium text-gray-400 mb-2">{metric.label}</h3>
            
            <div className="flex items-center justify-center space-x-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">{metric.trend}</span>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Response Rate Trend */}
        <AnimatedCard delay={0.4}>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Response Rate Trend</h3>
            <p className="text-gray-400 text-sm">Monthly response rate progression</p>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={responseData}>
              <defs>
                <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#dc2626"
                strokeWidth={3}
                fill="url(#responseGradient)"
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#dc2626', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </AnimatedCard>

        {/* Application Velocity */}
        <AnimatedCard delay={0.5}>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Application Velocity</h3>
            <p className="text-gray-400 text-sm">Weekly application momentum</p>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <ProgressRing
              progress={velocityScore}
              size={120}
              color="#dc2626"
              className="mb-4"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {analyticsData.weeklyApplications}
                </div>
                <div className="text-xs text-gray-400">apps/week</div>
              </div>
            </ProgressRing>
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={applicationVelocity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="week" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Bar 
                dataKey="applications" 
                fill="#dc2626"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </AnimatedCard>
      </div>

      {/* Success Funnel */}
      <AnimatedCard delay={0.6}>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Success Funnel</h3>
          <p className="text-gray-400 text-sm">Conversion rates through each stage</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {successFunnel.map((stage, index) => (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="text-center"
            >
              <div className="relative mb-4">
                <div 
                  className="w-full h-16 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{
                    backgroundColor: `rgba(220, 38, 38, ${0.1 + (index * 0.1)})`,
                    border: '2px solid rgba(220, 38, 38, 0.3)'
                  }}
                >
                  {stage.count}
                </div>
                {index < successFunnel.length - 1 && (
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">→</span>
                    </div>
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-white mb-1">{stage.stage}</h4>
              <p className="text-sm text-gray-400">{stage.percentage}%</p>
            </motion.div>
          ))}
        </div>
      </AnimatedCard>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimatedCard delay={0.8}>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Status Distribution</h3>
            <p className="text-gray-400 text-sm">Current application status breakdown</p>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </AnimatedCard>

        {/* Performance Insights */}
        <InteractiveCard
          title="Performance Insights"
          icon={<Activity className="w-5 h-5" />}
          badge="AI Powered"
          expandedContent={
            <div className="space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-2">🎯 Strong Performance</h4>
                <p className="text-sm text-green-300">
                  Your response rate is 23% above the industry average of 45%.
                </p>
              </div>
              <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <h4 className="font-semibold text-yellow-400 mb-2">⚡ Optimization Tip</h4>
                <p className="text-sm text-yellow-300">
                  Consider applying to 2-3 more positions per week to increase your chances.
                </p>
              </div>
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="font-semibold text-blue-400 mb-2">📈 Trend Analysis</h4>
                <p className="text-sm text-blue-300">
                  Your interview rate has improved by 8% this month. Keep up the momentum!
                </p>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Industry Average</span>
              <span className="text-sm font-medium text-white">45%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Your Performance</span>
              <span className="text-sm font-medium text-green-400">68%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 bg-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '68%' }}
                transition={{ delay: 1, duration: 1 }}
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">+23%</div>
              <div className="text-xs text-gray-400">Above Average</div>
            </div>
          </div>
        </InteractiveCard>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
