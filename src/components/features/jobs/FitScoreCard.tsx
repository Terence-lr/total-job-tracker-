import React, { useState } from 'react';
import { FitScoreResult } from '../../../types/fitScore';
import { analyzeJobFitWithAI } from '../../../services/fitScoreService';
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
      const analysis = await analyzeJobFitWithAI({
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
    <div className="card p-6">
      <div className="flex items-center mb-4">
        <Target className="h-5 w-5 text-var(--accent) mr-2" />
        <h3 className="text-lg font-medium text-var(--text)">Analyze Job Fit</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="job-description" className="form-label">
            Job Description
          </label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here to analyze how well your skills match..."
            className="form-input w-full h-32 resize-none"
            rows={6}
          />
        </div>

        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={isLoading || !jobDescription.trim()}
          className="btn btn-primary w-full cursor-halo disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="mt-6 p-4 bg-var(--panel) border border-var(--border) rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-var(--text)">Analysis Results</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowCompare(!showCompare)}
                  className="btn btn-outline cursor-halo"
                >
                  <GitCompare className="h-4 w-4 mr-2" />
                  {showCompare ? 'Hide' : 'Compare'}
                </button>
                <button
                  onClick={handleCopyToNotes}
                  className="btn btn-secondary cursor-halo"
                >
                  <Copy className="h-4 w-4 mr-2" />
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
                      className="text-gray-300"
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
                  <p className="text-sm font-medium text-var(--text)">Fit Score</p>
                  <p className="text-xs text-var(--muted)">Based on skill alignment</p>
                </div>
              </div>

              {/* Missing Keywords */}
              {result.missingKeywords.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-var(--text) mb-2">Missing Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-var(--elev) text-var(--muted) text-xs rounded-full border border-var(--border)"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <p className="text-sm font-medium text-var(--text) mb-2">Notes</p>
                <p className="text-sm text-var(--muted) leading-relaxed">{result.notes}</p>
              </div>
            </div>

            {/* Skills Compare */}
            {showCompare && (
              <div className="mt-4 pt-4 border-t border-var(--border)">
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
