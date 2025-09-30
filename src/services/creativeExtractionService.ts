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
            strategies: ['Serverless API'],
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
          hourly_rate: result.hourlyRate ? parseFloat(result.hourlyRate) : undefined, // Parse if needed
          job_url: result.jobUrl || url,
        };

        return {
          success: true,
          data: jobData,
          confidence: this.calculateConfidence(result),
          insights: {
            strategies: ['Serverless API'], // IMPROVED: Could log method used if passed from API
            consensus: true,
            recommendations: ['High confidence serverless extraction'],
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
          strategies: ['Serverless API'],
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
          strategies: ['Serverless API'],
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
    
    // Base score for having data
    if (result.company) score += 0.4;
    if (result.position) score += 0.4;
    if (result.salary || result.hourlyRate) score += 0.2;
    
    // Bonus for complete data
    if (result.company && result.position) score += 0.1;
    
    return Math.min(score, 1);
  }

  /**
   * Calculate field confidence for extracted data
   */
  private calculateFieldConfidence(data: Partial<CreateJobApplication> | undefined): Record<string, number> {
    if (!data) return {};

    const confidence: Record<string, number> = {};
    
    if (data.company) confidence.company = 0.9;
    if (data.position) confidence.position = 0.9;
    if (data.salary) confidence.salary = 0.7;
    if (data.hourly_rate) confidence.hourly_rate = 0.7;
    if (data.job_url) confidence.job_url = 1.0;
    
    return confidence;
  }
}

// Export singleton instance
export const creativeExtractionService = CreativeExtractionService.getInstance();