/**
 * Confidence Scoring Service
 * Calculates confidence scores for extraction results
 */

import { CreateJobApplication } from '../types/job';

export interface ConfidenceFactors {
  fieldCompleteness: number;
  fieldQuality: number;
  patternMatch: number;
  userHistory: number;
  websiteReliability: number;
  extractionStrategy: number;
  consensus: number;
}

export interface ConfidenceScore {
  overall: number;
  factors: ConfidenceFactors;
  breakdown: Record<string, number>;
  recommendations: string[];
}

export interface FieldConfidence {
  field: string;
  confidence: number;
  reasons: string[];
  suggestions: string[];
}

export class ConfidenceScoringService {
  private websiteReliability: Map<string, number> = new Map();
  private userHistoryAccuracy: Map<string, number> = new Map();
  private strategyWeights: Record<string, number> = {
    'universal': 0.7,
    'portal-specific': 0.9,
    'pattern-matching': 0.8,
    'user-history': 0.6,
    'ai-powered': 0.95,
    'ensemble': 0.85
  };

  /**
   * Calculate comprehensive confidence score
   */
  calculateConfidence(
    extractedData: Partial<CreateJobApplication>,
    url: string,
    strategy: string,
    consensus: boolean = false
  ): ConfidenceScore {
    const factors = this.calculateConfidenceFactors(extractedData, url, strategy, consensus);
    const overall = this.calculateOverallConfidence(factors);
    const breakdown = this.createConfidenceBreakdown(factors);
    const recommendations = this.generateRecommendations(factors, overall);

    return {
      overall,
      factors,
      breakdown,
      recommendations
    };
  }

  /**
   * Calculate confidence factors
   */
  private calculateConfidenceFactors(
    data: Partial<CreateJobApplication>,
    url: string,
    strategy: string,
    consensus: boolean
  ): ConfidenceFactors {
    return {
      fieldCompleteness: this.calculateFieldCompleteness(data),
      fieldQuality: this.calculateFieldQuality(data),
      patternMatch: this.calculatePatternMatch(data, url),
      userHistory: this.calculateUserHistoryAccuracy(url),
      websiteReliability: this.calculateWebsiteReliability(url),
      extractionStrategy: this.calculateStrategyConfidence(strategy),
      consensus: consensus ? 1.0 : 0.0
    };
  }

  /**
   * Calculate field completeness score
   */
  private calculateFieldCompleteness(data: Partial<CreateJobApplication>): number {
    const requiredFields = ['company', 'position'];
    const optionalFields = ['salary', 'notes', 'job_url'];
    const allFields = [...requiredFields, ...optionalFields];

    const completedFields = allFields.filter(field => {
      const value = data[field as keyof CreateJobApplication];
      return value && String(value).trim().length > 0;
    });

    const requiredCompleted = requiredFields.filter(field => {
      const value = data[field as keyof CreateJobApplication];
      return value && String(value).trim().length > 0;
    });

    // Weight required fields more heavily
    const requiredScore = requiredCompleted.length / requiredFields.length;
    const optionalScore = (completedFields.length - requiredCompleted.length) / optionalFields.length;
    
    return (requiredScore * 0.7) + (optionalScore * 0.3);
  }

  /**
   * Calculate field quality score
   */
  private calculateFieldQuality(data: Partial<CreateJobApplication>): number {
    const qualityChecks = [
      this.checkCompanyQuality(data.company),
      this.checkPositionQuality(data.position),
      this.checkSalaryQuality(data.salary),
      this.checkNotesQuality(data.notes)
    ];

    return qualityChecks.reduce((sum, check) => sum + check, 0) / qualityChecks.length;
  }

  /**
   * Check company name quality
   */
  private checkCompanyQuality(company?: string): number {
    if (!company) return 0;
    
    let score = 0.5; // Base score
    
    // Length check
    if (company.length >= 2 && company.length <= 100) score += 0.2;
    
    // Format check (not just numbers)
    if (!/^\d+$/.test(company)) score += 0.2;
    
    // Common company indicators
    if (/inc|corp|ltd|llc|company|co\./i.test(company)) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  /**
   * Check position quality
   */
  private checkPositionQuality(position?: string): number {
    if (!position) return 0;
    
    let score = 0.5; // Base score
    
    // Length check
    if (position.length >= 3 && position.length <= 200) score += 0.2;
    
    // Job title indicators
    if (/engineer|developer|manager|analyst|specialist|coordinator/i.test(position)) score += 0.2;
    
    // Avoid generic terms
    if (!/job|position|role|title/i.test(position)) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  /**
   * Check salary quality
   */
  private checkSalaryQuality(salary?: string): number {
    if (!salary) return 0;
    
    let score = 0.5; // Base score
    
    // Contains currency symbol
    if (/\$/.test(salary)) score += 0.2;
    
    // Contains numbers
    if (/\d/.test(salary)) score += 0.2;
    
    // Reasonable range
    const numbers = salary.match(/\d+/g);
    if (numbers) {
      const maxNum = Math.max(...numbers.map(n => parseInt(n)));
      if (maxNum >= 20000 && maxNum <= 1000000) score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Check notes quality
   */
  private checkNotesQuality(notes?: string): number {
    if (!notes) return 0;
    
    let score = 0.5; // Base score
    
    // Length check
    if (notes.length >= 10 && notes.length <= 5000) score += 0.3;
    
    // Contains job-related keywords
    if (/experience|skills|requirements|responsibilities|benefits/i.test(notes)) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  /**
   * Calculate pattern match confidence
   */
  private calculatePatternMatch(data: Partial<CreateJobApplication>, url: string): number {
    const domain = this.extractDomain(url);
    const knownPatterns = this.getKnownPatterns(domain);
    
    if (knownPatterns.length === 0) return 0.5; // Unknown domain
    
    let matchScore = 0;
    let totalChecks = 0;

    Object.entries(data).forEach(([field, value]) => {
      if (value && String(value).trim()) {
        const fieldPatterns = knownPatterns.filter(p => p.field === field);
        if (fieldPatterns.length > 0) {
          const matches = fieldPatterns.filter(pattern => 
            this.matchesPattern(String(value), pattern.pattern)
          );
          matchScore += matches.length / fieldPatterns.length;
          totalChecks++;
        }
      }
    });

    return totalChecks > 0 ? matchScore / totalChecks : 0.5;
  }

  /**
   * Calculate user history accuracy
   */
  private calculateUserHistoryAccuracy(url: string): number {
    const domain = this.extractDomain(url);
    return this.userHistoryAccuracy.get(domain) || 0.5;
  }

  /**
   * Calculate website reliability
   */
  private calculateWebsiteReliability(url: string): number {
    const domain = this.extractDomain(url);
    return this.websiteReliability.get(domain) || 0.5;
  }

  /**
   * Calculate strategy confidence
   */
  private calculateStrategyConfidence(strategy: string): number {
    return this.strategyWeights[strategy] || 0.5;
  }

  /**
   * Calculate overall confidence
   */
  private calculateOverallConfidence(factors: ConfidenceFactors): number {
    const weights = {
      fieldCompleteness: 0.25,
      fieldQuality: 0.25,
      patternMatch: 0.15,
      userHistory: 0.10,
      websiteReliability: 0.10,
      extractionStrategy: 0.10,
      consensus: 0.05
    };

    return Object.entries(weights).reduce((sum, [factor, weight]) => {
      return sum + (factors[factor as keyof ConfidenceFactors] * weight);
    }, 0);
  }

  /**
   * Create confidence breakdown
   */
  private createConfidenceBreakdown(factors: ConfidenceFactors): Record<string, number> {
    return {
      'Field Completeness': factors.fieldCompleteness,
      'Field Quality': factors.fieldQuality,
      'Pattern Match': factors.patternMatch,
      'User History': factors.userHistory,
      'Website Reliability': factors.websiteReliability,
      'Extraction Strategy': factors.extractionStrategy,
      'Consensus': factors.consensus
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(factors: ConfidenceFactors, overall: number): string[] {
    const recommendations: string[] = [];

    if (factors.fieldCompleteness < 0.5) {
      recommendations.push('Consider adding more job details manually');
    }

    if (factors.fieldQuality < 0.6) {
      recommendations.push('Review extracted fields for accuracy');
    }

    if (factors.patternMatch < 0.4) {
      recommendations.push('Website structure may have changed - try manual entry');
    }

    if (factors.userHistory < 0.3) {
      recommendations.push('This website has low extraction accuracy - manual entry recommended');
    }

    if (overall < 0.5) {
      recommendations.push('Low confidence extraction - please verify all fields');
    }

    if (overall > 0.8) {
      recommendations.push('High confidence extraction - fields look good!');
    }

    return recommendations;
  }

  /**
   * Get field-specific confidence
   */
  getFieldConfidence(
    field: string,
    value: string,
    url: string
  ): FieldConfidence {
    const confidence = this.calculateFieldConfidence(field, value, url);
    const reasons = this.getFieldConfidenceReasons(field, value, url);
    const suggestions = this.getFieldSuggestions(field, value, confidence);

    return {
      field,
      confidence,
      reasons,
      suggestions
    };
  }

  /**
   * Calculate field-specific confidence
   */
  private calculateFieldConfidence(field: string, value: string, url: string): number {
    let score = 0.5; // Base score

    switch (field) {
      case 'company':
        score = this.checkCompanyQuality(value);
        break;
      case 'position':
        score = this.checkPositionQuality(value);
        break;
      case 'salary':
        score = this.checkSalaryQuality(value);
        break;
      case 'notes':
        score = this.checkNotesQuality(value);
        break;
      default:
        score = value.length > 0 ? 0.7 : 0.0;
    }

    // Adjust based on website reliability
    const websiteReliability = this.calculateWebsiteReliability(url);
    return (score + websiteReliability) / 2;
  }

  /**
   * Get field confidence reasons
   */
  private getFieldConfidenceReasons(field: string, value: string, url: string): string[] {
    const reasons: string[] = [];

    if (value.length === 0) {
      reasons.push('Field is empty');
      return reasons;
    }

    if (value.length < 2) {
      reasons.push('Value is too short');
    }

    if (value.length > 200) {
      reasons.push('Value is too long');
    }

    if (field === 'company' && /^\d+$/.test(value)) {
      reasons.push('Company name appears to be only numbers');
    }

    if (field === 'salary' && !/\$/.test(value) && !/\d/.test(value)) {
      reasons.push('Salary field doesn\'t contain currency or numbers');
    }

    const websiteReliability = this.calculateWebsiteReliability(url);
    if (websiteReliability < 0.3) {
      reasons.push('Website has low extraction reliability');
    }

    return reasons;
  }

  /**
   * Get field suggestions
   */
  private getFieldSuggestions(field: string, value: string, confidence: number): string[] {
    const suggestions: string[] = [];

    if (confidence < 0.5) {
      suggestions.push('Consider manually editing this field');
    }

    if (field === 'company' && value.length < 3) {
      suggestions.push('Company name seems incomplete');
    }

    if (field === 'position' && !/engineer|developer|manager|analyst/i.test(value)) {
      suggestions.push('Job title might be generic - consider adding more specific details');
    }

    if (field === 'salary' && !/\$/.test(value)) {
      suggestions.push('Add currency symbol for clarity');
    }

    return suggestions;
  }

  /**
   * Update website reliability
   */
  updateWebsiteReliability(url: string, success: boolean): void {
    const domain = this.extractDomain(url);
    const currentReliability = this.websiteReliability.get(domain) || 0.5;
    const newReliability = success ? 
      Math.min(currentReliability + 0.1, 1.0) : 
      Math.max(currentReliability - 0.1, 0.0);
    
    this.websiteReliability.set(domain, newReliability);
  }

  /**
   * Update user history accuracy
   */
  updateUserHistoryAccuracy(url: string, accuracy: number): void {
    const domain = this.extractDomain(url);
    this.userHistoryAccuracy.set(domain, accuracy);
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

  private getKnownPatterns(domain: string): Array<{field: string, pattern: string}> {
    // This would return known patterns for the domain
    // For now, return empty array
    return [];
  }

  private matchesPattern(value: string, pattern: string): boolean {
    try {
      const regex = new RegExp(pattern, 'i');
      return regex.test(value);
    } catch {
      return false;
    }
  }
}

export const confidenceScoringService = new ConfidenceScoringService();

