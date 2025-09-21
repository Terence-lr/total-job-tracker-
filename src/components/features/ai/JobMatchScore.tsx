import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  MapPin,
  DollarSign,
  Clock
} from 'lucide-react';
import { AnimatedCard } from '@/ui/AnimatedCard';
import { ProgressRing } from '@/ui/ProgressRing';
import { AnimatedCounter } from '@/ui/AnimatedCounter';
import clsx from 'clsx';

interface JobMatchScoreProps {
  job: {
    id: string;
    position: string;
    company: string;
    description: string;
    requirements: string[];
    location: string;
    salary?: string;
    type: string;
  };
  profile: {
    skills: string[];
    experience: string[];
    education: string[];
    location: string;
    salaryExpectation?: string;
    workType: string[];
  };
}

interface MatchInsight {
  category: string;
  score: number;
  description: string;
  positive: boolean;
  icon: React.ReactNode;
}

const JobMatchScore: React.FC<JobMatchScoreProps> = ({ job, profile }) => {
  const [overallScore, setOverallScore] = useState(0);
  const [insights, setInsights] = useState<MatchInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // AI-powered matching algorithm
  const calculateMatch = (job: any, profile: any): { score: number; insights: MatchInsight[] } => {
    const insights: MatchInsight[] = [];
    let totalScore = 0;
    let categoryCount = 0;

    // Skills matching (40% weight)
    const skillMatches = job.requirements.filter((req: string) =>
      profile.skills.some((skill: string) => 
        skill.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(skill.toLowerCase())
      )
    ).length;
    const skillScore = (skillMatches / job.requirements.length) * 100;
    totalScore += skillScore * 0.4;
    categoryCount++;

    insights.push({
      category: 'Skills Match',
      score: skillScore,
      description: `${skillMatches}/${job.requirements.length} required skills match`,
      positive: skillScore > 60,
      icon: <Brain className="w-4 h-4" />
    });

    // Experience matching (25% weight)
    const experienceScore = Math.min(100, profile.experience.length * 20);
    totalScore += experienceScore * 0.25;
    categoryCount++;

    insights.push({
      category: 'Experience Level',
      score: experienceScore,
      description: `${profile.experience.length} years of relevant experience`,
      positive: experienceScore > 50,
      icon: <TrendingUp className="w-4 h-4" />
    });

    // Location matching (15% weight)
    const locationMatch = job.location.toLowerCase().includes(profile.location.toLowerCase()) ||
                         profile.location.toLowerCase().includes(job.location.toLowerCase());
    const locationScore = locationMatch ? 100 : 60; // Remote-friendly default
    totalScore += locationScore * 0.15;
    categoryCount++;

    insights.push({
      category: 'Location',
      score: locationScore,
      description: locationMatch ? 'Location matches perfectly' : 'Remote-friendly or flexible',
      positive: locationScore > 70,
      icon: <MapPin className="w-4 h-4" />
    });

    // Work type matching (10% weight)
    const workTypeMatch = job.type && profile.workType.includes(job.type);
    const workTypeScore = workTypeMatch ? 100 : 75; // Flexible default
    totalScore += workTypeScore * 0.1;
    categoryCount++;

    insights.push({
      category: 'Work Type',
      score: workTypeScore,
      description: workTypeMatch ? 'Work type matches preference' : 'Flexible work arrangement',
      positive: workTypeScore > 80,
      icon: <Users className="w-4 h-4" />
    });

    // Salary matching (10% weight)
    let salaryScore = 80; // Default good score
    if (job.salary && profile.salaryExpectation) {
      const jobSalary = parseInt(job.salary.replace(/[^0-9]/g, ''));
      const expectedSalary = parseInt(profile.salaryExpectation.replace(/[^0-9]/g, ''));
      if (jobSalary >= expectedSalary * 0.9) {
        salaryScore = 100;
      } else if (jobSalary >= expectedSalary * 0.7) {
        salaryScore = 75;
      } else {
        salaryScore = 50;
      }
    }
    totalScore += salaryScore * 0.1;
    categoryCount++;

    insights.push({
      category: 'Salary',
      score: salaryScore,
      description: job.salary ? 'Salary expectations align' : 'Salary not specified',
      positive: salaryScore > 70,
      icon: <DollarSign className="w-4 h-4" />
    });

    return {
      score: Math.round(totalScore),
      insights
    };
  };

  useEffect(() => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    const timer = setTimeout(() => {
      const result = calculateMatch(job, profile);
      setInsights(result.insights);
      
      // Animate score from 0 to calculated value
      let currentScore = 0;
      const increment = result.score / 50; // 50 steps
      const scoreTimer = setInterval(() => {
        currentScore += increment;
        if (currentScore >= result.score) {
          setOverallScore(result.score);
          clearInterval(scoreTimer);
          setIsAnalyzing(false);
        } else {
          setOverallScore(Math.round(currentScore));
        }
      }, 20);
    }, 1500);

    return () => clearTimeout(timer);
  }, [job, profile]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <AnimatedCard className="w-full">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Brain className="w-6 h-6 text-red-500" />
          <h3 className="text-xl font-bold text-white">AI Job Match Analysis</h3>
          {isAnalyzing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full"
            />
          )}
        </div>
        <p className="text-gray-400 text-sm">
          Analyzing compatibility between your profile and this position
        </p>
      </div>

      {/* Overall Score */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <ProgressRing
            progress={overallScore}
            size={150}
            color={getScoreColor(overallScore)}
            strokeWidth={8}
          >
            <div className="text-center">
              <AnimatedCounter
                value={overallScore}
                suffix="%"
                className="text-3xl font-bold text-white"
              />
              <div className="text-sm text-gray-400 mt-1">
                {getScoreLabel(overallScore)}
              </div>
            </div>
          </ProgressRing>
        </div>
      </div>

      {/* Match Insights */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white mb-4">Match Breakdown</h4>
        {insights.map((insight, index) => (
          <motion.div
            key={insight.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={clsx(
              'p-4 rounded-lg border',
              insight.positive
                ? 'bg-green-900/20 border-green-500/30'
                : 'bg-yellow-900/20 border-yellow-500/30'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className={clsx(
                  'p-2 rounded-lg',
                  insight.positive ? 'text-green-400' : 'text-yellow-400'
                )}>
                  {insight.icon}
                </div>
                <h5 className="font-semibold text-white">{insight.category}</h5>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white">
                  {insight.score}%
                </span>
                {insight.positive ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-300">{insight.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg"
      >
        <h5 className="font-semibold text-blue-400 mb-2">💡 AI Recommendations</h5>
        <div className="space-y-2 text-sm text-blue-300">
          {overallScore >= 80 && (
            <p>🎯 This is an excellent match! Apply with confidence and highlight your relevant skills.</p>
          )}
          {overallScore >= 60 && overallScore < 80 && (
            <p>✅ Good match potential. Consider emphasizing your transferable skills in your application.</p>
          )}
          {overallScore >= 40 && overallScore < 60 && (
            <p>⚠️ Fair match. Focus on learning opportunities and growth potential in your cover letter.</p>
          )}
          {overallScore < 40 && (
            <p>📚 Consider this a learning opportunity. Apply if you're interested in the company or role growth.</p>
          )}
        </div>
      </motion.div>

      {/* Job Details Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-6 p-4 bg-gray-800/50 rounded-lg"
      >
        <h5 className="font-semibold text-white mb-3">Position Summary</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Company:</span>
            <span className="text-white ml-2">{job.company}</span>
          </div>
          <div>
            <span className="text-gray-400">Location:</span>
            <span className="text-white ml-2">{job.location}</span>
          </div>
          <div>
            <span className="text-gray-400">Type:</span>
            <span className="text-white ml-2">{job.type}</span>
          </div>
          {job.salary && (
            <div>
              <span className="text-gray-400">Salary:</span>
              <span className="text-white ml-2">{job.salary}</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatedCard>
  );
};

export default JobMatchScore;
