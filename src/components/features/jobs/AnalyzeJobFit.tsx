import React, { useState } from 'react';
import { useNotification } from '../../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  BookOpen, 
  Lightbulb, 
  CheckCircle, 
  AlertTriangle, 
  Star,
  BarChart3,
  Clock,
  Zap,
  Award,
  FileText,
  Loader2
} from 'lucide-react';

interface AnalyzeJobFitProps {
  jobDescription: string;
  userSkills: string[];
  onAnalysisComplete: (analysis: any) => void;
}

const AnalyzeJobFit: React.FC<AnalyzeJobFitProps> = ({ 
  jobDescription, 
  userSkills, 
  onAnalysisComplete 
}) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [jobDescInput, setJobDescInput] = useState(jobDescription || '');
  const { showError, showSuccess } = useNotification();

  const handleJobDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation(); // Prevent event bubbling
    setJobDescInput(e.target.value);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Prevent modal closing
    
    if (!jobDescInput.trim()) {
      showError('Job Description Required', 'Please paste the job description to analyze.');
      return;
    }

    setAnalyzing(true);
    try {
      // Enhanced analysis with comprehensive scoring
      const result = await analyzeJobFitEnhanced(jobDescInput, userSkills);
      setAnalysis(result);
      onAnalysisComplete(result);
      showSuccess('Analysis Complete', 'Job fit analysis completed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      showError('Analysis Failed', 'Failed to analyze job fit. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Enhanced job fit analysis with comprehensive scoring
  const analyzeJobFitEnhanced = async (jobDesc: string, skills: string[]) => {
    // Extract and categorize keywords from job description
    const jobText = jobDesc.toLowerCase();
    
    // Technical skills categories
    const techCategories = {
      'Programming Languages': ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'],
      'Frontend': ['react', 'vue', 'angular', 'html', 'css', 'sass', 'scss', 'bootstrap', 'tailwind', 'jquery'],
      'Backend': ['node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'asp.net'],
      'Databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra'],
      'Cloud & DevOps': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd'],
      'Mobile': ['react native', 'flutter', 'ios', 'android', 'xamarin', 'cordova'],
      'Data & AI': ['machine learning', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn'],
      'Tools': ['git', 'github', 'gitlab', 'jira', 'confluence', 'slack', 'figma', 'sketch']
    };

    // Extract job requirements
    const jobKeywords = jobText
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Find matching skills with category analysis
    const matchedSkills: string[] = [];
    const skillCategories: Record<string, any> = {};
    const missingSkills: string[] = [];
    const categoryScores: Record<string, number> = {};

    // Analyze each category
    Object.entries(techCategories).forEach(([category, techSkills]) => {
      const categoryMatches: string[] = [];
      const categoryMissing: string[] = [];

      techSkills.forEach(techSkill => {
        const isInJob = jobKeywords.some(keyword => 
          keyword.includes(techSkill) || techSkill.includes(keyword)
        );
        const userHasSkill = skills.some(userSkill => 
          userSkill.toLowerCase().includes(techSkill) || 
          techSkill.includes(userSkill.toLowerCase())
        );

        if (isInJob && userHasSkill) {
          categoryMatches.push(techSkill);
          matchedSkills.push(techSkill);
        } else if (isInJob && !userHasSkill) {
          categoryMissing.push(techSkill);
          missingSkills.push(techSkill);
        }
      });

      skillCategories[category] = {
        matches: categoryMatches,
        missing: categoryMissing,
        score: categoryMatches.length / Math.max(categoryMatches.length + categoryMissing.length, 1) * 100
      };
      categoryScores[category] = skillCategories[category].score;
    });

    // Calculate overall match score with weighted categories
    const weights = {
      'Programming Languages': 0.25,
      'Frontend': 0.20,
      'Backend': 0.20,
      'Databases': 0.15,
      'Cloud & DevOps': 0.10,
      'Mobile': 0.05,
      'Data & AI': 0.03,
      'Tools': 0.02
    };

    const weightedScore = Object.entries(weights).reduce((total, [category, weight]) => {
      return total + (categoryScores[category] || 0) * weight;
    }, 0);

    const matchScore = Math.round(weightedScore);

    // Generate detailed recommendations
    const recommendations = generateRecommendations(matchScore, skillCategories, missingSkills);
    
    // Calculate experience level match
    const experienceLevel = analyzeExperienceLevel(jobText);
    
    // Generate skill development roadmap
    const skillRoadmap = generateSkillRoadmap(missingSkills, skillCategories);

    return {
      matchScore: Math.min(matchScore, 100),
      matchedSkills: Array.from(new Set(matchedSkills)),
      missingSkills: Array.from(new Set(missingSkills)).slice(0, 10),
      skillCategories,
      recommendations,
      experienceLevel,
      skillRoadmap,
      strengths: getTopStrengths(skillCategories),
      improvements: getTopImprovements(skillCategories)
    };
  };

  // Generate personalized recommendations
  const generateRecommendations = (score: number, categories: any, missingSkills: string[]) => {
    const recommendations: string[] = [];
    
    if (score >= 80) {
      recommendations.push("🎉 Excellent match! You're well-qualified for this position.");
      recommendations.push("💪 Highlight your strongest technical skills in your application.");
    } else if (score >= 60) {
      recommendations.push("👍 Good match! Focus on your transferable skills and relevant experience.");
      recommendations.push("📝 Emphasize projects that demonstrate your technical abilities.");
    } else if (score >= 40) {
      recommendations.push("🤔 Moderate match. Consider if this role aligns with your career goals.");
      recommendations.push("📚 Focus on developing the most critical missing skills.");
    } else {
      recommendations.push("⚠️ Low match. Consider roles that better align with your current skills.");
      recommendations.push("🎯 Develop core skills before applying to similar positions.");
    }

    // Add specific recommendations based on missing skills
    if (missingSkills.length > 0) {
      const topMissing = missingSkills.slice(0, 3);
      recommendations.push(`🔧 Priority skills to develop: ${topMissing.join(', ')}`);
    }

    return recommendations;
  };

  // Analyze experience level requirements
  const analyzeExperienceLevel = (jobText: string) => {
    const experienceKeywords = {
      'entry': ['junior', 'entry-level', 'graduate', 'intern', '0-2 years'],
      'mid': ['mid-level', 'intermediate', '2-5 years', '3-5 years'],
      'senior': ['senior', 'lead', 'principal', '5+ years', '7+ years'],
      'expert': ['expert', 'architect', 'staff', '10+ years', '15+ years']
    };

    for (const [level, keywords] of Object.entries(experienceKeywords)) {
      if (keywords.some(keyword => jobText.includes(keyword))) {
        return level;
      }
    }
    return 'mid'; // Default to mid-level
  };

  // Generate skill development roadmap
  const generateSkillRoadmap = (missingSkills: string[], categories: any) => {
    const roadmap: any[] = [];
    const prioritySkills = missingSkills.slice(0, 5);
    
    prioritySkills.forEach((skill, index) => {
      roadmap.push({
        skill,
        priority: index + 1,
        timeline: getTimelineForSkill(skill),
        resources: getResourcesForSkill(skill)
      });
    });

    return roadmap;
  };

  // Get timeline for skill development
  const getTimelineForSkill = (skill: string) => {
    const quickSkills = ['git', 'html', 'css', 'bootstrap'];
    const mediumSkills = ['javascript', 'react', 'python', 'sql'];
    const longSkills = ['machine learning', 'kubernetes', 'aws', 'docker'];

    if (quickSkills.some(s => skill.toLowerCase().includes(s))) return '1-2 weeks';
    if (mediumSkills.some(s => skill.toLowerCase().includes(s))) return '1-3 months';
    if (longSkills.some(s => skill.toLowerCase().includes(s))) return '3-6 months';
    return '2-4 months';
  };

  // Get learning resources for skill
  const getResourcesForSkill = (skill: string) => {
    const resources = {
      'javascript': ['MDN Web Docs', 'JavaScript.info', 'FreeCodeCamp'],
      'react': ['React Documentation', 'React Tutorial', 'Codecademy'],
      'python': ['Python.org', 'Real Python', 'Automate the Boring Stuff'],
      'aws': ['AWS Documentation', 'AWS Training', 'Cloud Academy'],
      'docker': ['Docker Documentation', 'Docker Tutorial', 'Play with Docker']
    };

    for (const [key, value] of Object.entries(resources)) {
      if (skill.toLowerCase().includes(key)) {
        return value;
      }
    }
    return ['Online Courses', 'Documentation', 'Practice Projects'];
  };

  // Get top strengths
  const getTopStrengths = (categories: any) => {
    return Object.entries(categories)
      .filter(([_, data]: [string, any]) => data.score >= 70)
      .map(([category, _]) => category)
      .slice(0, 3);
  };

  // Get top areas for improvement
  const getTopImprovements = (categories: any) => {
    return Object.entries(categories)
      .filter(([_, data]: [string, any]) => data.score < 50)
      .map(([category, _]) => category)
      .slice(0, 3);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="analyze-job-fit" onClick={(e) => e.stopPropagation()}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Target className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Analyze Job Fit</h3>
            <p className="text-gray-400 text-sm">Get detailed insights on how well you match this position</p>
          </div>
        </div>
        
        {/* Job Description Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Job Description
          </label>
          <textarea
            value={jobDescInput}
            onChange={handleJobDescChange}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            placeholder="Paste the complete job description here to analyze your fit..."
            rows={6}
            className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Analyze Button */}
        <motion.button 
          onClick={handleAnalyze}
          disabled={analyzing || !jobDescInput.trim()}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-500 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
        >
          {analyzing ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing Job Fit...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Analyze Job Fit</span>
            </div>
          )}
        </motion.button>

        {/* Enhanced Analysis Results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Overall Score */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="text-center mb-6">
                  <div className="relative inline-flex items-center justify-center w-24 h-24">
                    <div className={`absolute inset-0 rounded-full ${getScoreBgColor(analysis.matchScore)} opacity-20`}></div>
                    <div className="relative">
                      <span className={`text-4xl font-bold ${getScoreColor(analysis.matchScore)}`}>
                        {analysis.matchScore}%
                      </span>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white mt-4">Overall Match Score</h4>
                  <p className="text-gray-400 text-sm">
                    {analysis.matchScore >= 80 ? 'Excellent Match!' : 
                     analysis.matchScore >= 60 ? 'Good Match' : 
                     analysis.matchScore >= 40 ? 'Moderate Match' : 'Low Match'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                  <motion.div
                    className={`h-3 rounded-full ${getScoreBgColor(analysis.matchScore)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.matchScore}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matched Skills */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <h5 className="text-lg font-semibold text-white">Your Strengths</h5>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                      {analysis.matchedSkills.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matchedSkills.slice(0, 8).map((skill: string, index: number) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium"
                      >
                        {skill}
                      </motion.span>
                    ))}
                    {analysis.matchedSkills.length > 8 && (
                      <span className="text-gray-400 text-sm">
                        +{analysis.matchedSkills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <h5 className="text-lg font-semibold text-white">Skills to Develop</h5>
                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                      {analysis.missingSkills.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSkills.slice(0, 8).map((skill: string, index: number) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm font-medium"
                      >
                        {skill}
                      </motion.span>
                    ))}
                    {analysis.missingSkills.length > 8 && (
                      <span className="text-gray-400 text-sm">
                        +{analysis.missingSkills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              {analysis.skillCategories && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center space-x-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <h5 className="text-lg font-semibold text-white">Skill Category Analysis</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(analysis.skillCategories).map(([category, data]: [string, any]) => (
                      <div key={category} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-300">{category}</span>
                          <span className={`text-sm font-bold ${getScoreColor(data.score)}`}>
                            {Math.round(data.score)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full ${getScoreBgColor(data.score)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${data.score}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-blue-400" />
                  <h5 className="text-lg font-semibold text-white">Recommendations</h5>
                </div>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg"
                    >
                      <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Skill Development Roadmap */}
              {analysis.skillRoadmap && analysis.skillRoadmap.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center space-x-2 mb-4">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    <h5 className="text-lg font-semibold text-white">Skill Development Roadmap</h5>
                  </div>
                  <div className="space-y-4">
                    {analysis.skillRoadmap.map((item: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {item.priority}
                          </div>
                          <div>
                            <h6 className="font-semibold text-white">{item.skill}</h6>
                            <p className="text-gray-400 text-sm">Timeline: {item.timeline}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">Resources:</p>
                          <p className="text-gray-300 text-sm">{item.resources[0]}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AnalyzeJobFit;