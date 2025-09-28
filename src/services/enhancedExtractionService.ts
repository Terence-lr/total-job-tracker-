/**
 * Enhanced Extraction Service with Multi-Strategy Ensemble
 * Combines multiple extraction methods for maximum accuracy
 */

import { JobAutomationService } from './jobAutomationService';
import { CreateJobApplication } from '../types/job';

export interface ExtractionStrategy {
  name: string;
  weight: number;
  extract: (url: string, html: string) => Promise<Partial<CreateJobApplication>>;
}

export interface ExtractionResult {
  data: Partial<CreateJobApplication>;
  confidence: number;
  strategy: string;
  details: string;
  weight: number;
}

export interface EnsembleResult {
  data: Partial<CreateJobApplication>;
  confidence: number;
  strategies: ExtractionResult[];
  consensus: boolean;
}

export class EnhancedExtractionService {
  private jobAutomationService: JobAutomationService;
  private strategies: ExtractionStrategy[] = [];
  private userFeedback: Map<string, any> = new Map();

  constructor() {
    this.jobAutomationService = JobAutomationService.getInstance();
    this.initializeStrategies();
  }

  private initializeStrategies() {
    this.strategies = [
      {
        name: 'Universal Extraction',
        weight: 0.3,
        extract: this.extractUniversal.bind(this)
      },
      {
        name: 'Portal-Specific',
        weight: 0.4,
        extract: this.extractPortalSpecific.bind(this)
      },
      {
        name: 'Pattern Matching',
        weight: 0.2,
        extract: this.extractWithPatterns.bind(this)
      },
      {
        name: 'User History',
        weight: 0.1,
        extract: this.extractWithUserHistory.bind(this)
      }
    ];
  }

  /**
   * Extract job data using ensemble of strategies
   */
  async extractJobData(url: string): Promise<EnsembleResult> {
    console.log('🎯 Starting ensemble extraction for:', url);
    
    try {
      // Get HTML content
      const html = await this.fetchHtmlContent(url);
      
      // Run all strategies in parallel
      const strategyResults = await Promise.allSettled(
        this.strategies.map(async (strategy) => {
          try {
            const data = await strategy.extract(url, html);
            const confidence = this.calculateConfidence(data, strategy.name);
            
            return {
              data,
              confidence,
              strategy: strategy.name,
              details: `Extracted using ${strategy.name}`,
              weight: strategy.weight
            } as ExtractionResult;
          } catch (error) {
            console.warn(`Strategy ${strategy.name} failed:`, error);
            return null;
          }
        })
      );

      // Filter successful results
      const successfulResults = strategyResults
        .filter((result): result is PromiseFulfilledResult<ExtractionResult> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

      if (successfulResults.length === 0) {
        throw new Error('All extraction strategies failed');
      }

      // Combine results using weighted voting
      const ensembleResult = this.combineResults(successfulResults);
      
      console.log('✅ Ensemble extraction completed:', ensembleResult);
      return ensembleResult;

    } catch (error) {
      console.error('❌ Ensemble extraction failed:', error);
      throw error;
    }
  }

  /**
   * Universal extraction strategy
   */
  private async extractUniversal(url: string, html: string): Promise<Partial<CreateJobApplication>> {
    const result = await this.jobAutomationService.extractJobFromUrl(url);
    return result.success ? result.data || {} : {};
  }

  /**
   * Portal-specific extraction strategy
   */
  private async extractPortalSpecific(url: string, html: string): Promise<Partial<CreateJobApplication>> {
    const result = await this.jobAutomationService.extractJobFromUrl(url);
    return result.success ? result.data || {} : {};
  }

  /**
   * Enhanced pattern matching strategy
   */
  private async extractWithPatterns(url: string, html: string): Promise<Partial<CreateJobApplication>> {
    const patterns = this.getEnhancedPatterns(html);
    const data: Partial<CreateJobApplication> = {};

    // Extract company name
    data.company = this.extractTextWithPatterns(html, patterns.company);
    
    // Extract position
    data.position = this.extractTextWithPatterns(html, patterns.position);
    
    // Extract salary
    data.salary = this.extractTextWithPatterns(html, patterns.salary);
    
    // Extract notes/description
    data.notes = this.extractTextWithPatterns(html, patterns.description);

    return data;
  }

  /**
   * User history-based extraction strategy
   */
  private async extractWithUserHistory(url: string, html: string): Promise<Partial<CreateJobApplication>> {
    const domain = this.extractDomain(url);
    const userPatterns = this.getUserPatterns(domain);
    
    if (userPatterns) {
      return this.extractWithUserPatterns(html, userPatterns);
    }
    
    return {};
  }

  /**
   * Calculate confidence score for extraction result
   */
  private calculateConfidence(data: Partial<CreateJobApplication>, strategy: string): number {
    let score = 0;
    let factors = 0;

    // Field completeness
    const fields = ['company', 'position', 'salary', 'notes'];
    const completedFields = fields.filter(field => 
      data[field as keyof CreateJobApplication] && 
      String(data[field as keyof CreateJobApplication]).trim().length > 0
    );
    
    score += (completedFields.length / fields.length) * 0.4;
    factors += 0.4;

    // Field quality
    if (data.company && this.isValidCompanyName(data.company)) {
      score += 0.2;
    }
    if (data.position && this.isValidJobTitle(data.position)) {
      score += 0.2;
    }
    if (data.salary && this.isValidSalary(data.salary)) {
      score += 0.2;
    }
    factors += 0.6;

    // Strategy reliability
    const strategyWeights = {
      'Universal Extraction': 0.8,
      'Portal-Specific': 0.9,
      'Pattern Matching': 0.7,
      'User History': 0.6
    };
    
    score += (strategyWeights[strategy as keyof typeof strategyWeights] || 0.5) * 0.3;
    factors += 0.3;

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Combine results from multiple strategies using weighted voting
   */
  private combineResults(results: ExtractionResult[]): EnsembleResult {
    const combinedData: Partial<CreateJobApplication> = {};
    const fieldWeights: Record<string, number> = {};
    const fieldValues: Record<string, string[]> = {};

    // Collect all field values with their weights
    results.forEach(result => {
      Object.entries(result.data).forEach(([field, value]) => {
        if (value && String(value).trim()) {
          if (!fieldValues[field]) fieldValues[field] = [];
          if (!fieldWeights[field]) fieldWeights[field] = 0;
          
          fieldValues[field].push(String(value));
          fieldWeights[field] += result.confidence * result.weight;
        }
      });
    });

    // Select best value for each field using weighted voting
    Object.entries(fieldValues).forEach(([field, values]) => {
      const valueCounts = this.countValueOccurrences(values);
      const bestValue = this.selectBestValue(valueCounts, fieldWeights[field]);
      (combinedData as any)[field] = bestValue;
    });

    // Calculate overall confidence
    const totalConfidence = results.reduce((sum, result) => 
      sum + (result.confidence * result.weight), 0
    );
    const totalWeight = results.reduce((sum, result) => sum + result.weight, 0);
    const overallConfidence = totalWeight > 0 ? totalConfidence / totalWeight : 0;

    // Check consensus (multiple strategies agree)
    const consensus = this.checkConsensus(results);

    return {
      data: combinedData,
      confidence: overallConfidence,
      strategies: results,
      consensus
    };
  }

  /**
   * Check if multiple strategies agree on key fields
   */
  private checkConsensus(results: ExtractionResult[]): boolean {
    if (results.length < 2) return false;

    const keyFields = ['company', 'position'];
    let consensusCount = 0;

    keyFields.forEach(field => {
      const values = results
        .map(result => result.data[field as keyof CreateJobApplication])
        .filter(value => value && String(value).trim())
        .map(value => String(value).toLowerCase().trim());

      if (values.length >= 2) {
        const uniqueValues = new Set(values);
        if (uniqueValues.size <= Math.ceil(values.length / 2)) {
          consensusCount++;
        }
      }
    });

    return consensusCount >= keyFields.length / 2;
  }

  /**
   * Enhanced pattern matching with context awareness
   */
  private getEnhancedPatterns(html: string) {
    const context = this.analyzePageContext(html);
    
    return {
      company: [
        /<[^>]*class="[^"]*company[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
        /<[^>]*class="[^"]*employer[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
        /<[^>]*class="[^"]*organization[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
        ...(context.hasJobBoard ? [
          /<[^>]*class="[^"]*job-company[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
          /<[^>]*class="[^"]*company-name[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi
        ] : [])
      ],
      position: [
        /<h1[^>]*>([^<]+)<\/h1>/gi,
        /<h2[^>]*>([^<]+)<\/h2>/gi,
        /<[^>]*class="[^"]*job-title[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
        /<[^>]*class="[^"]*position[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
        ...(context.hasJobBoard ? [
          /<[^>]*class="[^"]*job-header[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi
        ] : [])
      ],
      salary: [
        /\$[\d,]+(?:k|K)?(?:\s*-\s*\$[\d,]+(?:k|K)?)?/g,
        /<[^>]*class="[^"]*salary[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
        /<[^>]*class="[^"]*compensation[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
        /<[^>]*class="[^"]*pay[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi
      ],
      description: [
        /<[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/gi,
        /<[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/gi,
        /<[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/gi
      ]
    };
  }

  /**
   * Analyze page context for better pattern matching
   */
  private analyzePageContext(html: string) {
    return {
      hasJobBoard: /linkedin|indeed|glassdoor|angel|remote/.test(html.toLowerCase()),
      hasStructuredData: /application\/ld\+json/.test(html),
      hasMetaTags: /<meta[^>]*property="og:/.test(html),
      hasJobSchema: /JobPosting/.test(html),
      hasSalaryInfo: /\$[\d,]+/.test(html),
      hasLocationInfo: /location|address|city|state/.test(html.toLowerCase())
    };
  }

  /**
   * Extract text using multiple patterns
   */
  private extractTextWithPatterns(html: string, patterns: RegExp[]): string {
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].trim().length > 0) {
        return match[1].trim();
      }
    }
    return '';
  }

  /**
   * Validation helpers
   */
  private isValidCompanyName(name: string): boolean {
    return name.length > 1 && name.length < 100 && !/^\d+$/.test(name);
  }

  private isValidJobTitle(title: string): boolean {
    return title.length > 2 && title.length < 200;
  }

  private isValidSalary(salary: string): boolean {
    return /\$[\d,]+/.test(salary) || /[\d,]+(?:k|K)/.test(salary);
  }

  /**
   * Utility methods
   */
  private async fetchHtmlContent(url: string): Promise<string> {
    // Implementation would fetch HTML content
    // This is a placeholder - actual implementation would use CORS proxy
    return '';
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  private getPortalConfig(domain: string): any {
    // Implementation would return portal-specific configuration
    return null;
  }

  private getUserPatterns(domain: string): any {
    // Implementation would return user-specific patterns for the domain
    return null;
  }

  private extractWithUserPatterns(html: string, patterns: any): Partial<CreateJobApplication> {
    // Implementation would use user-specific patterns
    return {};
  }

  private countValueOccurrences(values: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    values.forEach(value => {
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }

  private selectBestValue(valueCounts: Record<string, number>, weight: number): string {
    const sortedValues = Object.entries(valueCounts)
      .sort(([, a], [, b]) => b - a);
    
    return sortedValues[0]?.[0] || '';
  }
}

export const enhancedExtractionService = new EnhancedExtractionService();
