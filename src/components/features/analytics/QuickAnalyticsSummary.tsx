import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { JobApplication } from '../../../types/job';

interface QuickAnalyticsSummaryProps {
  jobs: JobApplication[];
  targetOfferRate?: number;
  className?: string;
}

const QuickAnalyticsSummary: React.FC<QuickAnalyticsSummaryProps> = ({ 
  jobs, 
  targetOfferRate = 20,
  className = '' 
}) => {
  // Calculate key metrics
  const totalApplications = jobs.length;
  const totalOffers = jobs.filter(job => job.status === 'Offer').length;
  const totalInterviews = jobs.filter(job => job.status === 'Interview').length;
  const offerRate = totalApplications > 0 ? (totalOffers / totalApplications) * 100 : 0;
  
  // This month's applications
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthApps = jobs.filter(job => {
    const jobDate = new Date(job.date_applied);
    return jobDate.getMonth() === currentMonth && 
           jobDate.getFullYear() === currentYear;
  }).length;

  // Recent activity (last 7 days) - for future use
  // const sevenDaysAgo = new Date();
  // sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  // const recentApps = jobs.filter(job => 
  //   new Date(job.date_applied) >= sevenDaysAgo
  // ).length;

  const getOfferRateColor = (rate: number) => {
    if (rate >= targetOfferRate) return 'text-green-400';
    if (rate >= targetOfferRate * 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getOfferRateBg = (rate: number) => {
    if (rate >= targetOfferRate) return 'bg-green-500/20';
    if (rate >= targetOfferRate * 0.5) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-gray-800 rounded-xl p-6 border border-gray-700 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Quick Analytics</h3>
        </div>
        <div className={`px-3 py-1 rounded-full ${getOfferRateBg(offerRate)}`}>
          <span className={`text-sm font-semibold ${getOfferRateColor(offerRate)}`}>
            {offerRate.toFixed(1)}% Offer Rate
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">{totalApplications}</div>
          <div className="text-sm text-gray-400">Total Applications</div>
        </div>

        {/* Job Offers */}
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">{totalOffers}</div>
          <div className="text-sm text-gray-400">Job Offers</div>
        </div>

        {/* Interviews */}
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">{totalInterviews}</div>
          <div className="text-sm text-gray-400">Interviews</div>
        </div>

        {/* This Month */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">{thisMonthApps}</div>
          <div className="text-sm text-gray-400">This Month</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Progress to {targetOfferRate}% offer rate</span>
          <span className="text-sm text-gray-400">
            {Math.min(offerRate, targetOfferRate).toFixed(1)}% / {targetOfferRate}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(offerRate, targetOfferRate) * (100 / targetOfferRate)}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-2 rounded-full ${
              offerRate >= targetOfferRate ? 'bg-green-500' : 
              offerRate >= targetOfferRate * 0.5 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          />
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
        <p className="text-sm text-gray-300 text-center">
          {offerRate >= targetOfferRate ? (
            <span className="text-green-400 font-semibold">
              🎉 Excellent! You've reached your target!
            </span>
          ) : offerRate >= targetOfferRate * 0.5 ? (
            <span className="text-yellow-400 font-semibold">
              💪 Great progress! Keep it up!
            </span>
          ) : totalOffers > 0 ? (
            <span className="text-blue-400 font-semibold">
              🚀 You're getting offers! Keep applying!
            </span>
          ) : (
            <span className="text-gray-400">
              🎯 Keep applying! Your first offer is coming!
            </span>
          )}
        </p>
      </div>
    </motion.div>
  );
};

export default QuickAnalyticsSummary;
