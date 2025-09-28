/**
 * User Feedback Learning System
 * Learns from user corrections to improve extraction accuracy
 */

import { CreateJobApplication } from '../types/job';

export interface UserFeedback {
  id: string;
  url: string;
  originalExtraction: Partial<CreateJobApplication>;
  userCorrection: Partial<CreateJobApplication>;
  timestamp: Date;
  domain: string;
  extractionStrategy: string;
}

export interface LearningPattern {
  domain: string;
  field: string;
  originalPattern: string;
  correctedPattern: string;
  confidence: number;
  usageCount: number;
}

export interface ExtractionInsight {
  domain: string;
  commonCorrections: Record<string, string[]>;
  fieldAccuracy: Record<string, number>;
  suggestedPatterns: string[];
}

export class UserFeedbackLearningService {
  private feedback: UserFeedback[] = [];
  private learningPatterns: LearningPattern[] = [];
  private domainInsights: Map<string, ExtractionInsight> = new Map();

  /**
   * Record user feedback for learning
   */
  recordFeedback(
    url: string,
    originalExtraction: Partial<CreateJobApplication>,
    userCorrection: Partial<CreateJobApplication>,
    extractionStrategy: string
  ): void {
    const feedback: UserFeedback = {
      id: this.generateId(),
      url,
      originalExtraction,
      userCorrection,
      timestamp: new Date(),
      domain: this.extractDomain(url),
      extractionStrategy
    };

    this.feedback.push(feedback);
    this.learnFromFeedback(feedback);
    
    console.log('📚 Learning from user feedback:', feedback);
  }

  /**
   * Learn from user feedback
   */
  private learnFromFeedback(feedback: UserFeedback): void {
    const domain = feedback.domain;
    
    // Analyze corrections for each field
    Object.keys(feedback.userCorrection).forEach(field => {
      const originalValue = feedback.originalExtraction[field as keyof CreateJobApplication];
      const correctedValue = feedback.userCorrection[field as keyof CreateJobApplication];
      
      if (originalValue && correctedValue && originalValue !== correctedValue) {
        this.updateFieldPattern(domain, field, String(originalValue), String(correctedValue));
      }
    });

    // Update domain insights
    this.updateDomainInsights(domain);
  }

  /**
   * Update field-specific patterns based on corrections
   */
  private updateFieldPattern(
    domain: string,
    field: string,
    originalValue: string,
    correctedValue: string
  ): void {
    const existingPattern = this.learningPatterns.find(
      pattern => pattern.domain === domain && 
                pattern.field === field && 
                pattern.originalPattern === originalValue
    );

    if (existingPattern) {
      // Update existing pattern
      existingPattern.correctedPattern = correctedValue;
      existingPattern.confidence = Math.min(existingPattern.confidence + 0.1, 1.0);
      existingPattern.usageCount++;
    } else {
      // Create new pattern
      this.learningPatterns.push({
        domain,
        field,
        originalPattern: originalValue,
        correctedPattern: correctedValue,
        confidence: 0.5,
        usageCount: 1
      });
    }
  }

  /**
   * Update domain-specific insights
   */
  private updateDomainInsights(domain: string): void {
    const domainFeedback = this.feedback.filter(f => f.domain === domain);
    
    if (domainFeedback.length === 0) return;

    const commonCorrections: Record<string, string[]> = {};
    const fieldAccuracy: Record<string, number> = {};
    const suggestedPatterns: string[] = [];

    // Analyze common corrections
    Object.keys(domainFeedback[0].userCorrection).forEach(field => {
      const corrections = domainFeedback
        .map(f => ({
          original: f.originalExtraction[field as keyof CreateJobApplication],
          corrected: f.userCorrection[field as keyof CreateJobApplication]
        }))
        .filter(c => c.original && c.corrected && c.original !== c.corrected);

      if (corrections.length > 0) {
        const correctionMap = new Map<string, number>();
        corrections.forEach(c => {
          const key = `${c.original} -> ${c.corrected}`;
          correctionMap.set(key, (correctionMap.get(key) || 0) + 1);
        });

        commonCorrections[field] = Array.from(correctionMap.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([correction]) => correction);
      }

      // Calculate field accuracy
      const totalAttempts = domainFeedback.length;
      const successfulExtractions = domainFeedback.filter(f => 
        f.originalExtraction[field as keyof CreateJobApplication] === 
        f.userCorrection[field as keyof CreateJobApplication]
      ).length;
      
      fieldAccuracy[field] = totalAttempts > 0 ? successfulExtractions / totalAttempts : 0;
    });

    // Generate suggested patterns based on corrections
    const patterns = this.generatePatternsFromCorrections(domainFeedback);
    suggestedPatterns.push(...patterns);

    this.domainInsights.set(domain, {
      domain,
      commonCorrections,
      fieldAccuracy,
      suggestedPatterns
    });
  }

  /**
   * Generate extraction patterns from user corrections
   */
  private generatePatternsFromCorrections(feedback: UserFeedback[]): string[] {
    const patterns: string[] = [];
    
    // Analyze HTML patterns that led to incorrect extractions
    feedback.forEach(f => {
      // This would analyze the HTML content to find patterns
      // For now, we'll generate simple patterns based on corrections
      Object.keys(f.userCorrection).forEach(field => {
        const original = f.originalExtraction[field as keyof CreateJobApplication];
        const corrected = f.userCorrection[field as keyof CreateJobApplication];
        
        if (original && corrected && original !== corrected) {
          // Generate pattern to avoid this mistake in the future
          patterns.push(`Avoid: ${original} -> Use: ${corrected}`);
        }
      });
    });

    return patterns;
  }

  /**
   * Get learned patterns for a domain
   */
  getLearnedPatterns(domain: string, field?: string): LearningPattern[] {
    return this.learningPatterns.filter(
      pattern => pattern.domain === domain && 
                (field ? pattern.field === field : true)
    );
  }

  /**
   * Get domain insights
   */
  getDomainInsights(domain: string): ExtractionInsight | undefined {
    return this.domainInsights.get(domain);
  }

  /**
   * Apply learned patterns to improve extraction
   */
  applyLearnedPatterns(
    domain: string,
    extractedData: Partial<CreateJobApplication>
  ): Partial<CreateJobApplication> {
    const learnedPatterns = this.getLearnedPatterns(domain);
    const improvedData = { ...extractedData };

    learnedPatterns.forEach(pattern => {
      const field = pattern.field as keyof CreateJobApplication;
      const currentValue = improvedData[field];
      
      if (currentValue && String(currentValue) === pattern.originalPattern) {
        // Apply learned correction
        if (pattern.confidence > 0.7) {
          improvedData[field] = pattern.correctedPattern as any;
          console.log(`🔧 Applied learned pattern: ${pattern.originalPattern} -> ${pattern.correctedPattern}`);
        }
      }
    });

    return improvedData;
  }

  /**
   * Get extraction suggestions based on user history
   */
  getExtractionSuggestions(domain: string): {
    fieldSuggestions: Record<string, string[]>;
    accuracyPredictions: Record<string, number>;
    recommendedStrategy: string;
  } {
    const insights = this.getDomainInsights(domain);
    
    if (!insights) {
      return {
        fieldSuggestions: {},
        accuracyPredictions: {},
        recommendedStrategy: 'universal'
      };
    }

    const fieldSuggestions: Record<string, string[]> = {};
    Object.entries(insights.commonCorrections).forEach(([field, corrections]) => {
      fieldSuggestions[field] = corrections.map(c => c.split(' -> ')[1]);
    });

    const accuracyPredictions = insights.fieldAccuracy;

    // Recommend strategy based on accuracy
    const avgAccuracy = Object.values(accuracyPredictions).reduce((sum, acc) => sum + acc, 0) / 
                       Object.keys(accuracyPredictions).length;
    
    const recommendedStrategy = avgAccuracy > 0.8 ? 'portal-specific' : 
                               avgAccuracy > 0.6 ? 'pattern-matching' : 'universal';

    return {
      fieldSuggestions,
      accuracyPredictions,
      recommendedStrategy
    };
  }

  /**
   * Get learning statistics
   */
  getLearningStats(): {
    totalFeedback: number;
    domainsLearned: number;
    patternsLearned: number;
    averageAccuracy: number;
  } {
    const domains = new Set(this.feedback.map(f => f.domain));
    const totalFeedback = this.feedback.length;
    const patternsLearned = this.learningPatterns.length;
    
    // Calculate average accuracy across all domains
    const domainAccuracies = Array.from(this.domainInsights.values())
      .map(insights => {
        const accuracies = Object.values(insights.fieldAccuracy);
        return accuracies.length > 0 ? 
          accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length : 0;
      });
    
    const averageAccuracy = domainAccuracies.length > 0 ?
      domainAccuracies.reduce((sum, acc) => sum + acc, 0) / domainAccuracies.length : 0;

    return {
      totalFeedback,
      domainsLearned: domains.size,
      patternsLearned,
      averageAccuracy
    };
  }

  /**
   * Export learning data for analysis
   */
  exportLearningData(): {
    feedback: UserFeedback[];
    patterns: LearningPattern[];
    insights: ExtractionInsight[];
  } {
    return {
      feedback: this.feedback,
      patterns: this.learningPatterns,
      insights: Array.from(this.domainInsights.values())
    };
  }

  /**
   * Import learning data
   */
  importLearningData(data: {
    feedback: UserFeedback[];
    patterns: LearningPattern[];
    insights: ExtractionInsight[];
  }): void {
    this.feedback = data.feedback;
    this.learningPatterns = data.patterns;
    this.domainInsights = new Map(data.insights.map(insight => [insight.domain, insight]));
  }

  /**
   * Clear learning data
   */
  clearLearningData(): void {
    this.feedback = [];
    this.learningPatterns = [];
    this.domainInsights.clear();
  }

  /**
   * Utility methods
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const userFeedbackLearningService = new UserFeedbackLearningService();
