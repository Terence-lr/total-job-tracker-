import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Building, Target, Calendar, Activity } from 'lucide-react';

interface AnalyticsData {
  applicationTrend: Array<{
    date: string;
    applications: number;
  }>;
  statusDistribution: Array<{
    status: string;
    value: number;
    color: string;
  }>;
  topCompanies: Array<{
    company: string;
    applications: number;
  }>;
  responseRate: number;
  activityHeatmap: Array<{
    date: string;
    applications: number;
    intensity: number;
  }>;
}

interface AnalyticsDashboardProps {
  data?: AnalyticsData;
  isLoading?: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  data, 
  isLoading = false 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock data for demonstration
  const mockData: AnalyticsData = {
    applicationTrend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      applications: Math.floor(Math.random() * 10) + 1
    })),
    statusDistribution: [
      { status: 'Applied', value: 45, color: '#3B82F6' },
      { status: 'Interview', value: 20, color: '#F59E0B' },
      { status: 'Offer', value: 8, color: '#10B981' },
      { status: 'Rejected', value: 27, color: '#EF4444' }
    ],
    topCompanies: [
      { company: 'Google', applications: 12 },
      { company: 'Microsoft', applications: 8 },
      { company: 'Amazon', applications: 6 },
      { company: 'Meta', applications: 5 },
      { company: 'Apple', applications: 4 }
    ],
    responseRate: 68,
    activityHeatmap: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      applications: Math.floor(Math.random() * 8),
      intensity: Math.random()
    }))
  };

  const chartData = data || mockData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-700 rounded mb-4"></div>
      <div className="h-64 bg-gray-700 rounded"></div>
    </div>
  );

  const ChartCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ 
    title, 
    icon, 
    children 
  }) => (
    <motion.div
      className="bg-gray-900 border border-gray-700 rounded-lg p-6"
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex items-center mb-4">
        <div className="text-red-500 mr-3">{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {isLoading ? <LoadingSkeleton /> : children}
    </motion.div>
  );

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <LoadingSkeleton />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Application Trend Line Chart */}
      <ChartCard
        title="Application Trend"
        icon={<TrendingUp className="w-5 h-5" />}
      >
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData.applicationTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111111',
                border: '1px solid #2D2D2D',
                borderRadius: '8px',
                color: '#FFFFFF'
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Line
              type="monotone"
              dataKey="applications"
              stroke="#DC2626"
              strokeWidth={3}
              dot={{ fill: '#DC2626', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#DC2626', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Status Distribution Pie Chart */}
      <ChartCard
        title="Status Distribution"
        icon={<PieIcon className="w-5 h-5" />}
      >
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData.statusDistribution}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
            >
              {chartData.statusDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#111111',
                border: '1px solid #2D2D2D',
                borderRadius: '8px',
                color: '#FFFFFF'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Top Companies Bar Chart */}
      <ChartCard
        title="Top Companies"
        icon={<Building className="w-5 h-5" />}
      >
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData.topCompanies} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
            <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
            <YAxis 
              dataKey="company" 
              type="category" 
              stroke="#9CA3AF" 
              fontSize={12}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111111',
                border: '1px solid #2D2D2D',
                borderRadius: '8px',
                color: '#FFFFFF'
              }}
            />
            <Bar dataKey="applications" fill="#DC2626" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Response Rate Gauge */}
      <ChartCard
        title="Response Rate"
        icon={<Target className="w-5 h-5" />}
      >
        <div className="flex items-center justify-center h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              data={[{ value: chartData.responseRate, fill: '#DC2626' }]}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                fill="#DC2626"
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-3xl font-bold fill-white"
              >
                {chartData.responseRate}%
              </text>
              <text
                x="50%"
                y="60%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm fill-gray-400"
              >
                Response Rate
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Activity Heatmap */}
      <ChartCard
        title="Activity Heatmap"
        icon={<Calendar className="w-5 h-5" />}
      >
        <div className="grid grid-cols-7 gap-1">
          {chartData.activityHeatmap.map((day, index) => (
            <div
              key={index}
              className="aspect-square rounded-sm flex items-center justify-center text-xs"
              style={{
                backgroundColor: `rgba(220, 38, 38, ${day.intensity * 0.8 + 0.2})`,
                border: '1px solid #2D2D2D'
              }}
              title={`${day.date}: ${day.applications} applications`}
            >
              {day.applications > 0 && (
                <span className="text-white font-medium">{day.applications}</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-400 text-center">
          Last 30 days activity
        </div>
      </ChartCard>

      {/* Summary Stats */}
      <ChartCard
        title="Quick Stats"
        icon={<Activity className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Applications</span>
            <span className="text-white font-semibold">
              {chartData.applicationTrend.reduce((sum, day) => sum + day.applications, 0)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Avg. Daily</span>
            <span className="text-white font-semibold">
              {Math.round(chartData.applicationTrend.reduce((sum, day) => sum + day.applications, 0) / 30)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Active Days</span>
            <span className="text-white font-semibold">
              {chartData.activityHeatmap.filter(day => day.applications > 0).length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Best Day</span>
            <span className="text-white font-semibold">
              {Math.max(...chartData.applicationTrend.map(day => day.applications))}
            </span>
          </div>
        </div>
      </ChartCard>
    </motion.div>
  );
};

export default AnalyticsDashboard;
