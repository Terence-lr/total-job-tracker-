import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { JobApplication } from '../../types/job';

interface StatusDistributionProps {
  data: JobApplication[];
}

const StatusDistribution: React.FC<StatusDistributionProps> = ({ data }) => {
  const statusCounts = data.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Applied': '#3B82F6',
      'Interview': '#10B981',
      'Offer': '#F59E0B',
      'Rejected': '#EF4444',
      'Withdrawn': '#6B7280'
    };
    return colors[status] || '#6B7280';
  };

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    color: getStatusColor(status)
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value} applications
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Application Status</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Application Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusDistribution;
