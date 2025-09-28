import { JobApplication, CreateJobApplication } from '../types/job';
import { createJobApplication } from './enhancedJobService';

export interface JobExtractionResult {
  success: boolean;
  data?: Partial<CreateJobApplication>;
  error?: string;
  confidence?: number;
}

export interface JobPortalConfig {
  name: string;
  domain: string;
  selectors: {
    title: string;
    company: string;
    description: string;
    location?: string;
    salary?: string;
    requirements?: string;
  };
}

// Popular job portal configurations
const JOB_PORTAL_CONFIGS: JobPortalConfig[] = [
  {
    name: 'LinkedIn',
    domain: 'linkedin.com',
    selectors: {
      title: 'h1[data-test-id="job-title"], .job-details-jobs-unified-top-card__job-title',
      company: '.job-details-jobs-unified-top-card__company-name, [data-test-id="job-details-company-name"]',
      description: '.jobs-description-content__text, .jobs-box__html-content',
      location: '.job-details-jobs-unified-top-card__bullet, [data-test-id="job-details-location"]',
      salary: '.job-details-jobs-unified-top-card__salary, [data-test-id="job-details-salary"]'
    }
  },
  {
    name: 'Indeed',
    domain: 'indeed.com',
    selectors: {
      title: '[data-testid="job-title"], .jobsearch-JobInfoHeader-title',
      company: '[data-testid="company-name"], .jobsearch-CompanyInfoContainer',
      description: '[data-testid="job-description"], .jobsearch-jobDescriptionText',
      location: '[data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle',
      salary: '[data-testid="job-salary"], .jobsearch-JobMetadataHeader-salary'
    }
  },
  {
    name: 'Glassdoor',
    domain: 'glassdoor.com',
    selectors: {
      title: '[data-test="job-title"], .JobDetails_jobTitle__',
      company: '[data-test="employer-name"], .JobDetails_employerName__',
      description: '[data-test="job-description"], .JobDetails_jobDescription__',
      location: '[data-test="job-location"], .JobDetails_jobLocation__',
      salary: '[data-test="job-salary"], .JobDetails_salary__'
    }
  },
  {
    name: 'AngelList',
    domain: 'angel.co',
    selectors: {
      title: '.job-title, h1',
      company: '.company-name, .startup-name',
      description: '.job-description, .job-details',
      location: '.job-location, .location',
      salary: '.job-salary, .compensation'
    }
  },
  {
    name: 'Remote.co',
    domain: 'remote.co',
    selectors: {
      title: '.job_title, h1',
      company: '.company_name, .company',
      description: '.job_description, .job-details',
      location: '.job_location, .location',
      salary: '.job_salary, .compensation'
    }
  }
];

export class JobAutomationService {
  private static instance: JobAutomationService;
  private proxyUrl: string;

  constructor() {
    // Use a CORS proxy for web scraping
    this.proxyUrl = 'https://api.allorigins.win/raw?url=';
  }

  static getInstance(): JobAutomationService {
    if (!JobAutomationService.instance) {
      JobAutomationService.instance = new JobAutomationService();
    }
    return JobAutomationService.instance;
  }

  /**
   * Extract job data from a URL
   */
  async extractJobFromUrl(url: string): Promise<JobExtractionResult> {
    try {
      console.log('Extracting job data from URL:', url);
      
      // Validate URL
      if (!this.isValidUrl(url)) {
        return {
          success: false,
          error: 'Invalid URL format'
        };
      }

      // Get the domain to determine the portal
      const domain = this.extractDomain(url);
      const portalConfig = this.getPortalConfig(domain);
      
      if (!portalConfig) {
        return {
          success: false,
          error: 'Unsupported job portal'
        };
      }

      // Extract data using the appropriate method
      const extractionResult = await this.extractJobData(url, portalConfig);
      
      return extractionResult;
    } catch (error) {
      console.error('Error extracting job from URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Extract job data from email content
   */
  async extractJobFromEmail(emailContent: string): Promise<JobExtractionResult> {
    try {
      console.log('Extracting job data from email content');
      
      // Use AI-powered extraction for email content
      const extractedData = await this.extractJobDataFromText(emailContent);
      
      return {
        success: true,
        data: extractedData,
        confidence: 0.8
      };
    } catch (error) {
      console.error('Error extracting job from email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract job data from email'
      };
    }
  }

  /**
   * Extract job data from text content using AI
   */
  async extractJobDataFromText(text: string): Promise<Partial<CreateJobApplication>> {
    // This would integrate with an AI service like OpenAI or local NLP
    // For now, we'll use pattern matching and heuristics
    
    const jobData: Partial<CreateJobApplication> = {};
    
    // Extract company name (common patterns)
    const companyPatterns = [
      /(?:at|@)\s+([A-Z][a-zA-Z\s&.,]+?)(?:\s|$|,|\.)/gi,
      /Company:\s*([^\n\r]+)/gi,
      /Employer:\s*([^\n\r]+)/gi
    ];
    
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        jobData.company = match[1].trim();
        break;
      }
    }
    
    // Extract job title
    const titlePatterns = [
      /(?:Position|Role|Title):\s*([^\n\r]+)/gi,
      /Job Title:\s*([^\n\r]+)/gi,
      /We are looking for a\s+([^\n\r]+)/gi
    ];
    
    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        jobData.position = match[1].trim();
        break;
      }
    }
    
    // Extract salary
    const salaryPatterns = [
      /\$[\d,]+(?:k|K)?(?:\s*-\s*\$[\d,]+(?:k|K)?)?/g,
      /(?:Salary|Compensation):\s*([^\n\r]+)/gi,
      /(?:Pay|Wage):\s*([^\n\r]+)/gi
    ];
    
    for (const pattern of salaryPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        jobData.salary = match[1].trim();
        break;
      }
    }
    
    // Extract location (store in notes for now since location field doesn't exist)
    const locationPatterns = [
      /(?:Location|Based in|Office):\s*([^\n\r]+)/gi,
      /(?:Remote|Hybrid|On-site)/gi
    ];
    
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        jobData.notes = (jobData.notes || '') + `\nLocation: ${match[1].trim()}`;
        break;
      }
    }
    
    // Use the full text as description if no specific description found
    if (!jobData.notes) {
      jobData.notes = text.substring(0, 1000); // Limit to first 1000 characters
    }
    
    return jobData;
  }

  /**
   * Get supported job portals
   */
  getSupportedPortals(): string[] {
    return JOB_PORTAL_CONFIGS.map(config => config.name);
  }

  /**
   * Check if a URL is from a supported job portal
   */
  isSupportedPortal(url: string): boolean {
    const domain = this.extractDomain(url);
    return JOB_PORTAL_CONFIGS.some(config => domain.includes(config.domain));
  }

  /**
   * Extract and save job directly to backend
   */
  async extractAndSaveJob(url: string): Promise<JobExtractionResult> {
    try {
      const extractionResult = await this.extractJobFromUrl(url);
      
      if (extractionResult.success && extractionResult.data) {
        // Ensure required fields are present
        const jobData: CreateJobApplication = {
          company: extractionResult.data.company || '',
          position: extractionResult.data.position || '',
          date_applied: new Date().toISOString().split('T')[0],
          status: 'Applied',
          job_url: url,
          salary: extractionResult.data.salary || '',
          notes: extractionResult.data.notes || '',
          job_description: extractionResult.data.job_description || '',
          offers: extractionResult.data.offers || '',
          withdrawn: false,
          ...extractionResult.data
        };

        // Save to backend using existing service
        const jobId = await createJobApplication(jobData);
        
        return {
          success: true,
          data: { ...jobData },
          confidence: extractionResult.confidence
        };
      }
      
      return extractionResult;
    } catch (error) {
      console.error('Error extracting and saving job:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract and save job'
      };
    }
  }

  /**
   * Extract and save job from email content
   */
  async extractAndSaveJobFromEmail(emailContent: string): Promise<JobExtractionResult> {
    try {
      const extractionResult = await this.extractJobFromEmail(emailContent);
      
      if (extractionResult.success && extractionResult.data) {
        // Ensure required fields are present
        const jobData: CreateJobApplication = {
          company: extractionResult.data.company || '',
          position: extractionResult.data.position || '',
          date_applied: new Date().toISOString().split('T')[0],
          status: 'Applied',
          salary: extractionResult.data.salary || '',
          notes: extractionResult.data.notes || '',
          job_description: extractionResult.data.job_description || '',
          offers: extractionResult.data.offers || '',
          withdrawn: false,
          ...extractionResult.data
        };

        // Save to backend using existing service
        const jobId = await createJobApplication(jobData);
        
        return {
          success: true,
          data: { ...jobData },
          confidence: extractionResult.confidence
        };
      }
      
      return extractionResult;
    } catch (error) {
      console.error('Error extracting and saving job from email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract and save job from email'
      };
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return '';
    }
  }

  private getPortalConfig(domain: string): JobPortalConfig | null {
    return JOB_PORTAL_CONFIGS.find(config => domain.includes(config.domain)) || null;
  }

  private async extractJobData(url: string, config: JobPortalConfig): Promise<JobExtractionResult> {
    try {
      // Use a CORS proxy to fetch the page
      const proxyUrl = `${this.proxyUrl}${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Parse the HTML and extract data using selectors
      const extractedData = this.parseHtmlWithSelectors(html, config.selectors);
      
      return {
        success: true,
        data: extractedData,
        confidence: this.calculateConfidence(extractedData)
      };
    } catch (error) {
      console.error('Error extracting job data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract job data'
      };
    }
  }

  private parseHtmlWithSelectors(html: string, selectors: JobPortalConfig['selectors']): Partial<CreateJobApplication> {
    const jobData: Partial<CreateJobApplication> = {};
    
    // Enhanced HTML parsing with multiple strategies
    const extractText = (selector: string, html: string): string | null => {
      // Strategy 1: Try CSS selector patterns
      const cssPatterns = [
        new RegExp(`<[^>]*class="[^"]*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"[^>]*>([^<]+)<\/[^>]*>`, 'gi'),
        new RegExp(`<[^>]*id="[^"]*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"[^>]*>([^<]+)<\/[^>]*>`, 'gi')
      ];
      
      for (const pattern of cssPatterns) {
        const match = html.match(pattern);
        if (match && match[1] && match[1].trim().length > 0) {
          return match[1].trim();
        }
      }
      
      // Strategy 2: Generic content extraction
      return this.extractGenericContent(html, selector);
    };
    
    // Extract data using selectors
    if (selectors.title) {
      const title = extractText(selectors.title, html);
      if (title) jobData.position = title.trim();
    }
    
    if (selectors.company) {
      const company = extractText(selectors.company, html);
      if (company) jobData.company = company.trim();
    }
    
    if (selectors.description) {
      const description = extractText(selectors.description, html);
      if (description) jobData.notes = description.trim();
    }
    
    if (selectors.location) {
      const location = extractText(selectors.location, html);
      if (location) jobData.notes = (jobData.notes || '') + `\nLocation: ${location.trim()}`;
    }
    
    if (selectors.salary) {
      const salary = extractText(selectors.salary, html);
      if (salary) jobData.salary = salary.trim();
    }
    
    // Fallback: Try generic extraction if specific selectors didn't work
    if (!jobData.company || !jobData.position) {
      const genericData = this.extractGenericJobData(html);
      if (!jobData.company && genericData.company) jobData.company = genericData.company;
      if (!jobData.position && genericData.position) jobData.position = genericData.position;
      if (!jobData.notes && genericData.notes) jobData.notes = genericData.notes;
      if (!jobData.salary && genericData.salary) jobData.salary = genericData.salary;
    }
    
    return jobData;
  }

  private extractGenericContent(html: string, fieldType: string): string | null {
    // Remove script and style tags
    const cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Common patterns for different field types
    const patterns = {
      title: [
        /<h1[^>]*>([^<]+)<\/h1>/gi,
        /<h2[^>]*>([^<]+)<\/h2>/gi,
        /<title[^>]*>([^<]+)<\/title>/gi,
        /<[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
        /<[^>]*class="[^"]*job-title[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi
      ],
      company: [
        /<[^>]*class="[^"]*company[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
        /<[^>]*class="[^"]*employer[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
        /<[^>]*class="[^"]*organization[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
        /<[^>]*class="[^"]*brand[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi
      ],
      description: [
        /<[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/gi,
        /<[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/gi,
        /<[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/gi
      ],
      salary: [
        /<[^>]*class="[^"]*salary[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
        /<[^>]*class="[^"]*compensation[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
        /<[^>]*class="[^"]*pay[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
        /\$[\d,]+(?:k|K)?(?:\s*-\s*\$[\d,]+(?:k|K)?)?/g
      ]
    };
    
    const fieldPatterns = patterns[fieldType as keyof typeof patterns] || [];
    
    for (const pattern of fieldPatterns) {
      const match = cleanHtml.match(pattern);
      if (match && match[1] && match[1].trim().length > 0) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  private extractGenericJobData(html: string): Partial<CreateJobApplication> {
    const jobData: Partial<CreateJobApplication> = {};
    
    // Extract title from various sources
    const titlePatterns = [
      /<h1[^>]*>([^<]+)<\/h1>/gi,
      /<h2[^>]*>([^<]+)<\/h2>/gi,
      /<title[^>]*>([^<]+)<\/title>/gi
    ];
    
    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].trim().length > 2) {
        jobData.position = match[1].trim();
        break;
      }
    }
    
    // Extract company from various sources
    const companyPatterns = [
      /<[^>]*class="[^"]*company[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*employer[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*brand[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi
    ];
    
    for (const pattern of companyPatterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].trim().length > 2) {
        jobData.company = match[1].trim();
        break;
      }
    }
    
    // Extract description
    const descPatterns = [
      /<[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/gi
    ];
    
    for (const pattern of descPatterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].trim().length > 10) {
        jobData.notes = match[1].trim().substring(0, 1000); // Limit length
        break;
      }
    }
    
    // Extract salary
    const salaryPattern = /\$[\d,]+(?:k|K)?(?:\s*-\s*\$[\d,]+(?:k|K)?)?/g;
    const salaryMatch = html.match(salaryPattern);
    if (salaryMatch && salaryMatch[0]) {
      jobData.salary = salaryMatch[0];
    }
    
    return jobData;
  }

  private calculateConfidence(data: Partial<CreateJobApplication>): number {
    let score = 0;
    const fields = ['company', 'position', 'notes'];
    
    fields.forEach(field => {
      if (data[field as keyof CreateJobApplication]) {
        score += 1;
      }
    });
    
    return score / fields.length;
  }
}

export const jobAutomationService = JobAutomationService.getInstance();
