import React, { useState } from 'react';

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

  const handleJobDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation(); // Prevent event bubbling
    setJobDescInput(e.target.value);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Prevent modal closing
    
    if (!jobDescInput.trim()) {
      alert('Please paste the job description');
      return;
    }

    setAnalyzing(true);
    try {
      // Simple keyword-based analysis (replace with actual AI analysis)
      const result = await analyzeJobFitSimple(jobDescInput, userSkills);
      setAnalysis(result);
      onAnalysisComplete(result);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze job fit');
    } finally {
      setAnalyzing(false);
    }
  };

  // Simple keyword-based analysis (replace with actual AI)
  const analyzeJobFitSimple = async (jobDesc: string, skills: string[]) => {
    // Extract keywords from job description
    const jobKeywords = jobDesc.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Find matching skills
    const matchedSkills = skills.filter(skill => 
      jobKeywords.some(keyword => 
        skill.toLowerCase().includes(keyword) || 
        keyword.includes(skill.toLowerCase())
      )
    );

    // Find missing skills (common tech skills not in user's skills)
    const commonTechSkills = [
      'javascript', 'react', 'node.js', 'python', 'java', 'sql', 'html', 'css',
      'git', 'mongodb', 'postgresql', 'aws', 'docker', 'kubernetes', 'typescript'
    ];
    
    const missingSkills = commonTechSkills.filter(skill => 
      jobKeywords.some(keyword => keyword.includes(skill)) &&
      !skills.some(userSkill => 
        userSkill.toLowerCase().includes(skill) || 
        skill.includes(userSkill.toLowerCase())
      )
    );

    const matchScore = Math.round((matchedSkills.length / Math.max(jobKeywords.length, 1)) * 100);

    return {
      matchScore: Math.min(matchScore, 100),
      matchedSkills,
      missingSkills,
      recommendations: matchScore >= 70 
        ? "Great match! Your skills align well with this position."
        : matchScore >= 40
        ? "Good potential match. Consider highlighting your transferable skills."
        : "Consider developing the missing skills or finding roles that better match your current skillset."
    };
  };

  return (
    <div className="analyze-job-fit" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-white mb-4">🎯 Analyze Job Fit</h3>
      
      <div className="job-description-input mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Job Description
        </label>
        <textarea
          value={jobDescInput}
          onChange={handleJobDescChange}
          onClick={(e) => e.stopPropagation()} // Prevent modal close on click
          onFocus={(e) => e.stopPropagation()} // Prevent modal close on focus
          placeholder="Paste the job description here to analyze how well your skills match..."
          rows={6}
          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <button 
        onClick={handleAnalyze}
        disabled={analyzing || !jobDescInput.trim()}
        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        type="button" // Important: prevent form submission
      >
        {analyzing ? '🤖 Analyzing...' : '📊 Analyze Fit'}
      </button>

      {analysis && (
        <div className="analysis-results mt-6 p-4 bg-gray-800 rounded-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Match Analysis</h4>
          <div className="match-score mb-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full">
              <span className="text-2xl font-bold text-white">{analysis.matchScore}%</span>
            </div>
          </div>
          
          <div className="analysis-breakdown space-y-4">
            <div className="matched-skills">
              <h5 className="text-sm font-medium text-green-400 mb-2">
                ✅ Your Matching Skills ({analysis.matchedSkills.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {analysis.matchedSkills.map((skill: string, index: number) => (
                  <span key={index} className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="missing-skills">
              <h5 className="text-sm font-medium text-yellow-400 mb-2">
                📚 Skills to Develop ({analysis.missingSkills.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map((skill: string, index: number) => (
                  <span key={index} className="bg-yellow-600 text-white px-2 py-1 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="recommendations">
              <h5 className="text-sm font-medium text-blue-400 mb-2">💡 Recommendations</h5>
              <p className="text-gray-300 text-sm">{analysis.recommendations}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzeJobFit;