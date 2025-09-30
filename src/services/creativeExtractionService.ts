/**
 * Creative Extraction Service
 * Uses our secure serverless function for maximum reliability
 */

import { CreateJobApplication } from '../types/job';
import { extractJobFromURL, ExtractedJobData } from '../utils/jobExtractor';

export interface CreativeExtractionResult {
  success: boolean;
  data?: Partial<CreateJobApplication>;
  confidence?: number;
  error?: string;
  insights?: {
    strategies: string[];
    consensus: boolean;
    recommendations: string[];
    fieldConfidence: Record<string, number>;
  };
}

export class CreativeExtractionService {
  private static instance: CreativeExtractionService;

  static getInstance(): CreativeExtractionService {
    if (!CreativeExtractionService.instance) {
      CreativeExtractionService.instance = new CreativeExtractionService();
    }
    return CreativeExtractionService.instance;
  }

  /**
   * Extract job data using our secure serverless function
   */
  async extractJobData(url: string): Promise<CreativeExtractionResult> {
    console.log('🎯 Starting serverless extraction for:', url);

    try {
      // Use our new serverless API for maximum reliability
      const result: ExtractedJobData = await extractJobFromURL(url);
      
      if (result.error) {
        console.log('❌ Serverless extraction failed:', result.error);
        return {
          success: false,
          error: result.error,
          insights: {
            strategies: ['Hybrid Cheerio + AI'], // UPDATED: Reflect hybrid
            consensus: false,
            recommendations: ['Please try manual entry or check the URL'],
            fieldConfidence: {}
          }
        };
      }

      if (result.company || result.position) {
        console.log('✅ Serverless extraction successful:', result);
        
        // Convert to CreateJobApplication format
        const jobData: Partial<CreateJobApplication> = {
          company: result.company,
          position: result.position,
          salary: result.salary,
          hourly_rate: result.hourlyRate ? parseFloat(result.hourlyRate) : undefined,
          job_description: result.jobDescription,
          job_url: result.jobUrl || url,
        };

        return {
          success: true,
          data: jobData,
          confidence: this.calculateConfidence(result),
          insights: {
            strategies: ['Hybrid Cheerio + AI'],
            consensus: true,
            recommendations: ['High confidence extraction (AI fallback if needed)'],
            fieldConfidence: this.calculateFieldConfidence(jobData)
          }
        };
      }

      // No data extracted
      console.log('❌ No data extracted from serverless API');
      return {
        success: false,
        error: 'Could not extract job data automatically',
        insights: {
          strategies: ['Hybrid Cheerio + AI'],
          consensus: false,
          recommendations: ['Please try manual entry'],
          fieldConfidence: {}
        }
      };

    } catch (error) {
      console.error('❌ Serverless extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown extraction error',
        insights: {
          strategies: ['Hybrid Cheerio + AI'],
          consensus: false,
          recommendations: ['Please try manual entry'],
          fieldConfidence: {}
        }
      };
    }
  }

  /**
   * Calculate confidence score for extracted data
   */
  private calculateConfidence(result: ExtractedJobData): number {
    let score = 0;
    
    if (result.company) score += 0.4;
    if (result.position) score += 0.4;
    if (result.salary) score += 0.1;
    if (result.hourlyRate) score += 0.1;
    if (result.company && result.position) score += 0.1;
    
    return Math.min(score, 1);
  }

  /**
   * Calculate field confidence for extracted data
   */
  private calculateFieldConfidence(data: Partial<CreateJobApplication> | undefined): Record<string, number> {
    if (!data) return {};

    const confidence: Record<string, number> = {};
    
    if (data.company) confidence.company = 0.95; // UPDATED: Slightly higher for AI
    if (data.position) confidence.position = 0.95;
    if (data.salary) confidence.salary = 0.8;
    if (data.hourly_rate) confidence.hourly_rate = 0.8;
    if (data.job_url) confidence.job_url = 1.0;
    
    return confidence;
  }
}

// Export singleton instance
export const creativeExtractionService = CreativeExtractionService.getInstance();