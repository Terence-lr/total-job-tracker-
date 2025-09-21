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

// Optional: Enhanced analysis with OpenAI (if API key is available)
export async function analyzeJobFitWithAI(request: FitScoreRequest): Promise<FitScoreResult> {
  const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    // Fallback to deterministic analysis
    return analyzeJobFit(request);
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a career advisor helping analyze job fit. Provide a fit score (0-100), missing keywords, and actionable notes.'
          },
          {
            role: 'user',
            content: `Job Description: ${request.jobDescription}\n\nProfile Skills: ${request.profile.skills.join(', ')}\n\nProfile Summary: ${request.profile.summary || 'Not provided'}`
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    
    // Parse the response (this is a simplified parser)
    const fitScoreMatch = content.match(/fit score[:\s]*(\d+)/i);
    const fitScore = fitScoreMatch ? parseInt(fitScoreMatch[1]) : 50;
    
    const missingKeywordsMatch = content.match(/missing keywords?[:\s]*([^.]+)/i);
    const missingKeywords = missingKeywordsMatch 
      ? missingKeywordsMatch[1].split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0)
      : [];
    
    const notes = content.split('\n').find((line: string) => 
      line.toLowerCase().includes('note') || line.toLowerCase().includes('suggestion')
    ) || content;
    
    return {
      fitScore: Math.min(100, Math.max(0, fitScore)),
      missingKeywords: missingKeywords.slice(0, 10),
      notes: notes.trim()
    };
    
  } catch (error) {
    console.warn('OpenAI analysis failed, falling back to deterministic analysis:', error);
    return analyzeJobFit(request);
  }
}
