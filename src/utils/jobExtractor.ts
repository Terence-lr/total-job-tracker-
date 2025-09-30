// src/utils/jobExtractor.ts
// FIXED VERSION - Works with ANY job site (Using Fetch, no dependencies)

export interface ExtractedJobData {
  company: string;
  position: string;
  salary?: string;
  hourlyRate?: string;
  jobUrl?: string;
  error?: string;
}

// Cache successful extractions
const cache = new Map<string, ExtractedJobData>();

/**
 * Main extraction function - tries multiple methods
 */
export const extractJobFromURL = async (
  jobURL: string
): Promise<ExtractedJobData> => {
  // Check cache first
  if (cache.has(jobURL)) {
    console.log('📦 Using cached extraction');
    return cache.get(jobURL)!;
  }

  // Validate URL
  if (!isValidURL(jobURL)) {
    return {
      company: '',
      position: '',
      error: 'Invalid URL format. Please enter a valid job posting URL.'
    };
  }

  try {
    console.log('🔍 Starting extraction for:', jobURL);

    // METHOD 1: Enhanced URL parsing (works instantly, no API needed)
    console.log('🔗 Trying enhanced URL parsing...');
    const urlResult = parseJobFromEnhancedURL(jobURL);
    if (urlResult.company || urlResult.position) {
      console.log('✅ URL parsing successful');
      cache.set(jobURL, urlResult);
      return urlResult;
    }

    // METHOD 2: Try JSearch API with better query building
    if (process.env.REACT_APP_RAPIDAPI_KEY) {
      console.log('📡 Trying JSearch API...');
      const apiResult = await tryJSearchAPI(jobURL);
      if (apiResult.company && apiResult.position) {
        console.log('✅ JSearch API successful');
        cache.set(jobURL, apiResult);
        return apiResult;
      }
    }

    // METHOD 3: Try metadata extraction with multiple proxies
    console.log('🌐 Trying metadata extraction...');
    const metaResult = await tryMetadataWithProxies(jobURL);
    if (metaResult.company || metaResult.position) {
      console.log('✅ Metadata extraction successful');
      cache.set(jobURL, metaResult);
      return metaResult;
    }

    // If we got partial data from any method, return it
    const combined: ExtractedJobData = {
      company: urlResult.company || metaResult.company || '',
      position: urlResult.position || metaResult.position || '',
      salary: urlResult.salary || metaResult.salary,
      hourlyRate: urlResult.hourlyRate || metaResult.hourlyRate,
      jobUrl: jobURL
    };

    if (combined.company || combined.position) {
      combined.error = 'Partial extraction. Please verify and complete missing fields.';
      cache.set(jobURL, combined);
      return combined;
    }

    // All methods failed
    const failResult = {
      company: '',
      position: '',
      error: 'Could not extract automatically. Please fill manually.',
      jobUrl: jobURL
    };
    cache.set(jobURL, failResult);
    return failResult;

  } catch (error) {
    console.error('❌ Extraction error:', error);
    return {
      company: '',
      position: '',
      error: 'Extraction failed. Please fill manually.',
      jobUrl: jobURL
    };
  }
};

/**
 * Enhanced URL parsing with more patterns
 */
function parseJobFromEnhancedURL(jobURL: string): ExtractedJobData {
  try {
    const url = new URL(jobURL);
    const hostname = url.hostname.toLowerCase();
    const pathname = decodeURIComponent(url.pathname).toLowerCase();
    const pathParts = pathname.split('/').filter(p => p.length > 0);
    
    let company = '';
    let position = '';
    let salary = '';

    // LinkedIn
    if (hostname.includes('linkedin.com')) {
      // Format: /jobs/view/[job-id] or /company/[company-name]/jobs
      const viewIndex = pathParts.indexOf('jobs');
      if (viewIndex !== -1) {
        // Try to extract from URL title segment
        const titleSegment = pathParts.find(p => 
          p.includes('-at-') || 
          p.includes('engineer') || 
          p.includes('developer') ||
          p.includes('manager') ||
          p.includes('designer')
        );
        
        if (titleSegment) {
          if (titleSegment.includes('-at-')) {
            const parts = titleSegment.split('-at-');
            position = cleanTitle(parts[0]);
            company = cleanCompany(parts[1]);
          } else {
            position = cleanTitle(titleSegment);
          }
        }
        
        // Extract company from company path
        const companyIndex = pathParts.indexOf('company');
        if (companyIndex !== -1 && pathParts[companyIndex + 1]) {
          company = cleanCompany(pathParts[companyIndex + 1]);
        }
      }
    }
    
    // Indeed
    else if (hostname.includes('indeed.com')) {
      // Format: /viewjob?jk=[id] or /cmp/[company]/jobs
      const cmpIndex = pathParts.indexOf('cmp');
      if (cmpIndex !== -1 && pathParts[cmpIndex + 1]) {
        company = cleanCompany(pathParts[cmpIndex + 1]);
      }
      
      // Try to get from rc parameter in URL
      const params = new URLSearchParams(url.search);
      const rc = params.get('advn');
      if (rc) {
        company = cleanCompany(rc);
      }
    }
    
    // Glassdoor
    else if (hostname.includes('glassdoor.com')) {
      // Format: /job-listing/[position]-[company]-JV_[id]
      const jobListingIndex = pathParts.indexOf('job-listing');
      if (jobListingIndex !== -1 && pathParts[jobListingIndex + 1]) {
        const segment = pathParts[jobListingIndex + 1];
        // Pattern: position-company-JV_id
        const jvIndex = segment.indexOf('-jv');
        if (jvIndex > 0) {
          const beforeJV = segment.substring(0, jvIndex);
          const parts = beforeJV.split('-');
          
          // Usually last 2-3 parts are company
          if (parts.length >= 3) {
            const companyParts = parts.slice(-2).join(' ');
            const positionParts = parts.slice(0, -2).join(' ');
            company = cleanCompany(companyParts);
            position = cleanTitle(positionParts);
          }
        }
      }
    }
    
    // AngelList / Wellfound
    else if (hostname.includes('angel.co') || hostname.includes('wellfound.com')) {
      // Format: /[company]/jobs/[id]-[position]
      if (pathParts.length >= 1) {
        company = cleanCompany(pathParts[0]);
      }
      const jobsIndex = pathParts.indexOf('jobs');
      if (jobsIndex !== -1 && pathParts[jobsIndex + 1]) {
        const jobSegment = pathParts[jobsIndex + 1];
        // Remove ID prefix if present
        const titlePart = jobSegment.replace(/^\d+-/, '');
        position = cleanTitle(titlePart);
      }
    }
    
    // Greenhouse
    else if (hostname.includes('greenhouse.io')) {
      // Format: [company].greenhouse.io or boards.greenhouse.io/[company]
      if (hostname.startsWith('boards.')) {
        company = cleanCompany(pathParts[0]);
      } else {
        const subdomain = hostname.split('.')[0];
        company = cleanCompany(subdomain);
      }
      
      // Position might be in path
      const jobsIndex = pathParts.indexOf('jobs');
      if (jobsIndex !== -1 && pathParts[jobsIndex + 1]) {
        const jobId = pathParts[jobsIndex + 1];
        // Sometimes position is after the ID
        if (pathParts[jobsIndex + 2]) {
          position = cleanTitle(pathParts[jobsIndex + 2]);
        }
      }
    }
    
    // Lever
    else if (hostname.includes('lever.co')) {
      // Format: jobs.lever.co/[company]/[id]
      if (pathParts[0]) {
        company = cleanCompany(pathParts[0]);
      }
      // Position might be in the ID segment
      if (pathParts[1]) {
        const segment = pathParts[1];
        // Remove UUID if present
        const cleaned = segment.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/, '').trim();
        if (cleaned && !cleaned.match(/^[a-f0-9]+$/)) {
          position = cleanTitle(cleaned);
        }
      }
    }
    
    // Workday
    else if (hostname.includes('myworkdayjobs.com')) {
      // Format: [company].wd1.myworkdayjobs.com/[division]/job/[location]/[position]_[id]
      const subdomain = hostname.split('.')[0];
      company = cleanCompany(subdomain);
      
      // Find position in path
      const jobIndex = pathParts.indexOf('job');
      if (jobIndex !== -1 && pathParts[jobIndex + 2]) {
        const posSegment = pathParts[jobIndex + 2];
        // Remove ID suffix
        const posTitle = posSegment.replace(/_R-?\d+.*$/, '');
        position = cleanTitle(posTitle);
      }
    }
    
    // ZipRecruiter
    else if (hostname.includes('ziprecruiter.com')) {
      // Format: /jobs/[company]-[position]-in-[location]
      const jobsIndex = pathParts.indexOf('jobs');
      if (jobsIndex !== -1 && pathParts[jobsIndex + 1]) {
        const segment = pathParts[jobsIndex + 1];
        // Split by -in- for location
        const inIndex = segment.indexOf('-in-');
        if (inIndex > 0) {
          const beforeIn = segment.substring(0, inIndex);
          const parts = beforeIn.split('-');
          if (parts.length >= 2) {
            company = cleanCompany(parts[0]);
            position = cleanTitle(parts.slice(1).join(' '));
          }
        }
      }
    }
    
    // Monster
    else if (hostname.includes('monster.com')) {
      // Format: /job-openings/[position]-[company]-[location]-[id]
      const openingsIndex = pathParts.indexOf('job-openings');
      if (openingsIndex !== -1 && pathParts[openingsIndex + 1]) {
        const segment = pathParts[openingsIndex + 1];
        const parts = segment.split('-');
        
        // Find where ID starts (usually last part with numbers)
        let idStart = parts.length;
        for (let i = parts.length - 1; i >= 0; i--) {
          if (/\d/.test(parts[i])) {
            idStart = i;
            break;
          }
        }
        
        if (idStart > 2) {
          // Assume pattern: position words... company words... location id
          const halfPoint = Math.floor((idStart - 1) / 2);
          position = cleanTitle(parts.slice(0, halfPoint).join(' '));
          company = cleanCompany(parts.slice(halfPoint, idStart - 1).join(' '));
        }
      }
    }
    
    // SimplyHired
    else if (hostname.includes('simplyhired.com')) {
      // Format: /job/[id] with parameters
      const params = new URLSearchParams(url.search);
      const query = params.get('q');
      if (query) {
        position = cleanTitle(query);
      }
    }
    
    // Dice
    else if (hostname.includes('dice.com')) {
      // Format: /job-detail/[company]/[position]/[id]
      const detailIndex = pathParts.indexOf('job-detail');
      if (detailIndex !== -1) {
        if (pathParts[detailIndex + 1]) {
          company = cleanCompany(pathParts[detailIndex + 1]);
        }
        if (pathParts[detailIndex + 2]) {
          const pos = pathParts[detailIndex + 2].replace(/[?#].*$/, '');
          position = cleanTitle(pos);
        }
      }
    }
    
    // CareerBuilder
    else if (hostname.includes('careerbuilder.com')) {
      const jobIndex = pathParts.indexOf('job');
      if (jobIndex !== -1 && pathParts[jobIndex + 1]) {
        // Try to extract from job ID segment
        const segment = pathParts[jobIndex + 1];
        if (segment.includes('-')) {
          const parts = segment.split('-');
          // Remove ID parts (usually start with J or contain only alphanumeric)
          const titleParts = parts.filter(p => 
            !p.match(/^J\d/) && 
            !p.match(/^[A-Z0-9]{10,}$/)
          );
          if (titleParts.length > 0) {
            position = cleanTitle(titleParts.join(' '));
          }
        }
      }
    }

    // BambooHR
    else if (hostname.includes('bamboohr.com')) {
      // Format: [company].bamboohr.com/jobs/view.php?id=[id]
      const subdomain = hostname.split('.')[0];
      company = cleanCompany(subdomain);
    }

    // SmartRecruiters
    else if (hostname.includes('smartrecruiters.com')) {
      // Format: careers.smartrecruiters.com/[company]/[id]
      if (pathParts[0]) {
        company = cleanCompany(pathParts[0]);
      }
    }

    // Workable
    else if (hostname.includes('workable.com')) {
      // Format: apply.workable.com/[company]/j/[id]
      if (pathParts[0]) {
        company = cleanCompany(pathParts[0]);
      }
    }

    // Generic company career pages
    else if (pathname.includes('/careers/') || pathname.includes('/jobs/')) {
      // Try to get company from domain
      const domainParts = hostname.replace('www.', '').split('.');
      if (domainParts.length >= 2) {
        company = cleanCompany(domainParts[0]);
      }
      
      // Try to get position from path
      const careersIndex = Math.max(
        pathParts.indexOf('careers'),
        pathParts.indexOf('jobs')
      );
      
      if (careersIndex !== -1 && pathParts[careersIndex + 1]) {
        const segment = pathParts[careersIndex + 1];
        // Skip if it's just an ID
        if (!segment.match(/^[a-f0-9-]{36}$/) && !segment.match(/^\d+$/)) {
          position = cleanTitle(segment);
        }
      }
    }

    return {
      company,
      position,
      salary,
      jobUrl: jobURL
    };

  } catch (error) {
    console.error('URL parsing error:', error);
    return { company: '', position: '' };
  }
}

/**
 * Try JSearch API with better query construction
 */
async function tryJSearchAPI(jobURL: string): Promise<ExtractedJobData> {
  try {
    const apiKey = process.env.REACT_APP_RAPIDAPI_KEY;
    
    if (!apiKey) {
      console.log('No RapidAPI key found');
      return { company: '', position: '' };
    }

    // Build search query from URL
    const url = new URL(jobURL);
    const pathname = decodeURIComponent(url.pathname);
    const pathParts = pathname.split('/').filter(p => p.length > 2);
    
    // Extract meaningful search terms
    let searchQuery = '';
    
    // Try to find position-like terms
    const positionKeywords = pathParts.find(part => 
      /engineer|developer|manager|designer|analyst|specialist|director|coordinator/i.test(part)
    );
    
    if (positionKeywords) {
      searchQuery = positionKeywords.replace(/[-_]/g, ' ');
    } else if (pathParts.length > 0) {
      // Use last meaningful path segment
      searchQuery = pathParts[pathParts.length - 1]
        .replace(/[-_]/g, ' ')
        .replace(/\d+/g, '')
        .trim();
    }

    if (!searchQuery || searchQuery.length < 3) {
      searchQuery = 'software engineer'; // Fallback
    }

    const queryParams = new URLSearchParams({
      query: searchQuery,
      page: '1',
      num_pages: '1',
      date_posted: 'month'
    });

    const response = await fetch(`https://jsearch.p.rapidapi.com/search?${queryParams}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.log('API rate limit reached');
        return {
          company: '',
          position: '',
          error: 'API limit reached. Using fallback methods.'
        };
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data?.data?.length > 0) {
      const job = data.data[0];
      
      let salary = '';
      let hourlyRate = '';
      
      // Extract salary info
      if (job.job_min_salary && job.job_max_salary) {
        const currency = job.job_salary_currency === 'USD' ? '$' : '';
        salary = `${currency}${job.job_min_salary.toLocaleString()} - ${currency}${job.job_max_salary.toLocaleString()}`;
      }
      
      // Check if it's hourly
      if (job.job_employment_type === 'CONTRACTOR' || job.job_employment_type === 'PARTTIME') {
        if (job.job_min_salary) {
          const hourly = Math.round(job.job_min_salary / 2080);
          hourlyRate = `$${hourly}/hr (estimated)`;
        }
      }

      return {
        company: cleanCompany(job.employer_name || ''),
        position: cleanTitle(job.job_title || ''),
        salary,
        hourlyRate,
        jobUrl: jobURL
      };
    }

    return { company: '', position: '' };

  } catch (error: any) {
    console.error('JSearch API error:', error.message);
    return { company: '', position: '' };
  }
}

/**
 * Try metadata extraction with multiple proxy options
 */
async function tryMetadataWithProxies(jobURL: string): Promise<ExtractedJobData> {
  const proxies = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(jobURL)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(jobURL)}`,
    `https://corsproxy.io/?${encodeURIComponent(jobURL)}`
  ];

  for (const proxyURL of proxies) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(proxyURL, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const responseData = await response.json().catch(() => null);
      if (!responseData) continue;

      const html = typeof responseData === 'string' 
        ? responseData 
        : responseData.contents || '';

      if (!html || html.length < 100) continue;

      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      let company = '';
      let position = '';
      let salary = '';

      // Try meta tags
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
      const pageTitle = doc.querySelector('title')?.textContent || '';
      const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';

      // Extract from title
      const titleText = ogTitle || pageTitle;
      if (titleText) {
        // Common patterns
        if (titleText.includes(' at ')) {
          const parts = titleText.split(' at ');
          position = cleanTitle(parts[0]);
          company = cleanCompany(parts[1].split(/[-|]/)[0]);
        } else if (titleText.includes(' - ')) {
          const parts = titleText.split(' - ');
          if (parts.length >= 2) {
            position = cleanTitle(parts[0]);
            company = cleanCompany(parts[1]);
          }
        } else if (titleText.includes(' | ')) {
          const parts = titleText.split(' | ');
          position = cleanTitle(parts[0]);
          if (parts[1]) company = cleanCompany(parts[1]);
        }
      }

      // Try JSON-LD structured data
      const jsonLdScript = doc.querySelector('script[type="application/ld+json"]');
      if (jsonLdScript) {
        try {
          const jsonData = JSON.parse(jsonLdScript.textContent || '{}');
          
          if (jsonData['@type'] === 'JobPosting') {
            if (jsonData.title) position = cleanTitle(jsonData.title);
            if (jsonData.hiringOrganization?.name) {
              company = cleanCompany(jsonData.hiringOrganization.name);
            }
            if (jsonData.baseSalary?.value) {
              salary = `$${jsonData.baseSalary.value}`;
            }
          }
        } catch {}
      }

      // Look for salary in content
      if (!salary && (html.includes('$') || html.includes('salary'))) {
        const salaryMatch = html.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*(?:K|k|per|\/)\s*(?:year|yr|hour|hr))?/);
        if (salaryMatch) {
          salary = salaryMatch[0];
        }
      }

      if (company || position) {
        return {
          company,
          position,
          salary,
          jobUrl: jobURL
        };
      }

    } catch (error) {
      console.log(`Proxy failed: ${proxyURL.substring(0, 30)}...`);
      continue;
    }
  }

  return { company: '', position: '' };
}

/**
 * Helper functions
 */
function isValidURL(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function cleanCompany(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/[-_]/g, ' ')
    .replace(/\.(com|io|co|net|org)$/i, '')
    .replace(/\b(inc|llc|ltd|corp|corporation|company|technologies|tech|labs|group|solutions)\b/gi, '')
    .replace(/[^\w\s&]/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

function cleanTitle(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/[-_]/g, ' ')
    .replace(/[^\w\s()&,]/g, ' ')
    .replace(/\b(JV_|R-|REQ|JR|SR)\d+\b/gi, '')
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map((word, index) => {
      // Keep common acronyms uppercase
      if (/^(UI|UX|API|SQL|AWS|QA|IT|HR|VP|CEO|CTO|CFO)$/i.test(word)) {
        return word.toUpperCase();
      }
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ')
    .trim();
}

/**
 * Cache management
 */
export const clearExtractionCache = () => {
  cache.clear();
  console.log('🗑️ Cache cleared');
};

export const getCacheStats = () => {
  return {
    size: cache.size,
    entries: Array.from(cache.entries()).map(([url, data]) => ({
      url,
      hasCompany: !!data.company,
      hasPosition: !!data.position
    }))
  };
};