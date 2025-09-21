import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Calendar,
  Activity,
  Award,
  Clock
} from 'lucide-react';
import { AnimatedCard } from '@/ui/AnimatedCard';
import { ProgressRing } from '@/ui/ProgressRing';
import { AnimatedCounter } from '@/ui/AnimatedCounter';
import { InteractiveCard } from '@/ui/InteractiveCard';

interface VelocityData {
  weeklyApplications: number;
  monthlyApplications: number;
  dailyAverage: number;
  targetWeekly: number;
  targetMonthly: number;
  streak: number;
  bestWeek: number;
  momentum: 'increasing' | 'decreasing' | 'stable';
}

interface VelocityMeterProps {
  applications: any[];
}

const VelocityMeter: React.FC<VelocityMeterProps> = ({ applications }) => {
  const [velocityData, setVelocityData] = useState<VelocityData>({
    weeklyApplications: 0,
    monthlyApplications: 0,
    dailyAverage: 0,
    targetWeekly: 10,
    targetMonthly: 40,
    streak: 0,
    bestWeek: 0,
    momentum: 'stable'
  });

  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // Calculate velocity metrics
  const calculateVelocity = (apps: any[]): VelocityData => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter applications by time periods
    const weeklyApps = apps.filter(app => 
      new Date(app.dateApplied) >= oneWeekAgo
    );
    const monthlyApps = apps.filter(app => 
      new Date(app.dateApplied) >= oneMonthAgo
    );

    // Calculate daily average
    const dailyAverage = monthlyApps.length / 30;

    // Calculate streak (consecutive days with applications)
    let streak = 0;
    const sortedApps = apps
      .map(app => new Date(app.dateApplied))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentDate = new Date(now);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const hasAppOnDate = sortedApps.some(appDate => {
        const appDateOnly = new Date(appDate);
        appDateOnly.setHours(0, 0, 0, 0);
        return appDateOnly.getTime() === currentDate.getTime();
      });

      if (hasAppOnDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate best week
    const weeklyGroups: { [key: string]: number } = {};
    monthlyApps.forEach(app => {
      const weekStart = new Date(app.dateApplied);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      weeklyGroups[weekKey] = (weeklyGroups[weekKey] || 0) + 1;
    });

    const bestWeek = Math.max(...Object.values(weeklyGroups), 0);

    // Determine momentum
    const lastWeek = apps.filter(app => {
      const appDate = new Date(app.dateApplied);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      return appDate >= twoWeeksAgo && appDate < oneWeekAgo;
    }).length;

    let momentum: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (weeklyApps.length > lastWeek) {
      momentum = 'increasing';
    } else if (weeklyApps.length < lastWeek) {
      momentum = 'decreasing';
    }

    return {
      weeklyApplications: weeklyApps.length,
      monthlyApplications: monthlyApps.length,
      dailyAverage: Math.round(dailyAverage * 10) / 10,
      targetWeekly: 10,
      targetMonthly: 40,
      streak,
      bestWeek,
      momentum
    };
  };

  useEffect(() => {
    setIsAnalyzing(true);
    
    const timer = setTimeout(() => {
      const calculated = calculateVelocity(applications);
      setVelocityData(calculated);
      setIsAnalyzing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [applications]);

  const weeklyProgress = Math.min(100, (velocityData.weeklyApplications / velocityData.targetWeekly) * 100);
  const monthlyProgress = Math.min(100, (velocityData.monthlyApplications / velocityData.targetMonthly) * 100);

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'increasing': return 'text-green-400';
      case 'decreasing': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'increasing': return <TrendingUp className="w-4 h-4" />;
      case 'decreasing': return <TrendingUp className="w-4 h-4 transform rotate-180" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Velocity Display */}
      <AnimatedCard className="text-center">
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-white">Application Velocity</h3>
            {isAnalyzing && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full"
              />
            )}
          </div>
          <p className="text-gray-400 text-sm">Your job search momentum and consistency</p>
        </div>

        <div className="flex items-center justify-center mb-6">
          <ProgressRing
            progress={weeklyProgress}
            size={150}
            color="#dc2626"
            strokeWidth={8}
          >
            <div className="text-center">
              <AnimatedCounter
                value={velocityData.dailyAverage}
                decimals={1}
                className="text-3xl font-bold text-white"
              />
              <div className="text-sm text-gray-400">apps/day</div>
            </div>
          </ProgressRing>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">
              <AnimatedCounter value={velocityData.weeklyApplications} />
            </div>
            <div className="text-sm text-gray-400">This Week</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              <AnimatedCounter value={velocityData.monthlyApplications} />
            </div>
            <div className="text-sm text-gray-400">This Month</div>
          </div>
        </div>
      </AnimatedCard>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <InteractiveCard
          title="Weekly Target Progress"
          icon={<Target className="w-5 h-5" />}
          badge={`${Math.round(weeklyProgress)}%`}
          expandedContent={
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Target</span>
                <span className="text-sm font-medium text-white">{velocityData.targetWeekly} apps/week</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Current</span>
                <span className="text-sm font-medium text-white">{velocityData.weeklyApplications} apps</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="h-2 bg-red-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyProgress}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">
                  {velocityData.weeklyApplications >= velocityData.targetWeekly ? '🎯 Target Met!' : `${velocityData.targetWeekly - velocityData.weeklyApplications} to go`}
                </div>
              </div>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm font-medium text-white">{Math.round(weeklyProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 bg-red-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${weeklyProgress}%` }}
                transition={{ delay: 0.3, duration: 1 }}
              />
            </div>
          </div>
        </InteractiveCard>

        {/* Momentum & Streak */}
        <InteractiveCard
          title="Momentum & Streak"
          icon={getMomentumIcon(velocityData.momentum)}
          badge={velocityData.streak}
          expandedContent={
            <div className="space-y-4">
              <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-1">🔥 Current Streak</h4>
                <p className="text-sm text-green-300">
                  {velocityData.streak} consecutive days with applications
                </p>
              </div>
              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="font-semibold text-blue-400 mb-1">🏆 Best Week</h4>
                <p className="text-sm text-blue-300">
                  {velocityData.bestWeek} applications in your best week
                </p>
              </div>
              <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <h4 className="font-semibold text-yellow-400 mb-1">📈 Momentum</h4>
                <p className="text-sm text-yellow-300">
                  {velocityData.momentum === 'increasing' && 'Your application rate is increasing!'}
                  {velocityData.momentum === 'decreasing' && 'Consider increasing your application rate'}
                  {velocityData.momentum === 'stable' && 'Maintaining consistent application rate'}
                </p>
              </div>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Streak</span>
              <span className="text-sm font-medium text-green-400">{velocityData.streak} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Momentum</span>
              <span className={`text-sm font-medium ${getMomentumColor(velocityData.momentum)}`}>
                {velocityData.momentum}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Best Week</span>
              <span className="text-sm font-medium text-blue-400">{velocityData.bestWeek} apps</span>
            </div>
          </div>
        </InteractiveCard>
      </div>

      {/* Performance Insights */}
      <AnimatedCard>
        <div className="flex items-center space-x-3 mb-4">
          <Award className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-white">Performance Insights</h3>
        </div>
        <div className="space-y-3">
          {velocityData.dailyAverage >= 2 && (
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-1">🚀 Excellent Velocity</h4>
              <p className="text-sm text-green-300">
                You're applying to {velocityData.dailyAverage} jobs per day. This is above the recommended rate!
              </p>
            </div>
          )}
          {velocityData.dailyAverage >= 1 && velocityData.dailyAverage < 2 && (
            <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <h4 className="font-semibold text-yellow-400 mb-1">⚡ Good Momentum</h4>
              <p className="text-sm text-yellow-300">
                You're applying to {velocityData.dailyAverage} jobs per day. Consider increasing to 2+ for faster results.
              </p>
            </div>
          )}
          {velocityData.dailyAverage < 1 && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-1">📈 Increase Activity</h4>
              <p className="text-sm text-red-300">
                You're applying to {velocityData.dailyAverage} jobs per day. Aim for at least 1-2 applications daily.
              </p>
            </div>
          )}
          {velocityData.streak >= 7 && (
            <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <h4 className="font-semibold text-purple-400 mb-1">🔥 Streak Master</h4>
              <p className="text-sm text-purple-300">
                Amazing! You've maintained a {velocityData.streak}-day streak. Consistency is key to success!
              </p>
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default VelocityMeter;
