/**
 * Creative Extraction Service
 * Integrates multiple creative approaches for maximum extraction accuracy
 */

import { CreateJobApplication } from '../types/job';
import { enhancedExtractionService, EnsembleResult } from './enhancedExtractionService';
import { userFeedbackLearningService } from './userFeedbackLearning';
import { confidenceScoringService, ConfidenceScore } from './confidenceScoringService';
import { freeAPIService, FreeAPIResult } from './freeAPIService';

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
   * Extract job data using creative multi-strategy approach with free APIs
   */
  async extractJobData(url: string): Promise<CreativeExtractionResult> {
    console.log('🎨 Starting creative extraction for:', url);

    try {
      // Step 1: Try free APIs first (highest accuracy)
      const freeAPIResult = await this.tryFreeAPIs(url);
      if (freeAPIResult.success && freeAPIResult.confidence && freeAPIResult.confidence > 0.8) {
        console.log('✅ Free API extraction successful:', freeAPIResult);
        return {
          success: true,
          data: freeAPIResult.data,
          confidence: freeAPIResult.confidence,
          insights: {
            strategies: [freeAPIResult.apiUsed || 'Free API'],
            consensus: true,
            recommendations: ['High confidence extraction from free API'],
            fieldConfidence: this.calculateFieldConfidence(freeAPIResult.data)
          }
        };
      }

      // Step 2: Fallback to ensemble extraction
      const ensembleResult = await enhancedExtractionService.extractJobData(url);
      
      // Step 3: Apply learned patterns from user feedback
      const learnedData = userFeedbackLearningService.applyLearnedPatterns(
        this.extractDomain(url),
        ensembleResult.data
      );

      // Step 4: Calculate comprehensive confidence score
      const confidenceScore = confidenceScoringService.calculateConfidence(
        learnedData,
        url,
        'ensemble',
        ensembleResult.consensus
      );

      // Step 5: Generate insights and recommendations
      const insights = this.generateInsights(ensembleResult, confidenceScore, url);

      // Step 6: Determine if extraction is reliable enough
      const isReliable = confidenceScore.overall > 0.6;

      if (isReliable) {
        console.log('✅ Creative extraction successful:', learnedData);
        return {
          success: true,
          data: learnedData,
          confidence: confidenceScore.overall,
          insights
        };
      } else {
        console.log('⚠️ Low confidence extraction:', learnedData);
        return {
          success: false,
          data: learnedData,
          confidence: confidenceScore.overall,
          error: 'Low confidence extraction - manual review recommended',
          insights
        };
      }

    } catch (error) {
      console.error('❌ Creative extraction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Try free APIs for extraction
   */
  private async tryFreeAPIs(url: string): Promise<FreeAPIResult> {
    try {
      const result = await freeAPIService.extractJobData(url);
      return result;
    } catch (error) {
      console.warn('Free APIs failed, falling back to ensemble:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Free APIs not available'
      };
    }
  }

  /**
   * Calculate field confidence for extracted data
   */
  private calculateFieldConfidence(data: Partial<CreateJobApplication> | undefined): Record<string, number> {
    if (!data) return {};

    const fieldConfidence: Record<string, number> = {};
    
    Object.entries(data).forEach(([field, value]) => {
      if (value && String(value).trim()) {
        const fieldConf = confidenceScoringService.getFieldConfidence(
          field,
          String(value),
          ''
        );
        fieldConfidence[field] = fieldConf.confidence;
      }
    });

    return fieldConfidence;
  }

  /**
   * Learn from user corrections
   */
  learnFromUserCorrection(
    url: string,
    originalExtraction: Partial<CreateJobApplication>,
    userCorrection: Partial<CreateJobApplication>,
    strategy: string
  ): void {
    console.log('📚 Learning from user correction:', { url, originalExtraction, userCorrection });
    
    // Record feedback for learning
    userFeedbackLearningService.recordFeedback(
      url,
      originalExtraction,
      userCorrection,
      strategy
    );

    // Update confidence scoring based on user feedback
    const domain = this.extractDomain(url);
    const accuracy = this.calculateAccuracy(originalExtraction, userCorrection);
    confidenceScoringService.updateUserHistoryAccuracy(url, accuracy);
    confidenceScoringService.updateWebsiteReliability(url, accuracy > 0.7);
  }


  /**
   * Get learning statistics
   */
  getLearningStats(): {
    totalFeedback: number;
    domainsLearned: number;
    patternsLearned: number;
    averageAccuracy: number;
    improvementTrend: 'improving' | 'stable' | 'declining';
  } {
    const stats = userFeedbackLearningService.getLearningStats();
    
    // Calculate improvement trend (simplified)
    const improvementTrend = stats.averageAccuracy > 0.7 ? 'improving' : 
                           stats.averageAccuracy > 0.5 ? 'stable' : 'declining';

    return {
      ...stats,
      improvementTrend
    };
  }

  /**
   * Generate insights from extraction results
   */
  private generateInsights(
    ensembleResult: EnsembleResult,
    confidenceScore: ConfidenceScore,
    url: string
  ): CreativeExtractionResult['insights'] {
    const strategies = ensembleResult.strategies.map(s => s.strategy);
    const fieldConfidence: Record<string, number> = {};

    // Calculate field-specific confidence
    Object.entries(ensembleResult.data).forEach(([field, value]) => {
      if (value && String(value).trim()) {
        const fieldConf = confidenceScoringService.getFieldConfidence(
          field,
          String(value),
          url
        );
        fieldConfidence[field] = fieldConf.confidence;
      }
    });

    return {
      strategies,
      consensus: ensembleResult.consensus,
      recommendations: confidenceScore.recommendations,
      fieldConfidence
    };
  }

  /**
   * Calculate accuracy between original and corrected data
   */
  private calculateAccuracy(
    original: Partial<CreateJobApplication>,
    corrected: Partial<CreateJobApplication>
  ): number {
    const fields = Object.keys(corrected);
    if (fields.length === 0) return 0;

    const correctFields = fields.filter(field => {
      const originalValue = original[field as keyof CreateJobApplication];
      const correctedValue = corrected[field as keyof CreateJobApplication];
      return originalValue === correctedValue;
    });

    return correctFields.length / fields.length;
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get creative extraction tips for users
   */
  getCreativeTips(): {
    general: string[];
    domainSpecific: Record<string, string[]>;
    accuracyImprovement: string[];
  } {
    return {
      general: [
        'Try multiple job posting URLs to improve learning',
        'Correct extraction errors to help the system learn',
        'Use specific job titles for better pattern matching',
        'Include company websites for higher accuracy'
      ],
      domainSpecific: {
        'linkedin.com': [
          'LinkedIn job postings have high extraction accuracy',
          'Company names are usually well-formatted',
          'Job titles are typically clear and specific'
        ],
        'indeed.com': [
          'Indeed postings may have varying formats',
          'Salary information is often available',
          'Location details are usually present'
        ],
        'glassdoor.com': [
          'Glassdoor provides detailed job descriptions',
          'Company information is usually accurate',
          'Salary ranges are frequently available'
        ]
      },
      accuracyImprovement: [
        'The system learns from your corrections',
        'More feedback leads to better accuracy',
        'Domain-specific patterns improve over time',
        'Consensus between strategies increases confidence'
      ]
    };
  }

  /**
   * Export learning data for backup
   */
  exportLearningData(): any {
    return userFeedbackLearningService.exportLearningData();
  }

  /**
   * Import learning data from backup
   */
  importLearningData(data: any): void {
    userFeedbackLearningService.importLearningData(data);
  }

  /**
   * Reset learning data
   */
  resetLearningData(): void {
    userFeedbackLearningService.clearLearningData();
  }

  /**
   * Get free API status and availability
   */
  getFreeAPIStatus(): {
    available: Record<string, boolean>;
    usage: Record<string, any>;
    recommendations: string[];
  } {
    const availability = freeAPIService.getAPIAvailability();
    const usage = freeAPIService.getUsageStats();
    
    const recommendations: string[] = [];
    
    if (!availability.scrapingbee) {
      recommendations.push('Get ScrapingBee API key for 95% Indeed accuracy');
    }
    if (!availability.apify) {
      recommendations.push('Get Apify API key for 90% LinkedIn accuracy');
    }
    if (!availability.freewebapi) {
      recommendations.push('Get FreeWebAPI key for multi-site coverage');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All free APIs configured! Maximum accuracy enabled.');
    }

    return {
      available: availability,
      usage,
      recommendations
    };
  }

  /**
   * Get extraction suggestions based on free API availability
   */
  getExtractionSuggestions(url: string): {
    recommendedAPI: string;
    expectedAccuracy: number;
    setupRequired: boolean;
    instructions: string[];
  } {
    const domain = this.extractDomain(url);
    const apiStatus = this.getFreeAPIStatus();
    
    let recommendedAPI = 'ensemble';
    let expectedAccuracy = 0.7;
    let setupRequired = false;
    const instructions: string[] = [];

    if (domain.includes('indeed.com') && apiStatus.available.scrapingbee) {
      recommendedAPI = 'ScrapingBee';
      expectedAccuracy = 0.95;
    } else if (domain.includes('linkedin.com') && apiStatus.available.apify) {
      recommendedAPI = 'Apify';
      expectedAccuracy = 0.90;
    } else if (apiStatus.available.freewebapi) {
      recommendedAPI = 'FreeWebAPI';
      expectedAccuracy = 0.85;
    } else {
      setupRequired = true;
      instructions.push('Configure free APIs for higher accuracy');
      instructions.push('ScrapingBee: Best for Indeed (95% accuracy)');
      instructions.push('Apify: Best for LinkedIn (90% accuracy)');
      instructions.push('FreeWebAPI: Multi-site coverage (85% accuracy)');
    }

    return {
      recommendedAPI,
      expectedAccuracy,
      setupRequired,
      instructions
    };
  }
}

export const creativeExtractionService = CreativeExtractionService.getInstance();
