// src/utils/jobExtractor.ts

import axios from 'axios';

export interface ExtractedJobData {
  company: string;
  position: string;
  salary?: string;
  hourlyRate?: string;
  jobUrl?: string;
  error?: string;
}

interface JSearchJob {
  employer_name: string;
  job_title: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_description?: string;
  job_apply_link?: string;
  job_employment_type?: string;
}

/**
 * Main extraction function - tries multiple methods in order
 */
export const extractJobFromURL = async (
  jobURL: string
): Promise<ExtractedJobData> => {
  // Validate URL format
  if (!isValidURL(jobURL)) {
    return {
      company: '',
      position: '',
      error: 'Invalid URL format. Please enter a valid job posting URL.'
    };
  }

  try {
    // METHOD 1: Try JSearch API first (most reliable)
    const jSearchResult = await tryJSearchExtraction(jobURL);
    if (jSearchResult.company && jSearchResult.position) {
      return jSearchResult;
    }

    // METHOD 2: Fallback to metadata scraping
    const metadataResult = await tryMetadataExtraction(jobURL);
    if (metadataResult.company && metadataResult.position) {
      return metadataResult;
    }

    // METHOD 3: Try URL parsing as last resort
    const urlParseResult = parseJobInfoFromURL(jobURL);
    if (urlParseResult.company || urlParseResult.position) {
      return {
        ...urlParseResult,
        error: 'Partial extraction. Please verify and fill missing fields.'
      };
    }

    // All methods failed
    return {
      company: '',
      position: '',
      error: 'Could not extract job details automatically. Please fill manually.'
    };
  } catch (error) {
    console.error('Job extraction error:', error);
    return {
      company: '',
      position: '',
      error: 'Extraction failed. Please try again or fill manually.'
    };
  }
};

/**
 * METHOD 1: JSearch API extraction
 */
async function tryJSearchExtraction(
  jobURL: string
): Promise<ExtractedJobData> {
  try {
    // Build a smart search query from the URL
    const searchQuery = buildSearchQueryFromURL(jobURL);

    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: {
        query: searchQuery,
        page: '1',
        num_pages: '1',
        date_posted: 'month' // Recent jobs for better accuracy
      },
      headers: {
        'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      },
      timeout: 10000 // 10 second timeout
    };

    const response = await axios.request(options);

    if (response.data?.data && response.data.data.length > 0) {
      const job: JSearchJob = response.data.data[0]; // Take first result (most relevant)

      return {
        company: cleanText(job.employer_name),
        position: cleanText(job.job_title),
        salary: extractSalary(job),
        hourlyRate: extractHourlyRate(job),
        jobUrl: jobURL
      };
    }

    return { company: '', position: '' };
  } catch (error: any) {
    // Handle rate limiting gracefully
    if (error.response?.status === 429) {
      console.warn('JSearch rate limit hit');
    }
    return { company: '', position: '' };
  }
}

/**
 * METHOD 2: Metadata extraction via CORS proxy
 */
async function tryMetadataExtraction(
  jobURL: string
): Promise<ExtractedJobData> {
  try {
    // Use AllOrigins as CORS proxy (free, no API key needed)
    const proxyURL = `https://api.allorigins.win/get?url=${encodeURIComponent(
      jobURL
    )}`;

    const response = await axios.get(proxyURL, { timeout: 8000 });

    if (!response.data?.contents) {
      return { company: '', position: '' };
    }

    const html = response.data.contents;

    // Extract company and position from common meta tags and JSON-LD
    const company = extractFromHTML(html, [
      // Open Graph tags
      /<meta[^>]*property="og:site_name"[^>]*content="([^"]*)"/i,
      // Twitter tags
      /<meta[^>]*name="twitter:site"[^>]*content="([^"]*)"/i,
      // JSON-LD structured data
      /"hiringOrganization"[^}]*"name"[^:]*:[^"]*"([^"]*)"/i,
      /"organization"[^}]*"name"[^:]*:[^"]*"([^"]*)"/i,
      // Common job board patterns
      /<span[^>]*class="[^"]*company[^"]*"[^>]*>([^<]*)</i
    ]);

    const position = extractFromHTML(html, [
      // Open Graph tags
      /<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i,
      // JSON-LD structured data
      /"title"[^:]*:[^"]*"([^"]*)"/i,
      /"jobTitle"[^:]*:[^"]*"([^"]*)"/i,
      // H1 tags (often contain job title)
      /<h1[^>]*>([^<]*)<\/h1>/i
    ]);

    const salary = extractFromHTML(html, [
      // JSON-LD structured data
      /"baseSalary"[^}]*"value"[^:]*:[^"]*"([^"]*)"/i,
      // Salary ranges in text
      /\$[\d,]+ *(?:-|to) *\$[\d,]+/i,
      /\$[\d,]+K *(?:-|to) *\$[\d,]+K/i
    ]);

    return {
      company: company ? cleanText(company) : '',
      position: position ? cleanText(position) : '',
      salary: salary ? cleanText(salary) : undefined,
      jobUrl: jobURL
    };
  } catch (error) {
    console.warn('Metadata extraction failed:', error);
    return { company: '', position: '' };
  }
}

/**
 * METHOD 3: Parse job info directly from URL structure
 */
function parseJobInfoFromURL(jobURL: string): ExtractedJobData {
  try {
    const url = new URL(jobURL);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname;

    let company = '';
    let position = '';

    // Extract company from hostname
    if (hostname.includes('greenhouse.io')) {
      // Greenhouse format: company.greenhouse.io
      company = hostname.split('.')[0];
    } else if (hostname.includes('lever.co')) {
      // Lever format: jobs.lever.co/company
      const match = pathname.match(/\/([^/]+)/);
      company = match ? match[1] : '';
    } else if (hostname.includes('workday.com')) {
      // Workday format varies
      const match = pathname.match(/\/([^/]+)/);
      company = match ? match[1] : '';
    } else {
      // Try to extract from domain
      const domainParts = hostname.replace('www.', '').split('.');
      if (domainParts.length >= 2) {
        company = domainParts[0];
      }
    }

    // Try to extract position from URL path
    const pathSegments = pathname
      .split('/')
      .filter(segment => segment.length > 0);

    // Look for segments that might be job titles
    const jobTitlePatterns = [
      /engineer/i,
      /developer/i,
      /manager/i,
      /analyst/i,
      /designer/i,
      /specialist/i,
      /coordinator/i,
      /director/i,
      /senior/i,
      /junior/i,
      /lead/i
    ];

    for (const segment of pathSegments) {
      const decodedSegment = decodeURIComponent(segment);
      if (
        jobTitlePatterns.some(pattern => pattern.test(decodedSegment)) &&
        decodedSegment.length < 100
      ) {
        position = decodedSegment
          .replace(/[-_]/g, ' ')
          .replace(/\+/g, ' ')
          .trim();
        break;
      }
    }

    return {
      company: company ? capitalizeWords(company) : '',
      position: position ? capitalizeWords(position) : '',
      jobUrl: jobURL
    };
  } catch (error) {
    return { company: '', position: '' };
  }
}

/**
 * Build smart search query from job URL
 */
function buildSearchQueryFromURL(jobURL: string): string {
  try {
    const url = new URL(jobURL);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    // Extract query parameters that might contain job info
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const keywords = searchParams.get('keywords') || '';
    const title = searchParams.get('title') || searchParams.get('position') || '';

    // Build search query
    let searchTerms: string[] = [];

    // Add extracted params
    if (query) searchTerms.push(query);
    if (keywords) searchTerms.push(keywords);
    if (title) searchTerms.push(title);

    // Add company name if detectable
    if (hostname.includes('greenhouse.io')) {
      const company = hostname.split('.')[0];
      searchTerms.push(company);
    } else if (hostname.includes('lever.co')) {
      const companyMatch = pathname.match(/\/([^/]+)/);
      if (companyMatch) searchTerms.push(companyMatch[1]);
    }

    // Add position-like terms from path
    const pathSegments = pathname.split('/').filter(s => s.length > 2);
    const positionSegment = pathSegments.find(segment =>
      /engineer|developer|manager|analyst|designer/i.test(segment)
    );
    if (positionSegment) {
      searchTerms.push(decodeURIComponent(positionSegment).replace(/[-_]/g, ' '));
    }

    // If we have good search terms, use them
    if (searchTerms.length > 0) {
      return searchTerms.join(' ').substring(0, 200); // Limit query length
    }

    // Fallback: use last meaningful path segment
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment && lastSegment.length > 3) {
      return decodeURIComponent(lastSegment)
        .replace(/[-_]/g, ' ')
        .substring(0, 100);
    }

    // Last resort: generic search
    return 'software engineer jobs';
  } catch (error) {
    return 'recent job postings';
  }
}

/**
 * Extract salary information from JSearch job data
 */
function extractSalary(job: JSearchJob): string | undefined {
  if (job.job_min_salary && job.job_max_salary) {
    const currency = job.job_salary_currency === 'USD' ? '$' : '';
    const min = job.job_min_salary.toLocaleString();
    const max = job.job_max_salary.toLocaleString();
    return `${currency}${min} - ${currency}${max}`;
  }

  // Try to parse from description
  if (job.job_description) {
    const salaryMatch = job.job_description.match(
      /\$[\d,]+ *(?:-|to) *\$[\d,]+(?:\s*(?:per year|annually|\/year))?/i
    );
    if (salaryMatch) {
      return salaryMatch[0];
    }
  }

  return undefined;
}

/**
 * Extract hourly rate from JSearch job data
 */
function extractHourlyRate(job: JSearchJob): string | undefined {
  if (!job.job_description) return undefined;

  // Look for hourly rate patterns
  const hourlyMatch = job.job_description.match(
    /\$[\d.]+ *(?:-|to)? *(?:\$[\d.]+)? *(?:per hour|\/hr|hourly|\/hour)/i
  );

  if (hourlyMatch) {
    return hourlyMatch[0];
  }

  // If part-time and we have yearly salary, estimate hourly
  if (
    job.job_employment_type === 'PARTTIME' &&
    job.job_min_salary &&
    job.job_min_salary > 0
  ) {
    const estimatedHourly = (job.job_min_salary / 2080).toFixed(2);
    return `~$${estimatedHourly}/hr (estimated)`;
  }

  return undefined;
}

/**
 * Helper: Extract text from HTML using multiple regex patterns
 */
function extractFromHTML(html: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Helper: Validate URL format
 */
function isValidURL(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Helper: Clean extracted text
 */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, '') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[""]/g, '"') // Normalize quotes
    .trim();
}

/**
 * Helper: Capitalize words
 */
function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
