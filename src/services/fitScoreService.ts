import { FitScoreResult, FitScoreRequest } from '../types/fitScore';

// Simple keyword extraction function
function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
}

// Calculate fit score based on keyword overlap
function calculateFitScore(jobKeywords: string[], profileKeywords: string[]): number {
  if (jobKeywords.length === 0) return 0;
  
  const matchedKeywords = jobKeywords.filter(keyword => 
    profileKeywords.some(profileKeyword => 
      profileKeyword.includes(keyword) || keyword.includes(profileKeyword)
    )
  );
  
  return Math.round((matchedKeywords.length / jobKeywords.length) * 100);
}

// Generate actionable notes
function generateNotes(fitScore: number, missingKeywords: string[]): string {
  if (fitScore >= 80) {
    return "Excellent match! Your skills align well with this role. Highlight your relevant experience in your application.";
  } else if (fitScore >= 60) {
    return "Good match with room for improvement. Consider emphasizing transferable skills and relevant projects.";
  } else if (fitScore >= 40) {
    return "Moderate match. Focus on learning the missing skills or finding ways to demonstrate transferable experience.";
  } else {
    return "Low match. Consider if this role aligns with your career goals, or if you need to develop specific skills first.";
  }
}

export async function analyzeJobFit(request: FitScoreRequest): Promise<FitScoreResult> {
  const { jobDescription, profile } = request;
  
  // Extract keywords from job description
  const jobKeywords = extractKeywords(jobDescription);
  
  // Combine profile skills and summary for keyword extraction
  const profileText = [
    ...profile.skills,
    profile.summary || ''
  ].join(' ').toLowerCase();
  
  const profileKeywords = extractKeywords(profileText);
  
  // Calculate fit score
  const fitScore = calculateFitScore(jobKeywords, profileKeywords);
  
  // Find missing keywords
  const missingKeywords = jobKeywords
    .filter(keyword => 
      !profileKeywords.some(profileKeyword => 
        profileKeyword.includes(keyword) || keyword.includes(profileKeyword)
      )
    )
    .slice(0, 10); // Limit to top 10 missing keywords
  
  // Generate notes
  const notes = generateNotes(fitScore, missingKeywords);
  
  return {
    fitScore,
    missingKeywords,
    notes
  };
}

