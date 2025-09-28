/**
 * Free API Service for Enhanced Job Extraction
 * Integrates multiple free APIs for maximum accuracy
 */

import { CreateJobApplication } from '../types/job';

export interface FreeAPIResult {
  success: boolean;
  data?: Partial<CreateJobApplication>;
  confidence?: number;
  error?: string;
  apiUsed?: string;
}

export class FreeAPIService {
  private scrapingBeeKey: string | undefined;
  private apifyKey: string | undefined;
  private freeWebAPIKey: string | undefined;
  private rapidAPIKey: string | undefined;

  constructor() {
    this.scrapingBeeKey = process.env.REACT_APP_SCRAPINGBEE_KEY;
    this.apifyKey = process.env.REACT_APP_APIFY_KEY;
    this.freeWebAPIKey = process.env.REACT_APP_FREEWEBAPI_KEY;
    this.rapidAPIKey = process.env.REACT_APP_RAPIDAPI_KEY || '68a8937d83msh714709d12590c0fp15d2dejsnfec5679eab7e';
  }

  /**
   * Extract job data using the best free API for the URL
   */
  async extractJobData(url: string): Promise<FreeAPIResult> {
    console.log('🆓 Starting free API extraction for:', url);
    
    const domain = this.extractDomain(url);
    const bestAPI = this.selectBestAPI(domain);
    
    try {
      let result: FreeAPIResult;
      
      switch (bestAPI) {
        case 'rapidapi':
          result = await this.extractWithRapidAPI(url);
          break;
        case 'scrapingbee':
          result = await this.extractWithScrapingBee(url);
          break;
        case 'apify':
          result = await this.extractWithApify(url);
          break;
        case 'freewebapi':
          result = await this.extractWithFreeWebAPI(url);
          break;
        default:
          result = await this.extractWithHybrid(url);
      }
      
      if (result.success) {
        console.log('✅ Free API extraction successful:', result);
        return result;
      } else {
        console.log('⚠️ Free API extraction failed, trying fallback');
        return await this.extractWithFallback(url);
      }
      
    } catch (error) {
      console.error('❌ Free API extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * RapidAPI JSearch - Best for general job search across multiple sites
   */
  private async extractWithRapidAPI(url: string): Promise<FreeAPIResult> {
    if (!this.rapidAPIKey) {
      throw new Error('RapidAPI key not configured');
    }

    try {
      // Extract search terms from URL
      const searchTerms = this.extractSearchTermsFromURL(url);
      
      const apiUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchTerms.keyword)}&page=1&num_pages=1&country=us&date_posted=all`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': this.rapidAPIKey,
          'x-rapidapi-host': 'jsearch.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`RapidAPI JSearch error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        // Find the job that matches our URL
        const matchingJob = this.findMatchingJob(data.data, url);
        
        if (matchingJob) {
          const jobData = this.parseRapidAPIJobData(matchingJob);
          return {
            success: true,
            data: jobData,
            confidence: 0.92,
            apiUsed: 'RapidAPI JSearch'
          };
        } else {
          // Use the first job as fallback
          const jobData = this.parseRapidAPIJobData(data.data[0]);
          return {
            success: true,
            data: jobData,
            confidence: 0.85,
            apiUsed: 'RapidAPI JSearch'
          };
        }
      } else {
        throw new Error('No jobs found in RapidAPI response');
      }
      
    } catch (error) {
      return {
        success: false,
        error: `RapidAPI JSearch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        apiUsed: 'RapidAPI JSearch'
      };
    }
  }

  /**
   * ScrapingBee API - Best for Indeed and general job sites
   */
  private async extractWithScrapingBee(url: string): Promise<FreeAPIResult> {
    if (!this.scrapingBeeKey) {
      throw new Error('ScrapingBee API key not configured');
    }

    try {
      const response = await fetch(
        `https://app.scrapingbee.com/api/v1/?api_key=${this.scrapingBeeKey}&url=${encodeURIComponent(url)}&render_js=true&premium_proxy=true`
      );
      
      if (!response.ok) {
        throw new Error(`ScrapingBee API error: ${response.status}`);
      }
      
      const html = await response.text();
      const data = this.parseJobDataFromHTML(html, url);
      
      return {
        success: true,
        data,
        confidence: 0.95,
        apiUsed: 'ScrapingBee'
      };
      
    } catch (error) {
      return {
        success: false,
        error: `ScrapingBee failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        apiUsed: 'ScrapingBee'
      };
    }
  }

  /**
   * Apify LinkedIn Jobs Scraper - Best for LinkedIn
   */
  private async extractWithApify(url: string): Promise<FreeAPIResult> {
    if (!this.apifyKey) {
      throw new Error('Apify API key not configured');
    }

    try {
      const response = await fetch('https://api.apify.com/v2/acts/valig~linkedin-jobs-scraper/runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apifyKey}`
        },
        body: JSON.stringify({
          startUrls: [url],
          maxItems: 1
        })
      });
      
      if (!response.ok) {
        throw new Error(`Apify API error: ${response.status}`);
      }
      
      const runData = await response.json();
      
      // Wait for completion and get results
      const results = await this.waitForApifyResults(runData.data.id);
      
      if (results && results.length > 0) {
        const jobData = this.parseApifyJobData(results[0]);
        return {
          success: true,
          data: jobData,
          confidence: 0.90,
          apiUsed: 'Apify'
        };
      } else {
        throw new Error('No results from Apify');
      }
      
    } catch (error) {
      return {
        success: false,
        error: `Apify failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        apiUsed: 'Apify'
      };
    }
  }

  /**
   * FreeWebAPI - Multi-site job search
   */
  private async extractWithFreeWebAPI(url: string): Promise<FreeAPIResult> {
    if (!this.freeWebAPIKey) {
      throw new Error('FreeWebAPI key not configured');
    }

    try {
      // Extract search terms from URL
      const searchTerms = this.extractSearchTermsFromURL(url);
      
      const response = await fetch(
        `https://freewebapi.com/api/job-search?keyword=${encodeURIComponent(searchTerms.keyword)}&location=${encodeURIComponent(searchTerms.location)}&api_key=${this.freeWebAPIKey}`
      );
      
      if (!response.ok) {
        throw new Error(`FreeWebAPI error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.jobs && data.jobs.length > 0) {
        const jobData = this.parseFreeWebAPIData(data.jobs[0]);
        return {
          success: true,
          data: jobData,
          confidence: 0.85,
          apiUsed: 'FreeWebAPI'
        };
      } else {
        throw new Error('No jobs found in FreeWebAPI response');
      }
      
    } catch (error) {
      return {
        success: false,
        error: `FreeWebAPI failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        apiUsed: 'FreeWebAPI'
      };
    }
  }

  /**
   * Hybrid approach - Try multiple APIs
   */
  private async extractWithHybrid(url: string): Promise<FreeAPIResult> {
    const apis = [
      () => this.extractWithScrapingBee(url),
      () => this.extractWithApify(url),
      () => this.extractWithFreeWebAPI(url)
    ];

    for (const api of apis) {
      try {
        const result = await api();
        if (result.success && result.confidence && result.confidence > 0.8) {
          return result;
        }
      } catch (error) {
        console.warn('API failed, trying next:', error);
      }
    }

    return {
      success: false,
      error: 'All free APIs failed',
      apiUsed: 'Hybrid'
    };
  }

  /**
   * Fallback extraction using existing methods
   */
  private async extractWithFallback(url: string): Promise<FreeAPIResult> {
    // This would integrate with your existing extraction service
    // For now, return a basic result
    return {
      success: false,
      error: 'Free APIs not available, please use manual entry',
      apiUsed: 'Fallback'
    };
  }

  /**
   * Parse job data from HTML content
   */
  private parseJobDataFromHTML(html: string, url: string): Partial<CreateJobApplication> {
    const data: Partial<CreateJobApplication> = {};

    // Extract company name
    const companyMatch = html.match(/<[^>]*class="[^"]*company[^"]*"[^>]*>([^<]+)<\/[^>]*>/i) ||
                        html.match(/<[^>]*class="[^"]*employer[^"]*"[^>]*>([^<]+)<\/[^>]*>/i);
    if (companyMatch) {
      data.company = companyMatch[1].trim();
    }

    // Extract job title
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                      html.match(/<[^>]*class="[^"]*job-title[^"]*"[^>]*>([^<]+)<\/[^>]*>/i);
    if (titleMatch) {
      data.position = titleMatch[1].trim();
    }

    // Extract salary
    const salaryMatch = html.match(/\$[\d,]+(?:k|K)?(?:\s*-\s*\$[\d,]+(?:k|K)?)?/g);
    if (salaryMatch) {
      data.salary = salaryMatch[0];
    }

    // Extract description
    const descMatch = html.match(/<[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/i);
    if (descMatch) {
      data.notes = descMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 1000);
    }

    // Set job URL
    data.job_url = url;

    return data;
  }

  /**
   * Parse Apify job data
   */
  private parseApifyJobData(apifyData: any): Partial<CreateJobApplication> {
    return {
      company: apifyData.companyName || apifyData.company,
      position: apifyData.jobTitle || apifyData.title,
      salary: apifyData.salary || apifyData.compensation,
      notes: apifyData.description || apifyData.jobDescription,
      job_url: apifyData.jobUrl || apifyData.url
    };
  }

  /**
   * Parse FreeWebAPI job data
   */
  private parseFreeWebAPIData(jobData: any): Partial<CreateJobApplication> {
    return {
      company: jobData.company,
      position: jobData.title,
      salary: jobData.salary,
      notes: jobData.description,
      job_url: jobData.url
    };
  }

  /**
   * Parse RapidAPI JSearch job data
   */
  private parseRapidAPIJobData(jobData: any): Partial<CreateJobApplication> {
    return {
      company: jobData.employer_name,
      position: jobData.job_title,
      salary: jobData.job_salary || jobData.salary,
      notes: jobData.job_description,
      job_url: jobData.job_apply_link || jobData.job_url
    };
  }

  /**
   * Find matching job from RapidAPI results
   */
  private findMatchingJob(jobs: any[], targetUrl: string): any | null {
    const targetDomain = this.extractDomain(targetUrl);
    
    // Try to find exact URL match
    const exactMatch = jobs.find(job => 
      job.job_apply_link === targetUrl || 
      job.job_url === targetUrl
    );
    
    if (exactMatch) return exactMatch;
    
    // Try to find domain match
    const domainMatch = jobs.find(job => {
      const jobDomain = this.extractDomain(job.job_apply_link || job.job_url || '');
      return jobDomain === targetDomain;
    });
    
    if (domainMatch) return domainMatch;
    
    // Return first job as fallback
    return jobs[0] || null;
  }

  /**
   * Wait for Apify results
   */
  private async waitForApifyResults(runId: string): Promise<any[]> {
    const maxAttempts = 10;
    const delay = 2000; // 2 seconds

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`https://api.apify.com/v2/acts/valig~linkedin-jobs-scraper/runs/${runId}/dataset/items`, {
          headers: {
            'Authorization': `Bearer ${this.apifyKey}`
          }
        });

        if (response.ok) {
          const results = await response.json();
          if (results && results.length > 0) {
            return results;
          }
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        console.warn('Waiting for Apify results:', error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Apify results timeout');
  }

  /**
   * Extract search terms from URL
   */
  private extractSearchTermsFromURL(url: string): { keyword: string; location: string } {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract job title from URL path
    const jobTitle = pathname.split('/').pop()?.replace(/[-_]/g, ' ') || 'Software Engineer';
    
    // Extract location from URL parameters or path
    const location = urlObj.searchParams.get('location') || 
                    pathname.match(/jobs-in-([^/]+)/)?.[1]?.replace(/[-_]/g, ' ') || 
                    'Remote';

    return {
      keyword: jobTitle,
      location: location
    };
  }

  /**
   * Select best API for domain
   */
  private selectBestAPI(domain: string): string {
    // RapidAPI JSearch is great for most job sites
    if (this.rapidAPIKey) {
      return 'rapidapi';
    }
    
    // Fallback to specific APIs
    if (domain.includes('indeed.com')) return 'scrapingbee';
    if (domain.includes('linkedin.com')) return 'apify';
    if (domain.includes('glassdoor.com')) return 'freewebapi';
    if (domain.includes('ziprecruiter.com')) return 'freewebapi';
    if (domain.includes('monster.com')) return 'freewebapi';
    
    return 'hybrid'; // Try multiple APIs
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
   * Check API availability
   */
  getAPIAvailability(): Record<string, boolean> {
    return {
      rapidapi: !!this.rapidAPIKey,
      scrapingbee: !!this.scrapingBeeKey,
      apify: !!this.apifyKey,
      freewebapi: !!this.freeWebAPIKey
    };
  }

  /**
   * Get API usage statistics
   */
  getUsageStats(): Record<string, any> {
    // This would track API usage in a real implementation
    return {
      rapidapi: { requests: 0, limit: 500 }, // RapidAPI free tier
      scrapingbee: { requests: 0, limit: 1000 },
      apify: { runs: 0, limit: 1000 },
      freewebapi: { requests: 0, limit: 100 }
    };
  }
}

export const freeAPIService = new FreeAPIService();
