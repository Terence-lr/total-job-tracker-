import React, { useState } from 'react';
import { FitScoreResult } from '../../../types/fitScore';
import { analyzeJobFit } from '../../../services/fitScoreService';
import SkillsCompare from '../SkillsCompare';
import { FileText, Copy, Loader2, Target, AlertCircle, GitCompare } from 'lucide-react';

interface FitScoreCardProps {
  onCopyToNotes: (text: string) => void;
  profile: {
    skills: string[];
    summary?: string;
  };
}

const FitScoreCard: React.FC<FitScoreCardProps> = ({ onCopyToNotes, profile }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<FitScoreResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const analysis = await analyzeJobFit({
        jobDescription,
        profile
      });
      setResult(analysis);
    } catch (err) {
      setError('Failed to analyze job fit. Please try again.');
      console.error('Fit score analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToNotes = () => {
    if (result) {
      const notesText = `Fit Score: ${result.fitScore}%\n\nMissing Keywords: ${result.missingKeywords.join(', ')}\n\nNotes: ${result.notes}`;
      onCopyToNotes(notesText);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Target className="h-5 w-5 text-red-500 mr-2" />
        <h3 className="text-lg font-medium text-white">Analyze Job Fit</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="job-description" className="block text-sm font-medium text-gray-300">
            Job Description
          </label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here to analyze how well your skills match..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent h-32 resize-none"
            rows={6}
          />
        </div>

        {error && (
          <div className="flex items-center p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={isLoading || !jobDescription.trim()}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Analyzing...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <FileText className="h-4 w-4 mr-2" />
              Analyze Fit
            </div>
          )}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-gray-700 border border-gray-600 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
              <h4 className="text-md font-medium text-white">Analysis Results</h4>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => setShowCompare(!showCompare)}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm"
                >
                  <GitCompare className="h-4 w-4 mr-2 inline" />
                  {showCompare ? 'Hide' : 'Compare'}
                </button>
                <button
                  onClick={handleCopyToNotes}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Copy className="h-4 w-4 mr-2 inline" />
                  Copy to Notes
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Fit Score */}
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-400"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={getScoreBgColor(result.fitScore)}
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${result.fitScore}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-bold ${getScoreColor(result.fitScore)}`}>
                      {result.fitScore}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Fit Score</p>
                  <p className="text-xs text-gray-400">Based on skill alignment</p>
                </div>
              </div>

              {/* Missing Keywords */}
              {result.missingKeywords.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-white mb-2">Missing Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full border border-gray-500"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <p className="text-sm font-medium text-white mb-2">Notes</p>
                <p className="text-sm text-gray-300 leading-relaxed">{result.notes}</p>
              </div>
            </div>

            {/* Skills Compare */}
            {showCompare && (
              <div className="mt-4 pt-4 border-t border-gray-600">
                <SkillsCompare 
                  userSkills={profile.skills} 
                  jobKeywords={result.missingKeywords} 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FitScoreCard;
