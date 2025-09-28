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
   * Extract job data from a URL using universal approach
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

      // Try universal extraction first
      const universalResult = await this.extractJobDataUniversal(url);
      
      if (universalResult.success) {
        return universalResult;
      }

      // Fallback to specific portal extraction
      const domain = this.extractDomain(url);
      const portalConfig = this.getPortalConfig(domain);
      
      if (portalConfig) {
        const extractionResult = await this.extractJobData(url, portalConfig);
        return extractionResult;
      }

      // If no specific portal config, try generic extraction
      return await this.extractJobDataGeneric(url);
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

  /**
   * Universal job data extraction that works with any job page
   */
  private async extractJobDataUniversal(url: string): Promise<JobExtractionResult> {
    try {
      console.log('Trying universal extraction for:', url);
      
      // Use a different approach - try to get page title and meta data
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Extract basic information from page title and meta tags
      const jobData = this.extractBasicJobInfo(html, url);
      
      if (jobData.company || jobData.position) {
        return {
          success: true,
          data: jobData,
          confidence: 0.6 // Medium confidence for basic extraction
        };
      }
      
      return {
        success: false,
        error: 'Could not extract basic job information'
      };
    } catch (error) {
      console.error('Universal extraction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Universal extraction failed'
      };
    }
  }

  /**
   * Generic job data extraction for any job page
   */
  private async extractJobDataGeneric(url: string): Promise<JobExtractionResult> {
    try {
      console.log('Trying generic extraction for:', url);
      
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Use enhanced generic extraction
      const jobData = this.extractGenericJobData(html);
      
      // Also try to extract from URL patterns
      const urlData = this.extractFromUrlPatterns(url);
      
      // Merge the data
      const mergedData = {
        ...jobData,
        ...urlData,
        job_url: url
      };
      
      if (mergedData.company || mergedData.position) {
        return {
          success: true,
          data: mergedData,
          confidence: 0.5 // Lower confidence for generic extraction
        };
      }
      
      return {
        success: false,
        error: 'Could not extract job information from this page'
      };
    } catch (error) {
      console.error('Generic extraction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Generic extraction failed'
      };
    }
  }

  /**
   * Extract basic job info from page title and meta tags with improved accuracy
   */
  private extractBasicJobInfo(html: string, url: string): Partial<CreateJobApplication> {
    const jobData: Partial<CreateJobApplication> = {};
    
    // 1. COMPANY NAME EXTRACTION
    jobData.company = this.extractCompanyName(html, url);
    
    // 2. POSITION/JOB TITLE EXTRACTION
    jobData.position = this.extractJobTitle(html, url);
    
    // 3. SALARY/PAY EXTRACTION
    jobData.salary = this.extractSalary(html, url);
    
    // 4. DESCRIPTION/NOTES EXTRACTION
    jobData.notes = this.extractDescription(html, url);
    
    return jobData;
  }

  /**
   * Extract company name with enhanced accuracy and multiple strategies
   */
  private extractCompanyName(html: string, url: string): string {
    console.log('🔍 Extracting company name...');
    
    // Strategy 1: From page title with enhanced patterns
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      const title = titleMatch[1].trim();
      console.log('📄 Page title:', title);
      
      // Enhanced patterns for different title formats
      const patterns = [
        // "Software Engineer at Google" or "Senior Developer at Microsoft"
        /(.+?)\s+at\s+(.+?)(?:\s*[-|]|\s*$)/i,
        // "Google - Software Engineer" or "Microsoft | Senior Developer"
        /^(.+?)\s*[-|]\s*(.+)/i,
        // "Software Engineer @ Google" or "Developer @ Microsoft"
        /(.+?)\s+@\s+(.+)/i,
        // "Google Careers - Software Engineer"
        /^(.+?)\s+Careers\s*[-|]\s*(.+)/i,
        // "Google Jobs - Software Engineer"
        /^(.+?)\s+Jobs\s*[-|]\s*(.+)/i
      ];
      
      for (const pattern of patterns) {
        const match = title.match(pattern);
        if (match && match[1]) {
          const company = match[1].trim();
          if (this.isValidCompanyName(company)) {
            console.log('✅ Company found in title:', company);
            return company;
          }
        }
      }
    }
    
    // Strategy 2: From Open Graph tags
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      const ogTitle = ogTitleMatch[1].trim();
      console.log('📱 OG Title:', ogTitle);
      
      const patterns = [
        /(.+?)\s+at\s+(.+)/i,
        /(.+?)\s+-\s+(.+)/i,
        /(.+?)\s+\|\s+(.+)/i
      ];
      
      for (const pattern of patterns) {
        const match = ogTitle.match(pattern);
        if (match && match[2]) {
          const company = match[2].trim();
          if (this.isValidCompanyName(company)) {
            console.log('✅ Company found in OG title:', company);
            return company;
          }
        }
      }
    }
    
    // Strategy 3: From URL patterns (enhanced)
    const urlCompany = this.extractCompanyFromUrl(url);
    if (urlCompany) {
      console.log('✅ Company found in URL:', urlCompany);
      return urlCompany;
    }
    
    // Strategy 4: From meta tags and structured data
    const metaPatterns = [
      /<meta[^>]*name="company"[^>]*content="([^"]*)"[^>]*>/i,
      /<meta[^>]*property="og:site_name"[^>]*content="([^"]*)"[^>]*>/i,
      /<meta[^>]*name="application-name"[^>]*content="([^"]*)"[^>]*>/i
    ];
    
    for (const pattern of metaPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const company = match[1].trim();
        if (this.isValidCompanyName(company)) {
          console.log('✅ Company found in meta tags:', company);
          return company;
        }
      }
    }
    
    // Strategy 5: From structured data (JSON-LD)
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatch) {
      for (const script of jsonLdMatch) {
        try {
          const jsonContent = script.replace(/<script[^>]*>|<\/script>/gi, '');
          const data = JSON.parse(jsonContent);
          
          if (data['@type'] === 'JobPosting' && data.hiringOrganization && data.hiringOrganization.name) {
            const company = data.hiringOrganization.name.trim();
            if (this.isValidCompanyName(company)) {
              console.log('✅ Company found in structured data:', company);
              return company;
            }
          }
        } catch (e) {
          // Continue to next script
        }
      }
    }
    
    console.log('❌ No company name found');
    return '';
  }

  /**
   * Validate if a string looks like a valid company name
   */
  private isValidCompanyName(name: string): boolean {
    if (!name || name.length < 2 || name.length > 100) return false;
    
    // Remove common suffixes that might be in titles
    const cleanName = name
      .replace(/\s*[-|]\s*.*$/, '') // Remove everything after dash or pipe
      .replace(/\s*Careers?.*$/i, '') // Remove "Careers" suffix
      .replace(/\s*Jobs?.*$/i, '') // Remove "Jobs" suffix
      .replace(/\s*Hiring.*$/i, '') // Remove "Hiring" suffix
      .trim();
    
    // Check if it contains job-related words that shouldn't be in company names
    const jobWords = ['engineer', 'developer', 'manager', 'analyst', 'specialist', 'coordinator', 'director', 'lead', 'senior', 'junior', 'associate', 'assistant', 'consultant', 'advisor', 'architect', 'designer', 'programmer', 'administrator', 'supervisor', 'executive', 'officer', 'representative'];
    const lowerName = cleanName.toLowerCase();
    
    if (jobWords.some(word => lowerName.includes(word))) return false;
    
    // Check if it looks like a company name
    return cleanName.length >= 2 && cleanName.length <= 50;
  }

  /**
   * Extract job title with enhanced accuracy and multiple strategies
   */
  private extractJobTitle(html: string, url: string): string {
    console.log('🔍 Extracting job title...');
    
    // Strategy 1: From page title with enhanced patterns
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      const title = titleMatch[1].trim();
      console.log('📄 Page title:', title);
      
      // Enhanced patterns for different title formats
      const patterns = [
        // "Software Engineer at Google" or "Senior Developer at Microsoft"
        /(.+?)\s+at\s+(.+)/i,
        // "Google - Software Engineer" or "Microsoft | Senior Developer"
        /^(.+?)\s*[-|]\s*(.+)/i,
        // "Software Engineer @ Google" or "Developer @ Microsoft"
        /(.+?)\s+@\s+(.+)/i,
        // "Google Careers - Software Engineer"
        /^(.+?)\s+Careers\s*[-|]\s*(.+)/i,
        // "Google Jobs - Software Engineer"
        /^(.+?)\s+Jobs\s*[-|]\s*(.+)/i
      ];
      
      for (const pattern of patterns) {
        const match = title.match(pattern);
        if (match && match[2]) {
          const jobTitle = match[2].trim();
          if (this.isValidJobTitle(jobTitle)) {
            console.log('✅ Job title found in title:', jobTitle);
            return jobTitle;
          }
        }
      }
      
      // If no pattern matches, use the whole title if it looks like a job title
      if (this.isValidJobTitle(title)) {
        console.log('✅ Job title found (whole title):', title);
        return title;
      }
    }
    
    // Strategy 2: From Open Graph tags
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      const ogTitle = ogTitleMatch[1].trim();
      console.log('📱 OG Title:', ogTitle);
      
      if (this.isValidJobTitle(ogTitle)) {
        console.log('✅ Job title found in OG title:', ogTitle);
        return ogTitle;
      }
    }
    
    // Strategy 3: From h1 tags (most reliable for job titles)
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match && h1Match[1]) {
      const h1Text = h1Match[1].trim();
      console.log('📋 H1 text:', h1Text);
      
      if (this.isValidJobTitle(h1Text)) {
        console.log('✅ Job title found in H1:', h1Text);
        return h1Text;
      }
    }
    
    // Strategy 4: From structured data (JSON-LD)
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatch) {
      for (const script of jsonLdMatch) {
        try {
          const jsonContent = script.replace(/<script[^>]*>|<\/script>/gi, '');
          const data = JSON.parse(jsonContent);
          
          if (data['@type'] === 'JobPosting' && data.title) {
            const jobTitle = data.title.trim();
            if (this.isValidJobTitle(jobTitle)) {
              console.log('✅ Job title found in structured data:', jobTitle);
              return jobTitle;
            }
          }
        } catch (e) {
          // Continue to next script
        }
      }
    }
    
    // Strategy 5: From common job title elements
    const titleElements = [
      /<[^>]*class="[^"]*job-title[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*position[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*role[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi
    ];
    
    for (const pattern of titleElements) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const jobTitle = match[1].trim();
        if (this.isValidJobTitle(jobTitle)) {
          console.log('✅ Job title found in elements:', jobTitle);
          return jobTitle;
        }
      }
    }
    
    console.log('❌ No job title found');
    return '';
  }

  /**
   * Validate if a string looks like a valid job title
   */
  private isValidJobTitle(title: string): boolean {
    if (!title || title.length < 3 || title.length > 100) return false;
    
    // Remove common prefixes/suffixes
    const cleanTitle = title
      .replace(/^(Job\s*:?\s*|Position\s*:?\s*|Role\s*:?\s*)/i, '') // Remove "Job:", "Position:", etc.
      .replace(/\s*[-|]\s*.*$/, '') // Remove everything after dash or pipe
      .replace(/\s*at\s+.*$/i, '') // Remove "at Company" part
      .replace(/\s*@\s+.*$/i, '') // Remove "@ Company" part
      .trim();
    
    // Check if it contains job-related keywords
    const jobKeywords = [
      'engineer', 'developer', 'manager', 'analyst', 'specialist', 'coordinator',
      'director', 'lead', 'senior', 'junior', 'associate', 'assistant',
      'consultant', 'advisor', 'architect', 'designer', 'programmer',
      'administrator', 'supervisor', 'executive', 'officer', 'representative',
      'coordinator', 'technician', 'specialist', 'expert', 'professional'
    ];
    
    const lowerTitle = cleanTitle.toLowerCase();
    const hasJobKeyword = jobKeywords.some(keyword => lowerTitle.includes(keyword));
    
    // Check if it looks like a job title (has job keywords and reasonable length)
    return hasJobKeyword && cleanTitle.length >= 3 && cleanTitle.length <= 80;
  }

  /**
   * Extract salary/pay information with enhanced accuracy and multiple strategies
   */
  private extractSalary(html: string, url: string): string {
    console.log('🔍 Extracting salary information...');
    
    // Strategy 1: Look for salary patterns in the HTML with enhanced patterns
    const salaryPatterns = [
      // Standard salary formats
      /\$[\d,]+(?:k|K)?(?:\s*-\s*\$[\d,]+(?:k|K)?)?/g,
      /\$[\d,]+(?:k|K)?\s*to\s*\$[\d,]+(?:k|K)?/g,
      /\$[\d,]+(?:k|K)?\s*-\s*\$[\d,]+(?:k|K)?/g,
      
      // Annual salary formats
      /[\d,]+(?:k|K)?\s*per\s+year/gi,
      /[\d,]+(?:k|K)?\s*annually/gi,
      /[\d,]+(?:k|K)?\s*per\s+annum/gi,
      /[\d,]+(?:k|K)?\s*yr/gi,
      
      // Hourly rate formats
      /\$[\d,]+(?:\.\d{2})?\s*per\s+hour/gi,
      /\$[\d,]+(?:\.\d{2})?\s*hourly/gi,
      /\$[\d,]+(?:\.\d{2})?\s*\/hr/gi,
      /\$[\d,]+(?:\.\d{2})?\s*\/hour/gi,
      
      // Salary range formats
      /[\d,]+(?:k|K)?\s*-\s*[\d,]+(?:k|K)?/g,
      /[\d,]+(?:k|K)?\s*to\s*[\d,]+(?:k|K)?/g,
      
      // Labeled salary formats
      /salary[:\s]*\$?[\d,]+(?:k|K)?/gi,
      /compensation[:\s]*\$?[\d,]+(?:k|K)?/gi,
      /pay[:\s]*\$?[\d,]+(?:k|K)?/gi,
      /wage[:\s]*\$?[\d,]+(?:k|K)?/gi,
      /rate[:\s]*\$?[\d,]+(?:k|K)?/gi
    ];
    
    for (const pattern of salaryPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        // Return the first match that looks like a salary
        for (const match of matches) {
          if (this.isValidSalary(match)) {
            console.log('✅ Salary found in patterns:', match.trim());
            return match.trim();
          }
        }
      }
    }
    
    // Strategy 2: Look in specific elements with enhanced selectors
    const salaryElements = [
      /<[^>]*class="[^"]*salary[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*compensation[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*pay[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*wage[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*rate[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*benefits[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*remuneration[^"]*"[^>]*>([^<]+)<\/[^>]*>/gi
    ];
    
    for (const pattern of salaryElements) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const salary = match[1].trim();
        if (this.isValidSalary(salary)) {
          console.log('✅ Salary found in elements:', salary);
          return salary;
        }
      }
    }
    
    // Strategy 3: Look in structured data (JSON-LD)
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatch) {
      for (const script of jsonLdMatch) {
        try {
          const jsonContent = script.replace(/<script[^>]*>|<\/script>/gi, '');
          const data = JSON.parse(jsonContent);
          
          if (data['@type'] === 'JobPosting' && data.baseSalary) {
            const salary = data.baseSalary.value?.value || data.baseSalary.value;
            if (salary && this.isValidSalary(salary.toString())) {
              console.log('✅ Salary found in structured data:', salary);
              return salary.toString();
            }
          }
        } catch (e) {
          // Continue to next script
        }
      }
    }
    
    // Strategy 4: Look in data attributes
    const dataAttributes = [
      /data-salary="([^"]*)"/gi,
      /data-pay="([^"]*)"/gi,
      /data-compensation="([^"]*)"/gi,
      /data-rate="([^"]*)"/gi
    ];
    
    for (const pattern of dataAttributes) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const salary = match[1].trim();
        if (this.isValidSalary(salary)) {
          console.log('✅ Salary found in data attributes:', salary);
          return salary;
        }
      }
    }
    
    console.log('❌ No salary information found');
    return '';
  }

  /**
   * Validate if a string looks like a valid salary
   */
  private isValidSalary(salary: string): boolean {
    if (!salary || salary.length < 2) return false;
    
    const cleanSalary = salary.trim();
    
    // Check for common salary patterns
    const salaryPatterns = [
      /^\$[\d,]+(?:k|K)?$/, // $50,000 or $50k
      /^\$[\d,]+(?:k|K)?\s*-\s*\$[\d,]+(?:k|K)?$/, // $50,000 - $70,000
      /^\$[\d,]+(?:k|K)?\s*to\s*\$[\d,]+(?:k|K)?$/, // $50,000 to $70,000
      /^[\d,]+(?:k|K)?\s*per\s+year$/i, // 50k per year
      /^[\d,]+(?:k|K)?\s*annually$/i, // 50k annually
      /^\$[\d,]+(?:\.\d{2})?\s*per\s+hour$/i, // $25.50 per hour
      /^\$[\d,]+(?:\.\d{2})?\s*hourly$/i, // $25.50 hourly
      /^\$[\d,]+(?:\.\d{2})?\s*\/hr$/i, // $25.50/hr
      /^\$[\d,]+(?:\.\d{2})?\s*\/hour$/i, // $25.50/hour
      /^[\d,]+(?:k|K)?\s*-\s*[\d,]+(?:k|K)?$/, // 50k - 70k
      /^[\d,]+(?:k|K)?\s*to\s*[\d,]+(?:k|K)?$/ // 50k to 70k
    ];
    
    return salaryPatterns.some(pattern => pattern.test(cleanSalary));
  }

  /**
   * Extract job description
   */
  private extractDescription(html: string, url: string): string {
    // Strategy 1: From meta description
    const metaMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    if (metaMatch && metaMatch[1]) {
      return metaMatch[1].trim().substring(0, 1000);
    }
    
    // Strategy 2: From Open Graph description
    const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
    if (ogDescMatch && ogDescMatch[1]) {
      return ogDescMatch[1].trim().substring(0, 1000);
    }
    
    // Strategy 3: From content divs
    const contentPatterns = [
      /<[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/gi,
      /<[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/gi
    ];
    
    for (const pattern of contentPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const content = match[1].trim();
        if (content.length > 50 && content.length < 2000) {
          return content.substring(0, 1000);
        }
      }
    }
    
    return '';
  }

  /**
   * Helper function to check if text looks like a job title
   */
  private looksLikeJobTitle(text: string): boolean {
    const jobKeywords = [
      'engineer', 'developer', 'manager', 'analyst', 'specialist', 'coordinator',
      'director', 'lead', 'senior', 'junior', 'associate', 'assistant',
      'consultant', 'advisor', 'architect', 'designer', 'programmer',
      'administrator', 'supervisor', 'executive', 'officer', 'representative'
    ];
    
    const lowerText = text.toLowerCase();
    return jobKeywords.some(keyword => lowerText.includes(keyword)) && 
           text.length > 5 && text.length < 100;
  }

  /**
   * Helper function to check if text looks like a salary
   */
  private looksLikeSalary(text: string): boolean {
    // Check for common salary patterns
    const salaryPatterns = [
      /^\$[\d,]+(?:k|K)?$/,
      /^\$[\d,]+(?:k|K)?\s*-\s*\$[\d,]+(?:k|K)?$/,
      /^[\d,]+(?:k|K)?\s*per\s+year$/i,
      /^[\d,]+(?:k|K)?\s*annually$/i,
      /^[\d,]+(?:k|K)?\s*per\s+hour$/i,
      /^[\d,]+(?:k|K)?\s*hourly$/i
    ];
    
    return salaryPatterns.some(pattern => pattern.test(text.trim()));
  }

  /**
   * Extract company name from URL patterns
   */
  private extractCompanyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      // Extract company from hostname
      if (hostname.includes('greenhouse.io')) {
        const parts = hostname.split('.');
        if (parts.length > 0) {
          return parts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
      } else if (hostname.includes('lever.co')) {
        const parts = hostname.split('.');
        if (parts.length > 0) {
          return parts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
      } else if (hostname.includes('workday.com')) {
        // Extract from subdomain
        const subdomain = hostname.split('.')[0];
        return subdomain.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      } else if (hostname.includes('linkedin.com')) {
        // For LinkedIn, we can't easily extract company from URL
        return '';
      } else if (hostname.includes('indeed.com')) {
        // For Indeed, we can't easily extract company from URL
        return '';
      } else {
        // For company websites, try to extract from subdomain or domain
        const parts = hostname.split('.');
        if (parts.length > 1) {
          const companyPart = parts[0];
          if (companyPart !== 'www' && companyPart !== 'careers' && companyPart !== 'jobs') {
            return companyPart.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          }
        }
      }
      
    } catch (error) {
      console.error('Error extracting company from URL:', error);
    }
    
    return '';
  }

  /**
   * Extract job info from URL patterns
   */
  private extractFromUrlPatterns(url: string): Partial<CreateJobApplication> {
    const jobData: Partial<CreateJobApplication> = {};
    
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const hostname = urlObj.hostname;
      
      // Extract company from hostname
      if (hostname.includes('greenhouse.io')) {
        const parts = hostname.split('.');
        if (parts.length > 0) {
          jobData.company = parts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
      } else if (hostname.includes('lever.co')) {
        const parts = hostname.split('.');
        if (parts.length > 0) {
          jobData.company = parts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
      } else if (hostname.includes('workday.com')) {
        // Extract from subdomain
        const subdomain = hostname.split('.')[0];
        jobData.company = subdomain.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      
      // Extract position from URL path
      const pathParts = pathname.split('/').filter(part => part.length > 0);
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1];
        // If it looks like a job title (contains common job words)
        if (lastPart.includes('-') && (
          lastPart.toLowerCase().includes('engineer') ||
          lastPart.toLowerCase().includes('developer') ||
          lastPart.toLowerCase().includes('manager') ||
          lastPart.toLowerCase().includes('analyst') ||
          lastPart.toLowerCase().includes('specialist')
        )) {
          jobData.position = lastPart.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
      }
      
    } catch (error) {
      console.error('Error extracting from URL patterns:', error);
    }
    
    return jobData;
  }
}

export const jobAutomationService = JobAutomationService.getInstance();
