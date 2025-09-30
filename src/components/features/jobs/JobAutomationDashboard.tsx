import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Link, 
  Mail, 
  Upload, 
  Zap, 
  Globe, 
  FileText, 
  Calendar,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Bot,
  Database
} from 'lucide-react';
import JobUrlExtractor from './JobUrlExtractor';
import EmailJobExtractor from './EmailJobExtractor';
import { CreateJobApplication } from '../../../types/job';

interface JobAutomationDashboardProps {
  onJobExtracted: (jobData: CreateJobApplication) => void;
  onClose: () => void;
}

const JobAutomationDashboard: React.FC<JobAutomationDashboardProps> = ({ 
  onJobExtracted, 
  onClose 
}) => {
  const [activeExtractor, setActiveExtractor] = useState<'url' | 'email' | null>(null);

  const automationOptions = [
    {
      id: 'url',
      title: 'Extract from URL',
      description: 'Paste a job posting URL and automatically extract all details',
      icon: Link,
      color: 'blue',
      features: [
        'Works with LinkedIn, Indeed, Glassdoor',
        'Automatic field detection',
        'High accuracy extraction',
        'Preview before adding'
      ]
    },
    {
      id: 'email',
      title: 'Extract from Email',
      description: 'Paste email content to extract job information',
      icon: Mail,
      color: 'purple',
      features: [
        'Works with any email content',
        'AI-powered extraction',
        'Handles job postings & confirmations',
        'Smart pattern recognition'
      ]
    },
    {
      id: 'bulk',
      title: 'Bulk Import',
      description: 'Upload multiple job applications at once',
      icon: Upload,
      color: 'green',
      features: [
        'CSV/Excel file support',
        'Batch processing',
        'Data validation',
        'Error reporting'
      ],
      comingSoon: true
    },
    {
      id: 'integrations',
      title: 'Platform Integrations',
      description: 'Connect with job boards and ATS systems',
      icon: Globe,
      color: 'orange',
      features: [
        'LinkedIn API integration',
        'Indeed job alerts',
        'ATS synchronization',
        'Real-time updates'
      ],
      comingSoon: true
    }
  ];

  const handleExtractorClose = () => {
    setActiveExtractor(null);
  };

  const handleJobExtracted = (jobData: CreateJobApplication) => {
    onJobExtracted(jobData);
    setActiveExtractor(null);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (activeExtractor === 'url') {
    return <JobUrlExtractor onJobExtracted={handleJobExtracted} onClose={handleExtractorClose} />;
  }

  if (activeExtractor === 'email') {
    return <EmailJobExtractor onJobExtracted={handleJobExtracted} onClose={handleExtractorClose} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Job Automation</h2>
                <p className="text-gray-400">Automatically extract and add job applications with AI-powered tools</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-gray-400 text-2xl">×</span>
            </button>
          </div>

          {/* Automation Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {automationOptions.map((option) => {
              const Icon = option.icon;
              const colorClasses = getColorClasses(option.color);
              
              return (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                    option.comingSoon 
                      ? 'bg-gray-800/50 border-gray-600 cursor-not-allowed opacity-60' 
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600 cursor-pointer'
                  }`}
                  onClick={() => !option.comingSoon && setActiveExtractor(option.id as 'url' | 'email')}
                >
                  {option.comingSoon && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                        Coming Soon
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${colorClasses}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {option.title}
                      </h3>
                      <p className="text-gray-400 mb-4">
                        {option.description}
                      </p>
                      
                      <ul className="space-y-2">
                        {option.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {!option.comingSoon && (
                        <div className="mt-4 flex items-center text-sm text-blue-400">
                          <span>Click to start</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* AI-Powered Features */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">AI-Powered Features</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300">Smart field detection</span>
              </div>
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Pattern recognition</span>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">Content analysis</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">95%</div>
              <div className="text-sm text-gray-400">Extraction Accuracy</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">5+</div>
              <div className="text-sm text-gray-400">Supported Platforms</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">10s</div>
              <div className="text-sm text-gray-400">Average Processing Time</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JobAutomationDashboard;

