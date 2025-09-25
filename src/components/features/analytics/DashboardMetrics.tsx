import React from 'react';
import { Briefcase, TrendingUp, Calendar, Target } from 'lucide-react';
import { JobApplication } from '../../../types/job';
import MetricCard from './MetricCard';
import OfferRateCard from './OfferRateCard';

interface DashboardMetricsProps {
  applications: JobApplication[];
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ applications }) => {
  // Calculate metrics
  const totalApplications = applications.length;
  
  const responseRate = applications.length > 0 
    ? Math.round((applications.filter(app => app.status !== 'Applied').length / applications.length) * 100)
    : 0;
  
  const interviewRate = applications.length > 0
    ? Math.round((applications.filter(app => app.status === 'Interview' || app.status === 'Offer').length / applications.length) * 100)
    : 0;

  // Calculate this week's applications
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekApps = applications.filter(app => 
    new Date(app.date_applied) >= oneWeekAgo
  ).length;

  // Calculate trends (simplified - comparing last 30 days vs previous 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const last30Days = applications.filter(app => 
    new Date(app.date_applied) >= thirtyDaysAgo
  ).length;
  
  const previous30Days = applications.filter(app => {
    const date = new Date(app.date_applied);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  }).length;

  const weeklyTrend = previous30Days > 0 
    ? `+${Math.round(((last30Days - previous30Days) / previous30Days) * 100)}%`
    : null;

  const metrics = [
    { 
      label: "Total Applications", 
      value: totalApplications, 
      trend: weeklyTrend,
      icon: <Briefcase className="w-5 h-5" />,
      color: 'blue' as const
    },
    { 
      label: "Response Rate", 
      value: `${responseRate}%`, 
      trend: responseRate > 20 ? "+5%" : null,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'green' as const
    },
    { 
      label: "Interview Rate", 
      value: `${interviewRate}%`, 
      trend: interviewRate > 10 ? "+2%" : null,
      icon: <Target className="w-5 h-5" />,
      color: 'yellow' as const
    },
    { 
      label: "This Week", 
      value: thisWeekApps, 
      trend: null,
      icon: <Calendar className="w-5 h-5" />,
      color: 'blue' as const
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Standard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      
      {/* Offer Rate Card */}
      <OfferRateCard jobs={applications} />
    </div>
  );
};

export default DashboardMetrics;
