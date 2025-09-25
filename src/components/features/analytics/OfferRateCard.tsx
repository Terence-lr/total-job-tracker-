import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Target } from 'lucide-react';
import { JobApplication } from '../../../types/job';

interface OfferRateCardProps {
  jobs: JobApplication[];
  className?: string;
}

const OfferRateCard: React.FC<OfferRateCardProps> = ({ jobs, className = '' }) => {
  // Calculate offer rate
  const totalApplications = jobs.length;
  const totalOffers = jobs.filter(job => job.status === 'Offer').length;
  const offerRate = totalApplications > 0 ? (totalOffers / totalApplications) * 100 : 0;
  
  // Calculate interview to offer conversion rate
  const totalInterviews = jobs.filter(job => job.status === 'Interview').length;
  const interviewToOfferRate = totalInterviews > 0 ? (totalOffers / totalInterviews) * 100 : 0;
  
  // Calculate this month's offers
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthOffers = jobs.filter(job => {
    const jobDate = new Date(job.date_applied);
    return job.status === 'Offer' && 
           jobDate.getMonth() === currentMonth && 
           jobDate.getFullYear() === currentYear;
  }).length;

  const getOfferRateColor = (rate: number) => {
    if (rate >= 20) return 'text-green-400';
    if (rate >= 10) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getOfferRateBg = (rate: number) => {
    if (rate >= 20) return 'bg-green-500/20';
    if (rate >= 10) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gray-800 rounded-xl p-6 border border-gray-700 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Award className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Offer Rate</h3>
            <p className="text-sm text-gray-400">Your success metrics</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full ${getOfferRateBg(offerRate)}`}>
          <span className={`text-sm font-semibold ${getOfferRateColor(offerRate)}`}>
            {offerRate.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Overall Offer Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Overall Rate</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">
              {totalOffers} / {totalApplications}
            </div>
            <div className="text-xs text-gray-400">
              {offerRate.toFixed(1)}% success rate
            </div>
          </div>
        </div>

        {/* Interview to Offer Conversion */}
        {totalInterviews > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Interview → Offer</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {totalOffers} / {totalInterviews}
              </div>
              <div className="text-xs text-gray-400">
                {interviewToOfferRate.toFixed(1)}% conversion
              </div>
            </div>
          </div>
        )}

        {/* This Month's Offers */}
        <div className="pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">This Month</span>
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                {thisMonthOffers} offers
              </div>
              <div className="text-xs text-gray-400">
                {new Date().toLocaleDateString('en-US', { month: 'long' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Progress to 20% target</span>
          <span className="text-xs text-gray-400">
            {Math.min(offerRate, 20).toFixed(1)}% / 20%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(offerRate, 20) * 5}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-2 rounded-full ${
              offerRate >= 20 ? 'bg-green-500' : 
              offerRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          />
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
        <p className="text-sm text-gray-300 text-center">
          {offerRate >= 20 ? (
            <span className="text-green-400 font-semibold">
              🎉 Excellent! You're crushing it!
            </span>
          ) : offerRate >= 10 ? (
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

export default OfferRateCard;
