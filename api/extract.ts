// /api/extract.ts
// This code runs on a server, NOT the browser.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';
import OpenAI from 'openai'; // NEW: For AI extraction

// NEW: Initialize OpenAI client (only if needed for fallback)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the structure of the data we expect to return
interface ExtractedJobData {
  company: string;
  position: string;
  salary?: string;
  hourlyRate?: string;
  jobDescription?: string; // NEW
  location?: string; // NEW
  employmentType?: string; // NEW
  jobUrl?: string;
  error?: string;
}

// Main handler for the serverless function
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Get the job URL from the query parameter (e.g., /api/extract?url=...)
  const jobURL = req.query.url as string;
  if (!jobURL) {
    return res.status(400).json({ error: 'URL parameter is required.' });
  }
  // Validate URL format
  try {
    new URL(jobURL);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format.' });
  }
  try {
    console.log('🔍 Serverless extraction for:', jobURL);

    // Enhanced headers for maximum compatibility and accuracy
    const { data: html } = await axios.get(jobURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 15000, // Increased timeout for better reliability
      maxRedirects: 5, // Allow redirects
      validateStatus: (status) => status < 500, // Accept redirects and client errors
    });

    // AI-ONLY EXTRACTION: Use OpenAI for maximum accuracy
    console.log('🤖 Using AI-only extraction for maximum accuracy');
    console.log('📄 HTML content length:', html.length);
    
    const extracted = await tryAIExtraction(html, jobURL);
    
    // Log extraction results for debugging
    console.log('📊 Extraction results:', {
      company: extracted.company,
      position: extracted.position,
      salary: extracted.salary,
      hourlyRate: extracted.hourlyRate,
      location: extracted.location,
      employmentType: extracted.employmentType,
      hasError: !!extracted.error
    });

    if (extracted.error) {
      console.error('❌ Extraction failed:', extracted.error);
      return res.status(500).json(extracted);
    }

    console.log('✅ Extraction successful');
    return res.status(200).json(extracted);

  } catch (error: any) {
    console.error('Scraping error:', error);
    // Provide more specific error messages (unchanged)
    if (error.code === 'ENOTFOUND') {
      return res.status(404).json({ error: 'Website not found. Please check the URL.' });
    } else if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Request timeout. The website took too long to respond.' });
    } else if (error.response?.status === 403) {
      return res.status(403).json({ error: 'Access denied. The website blocked our request.' });
    } else if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Page not found. Please check the URL.' });
    }
    return res.status(500).json({ error: 'Failed to fetch or parse the job URL.' });
  }
}

// AI-ONLY EXTRACTION: Enhanced for maximum accuracy and detailed extraction
async function tryAIExtraction(html: string, jobURL: string): Promise<ExtractedJobData> {
  try {
    // Pre-process HTML to focus on job-relevant content for better accuracy
    const processedHTML = preprocessHTMLForJobExtraction(html);
    const contentToAnalyze = processedHTML.substring(0, 30000); // Increased for maximum accuracy

    // Optimized prompt for maximum accuracy job data extraction
    const prompt = `
      You are an expert job data extractor with 99% accuracy. Analyze the following HTML content from a job posting page and extract job information with maximum precision.
      
      EXTRACTION RULES - Follow these EXACTLY:
      
      1. COMPANY NAME (CRITICAL ACCURACY):
      - Look for: company name in title tags, meta tags, headers, job posting content
      - Extract: The exact company name (not "Company Name" or generic text)
      - Clean: Remove "Careers", "Jobs", "Hiring", "Job Boards" from company names
      - IMPORTANT: Look for the actual company name, not the job board or platform name
      - Examples: 
        ✅ "Harmonic" (not "Job Boards" or "Greenhouse")
        ✅ "IBM" (not "IBM Careers" or "Avature")
        ✅ "Google" (not "Google Careers" or "LinkedIn")
        ❌ "Job Boards" (platform name, not company)
        ❌ "Greenhouse" (job board, not company)
        ❌ "Avature" (platform, not company)
      
      2. JOB POSITION/TITLE (CRITICAL ACCURACY):
      - Look for: job titles in <h1>, <h2>, title tags, meta tags, job posting headers, breadcrumbs
      - Extract: The exact job title as written in the job posting
      - Clean: Remove company names, locations, job IDs, and extra text from titles
      - Focus on: Main job title, not variations or descriptions
      - IMPORTANT: Look for actual job titles, NOT generic words like "job", "position", "career", "Job Detail"
      - Look for specific roles: "Engineer", "Manager", "Analyst", "Developer", "Designer", "Coordinator", "Intern"
      - Examples: 
        ✅ "Software Engineer Intern (Summer '26)"
        ✅ "Software Engineer Intern- Entry Level Sales Program 2026"
        ✅ "Senior Software Engineer" 
        ✅ "Product Manager" 
        ✅ "Data Scientist"
        ✅ "Marketing Coordinator"
        ✅ "UX Designer"
        ❌ "Senior Software Engineer at Google"
        ❌ "Product Manager - Remote"
        ❌ "Data Scientist (Full-time)"
        ❌ "Job" (too generic)
        ❌ "Position" (too generic)
        ❌ "Job Detail" (too generic)
        ❌ "Career Opportunity" (too generic)
      
      3. COMPENSATION DETECTION (SALARY OR HOURLY - MAXIMUM ACCURACY):
      - Look for: salary ranges, compensation, pay, wage, rate, earnings, benefits sections
      - Search in: job descriptions, benefits sections, requirements, salary information, job postings
      - Extract: Exact compensation as written (don't modify, calculate, or assume)
      
      SALARY DETECTION (Annual/Yearly - AGGRESSIVE SEARCH):
      - Look for: "$XX,XXX", "$XXk", "XXk", "per year", "annually", "yearly", "salary range"
      - Patterns: "$80,000", "$90k", "80k-120k", "100K-150K", "six figures"
      - Context: "annual salary", "yearly compensation", "base salary", "starting salary"
      - Ranges: "$XX,XXX - $XX,XXX", "$XXk-$XXk", "XXk-XXk"
      - CRITICAL: Look for numbers like "100,000", "100K", "100k", "100000"
      - Look for: "100,000", "150,000", "200,000", "100K", "150K", "200K"
      - Examples:
        ✅ "$80,000 - $120,000 per year"
        ✅ "$90k-$110k annually" 
        ✅ "Salary: $75,000-$95,000"
        ✅ "Base salary: $100,000"
        ✅ "Compensation: $85k-$105k"
        ✅ "Starting at $70,000"
        ✅ "Six-figure salary"
        ✅ "100,000 - 150,000"
        ✅ "100K-150K"
        ✅ "Salary range: 80,000-120,000"
        ✅ "~$10,000/month" (monthly salary)
        ✅ "64,100.00 - 149,500.00" (salary range with decimals)
        ✅ "Pay is around ~$10,000/month"
        ✅ "Projected Minimum Salary per year 64,100.00"
        ✅ "Projected Maximum Salary per year 149,500.00"
      
      HOURLY RATE DETECTION (AGGRESSIVE SEARCH):
      - Look for: "$XX/hour", "$XX/hr", "XX/hour", "per hour", "hourly", "wage"
      - Patterns: "$25/hour", "$20-$30/hr", "25-35 per hour", "hourly rate"
      - Context: "hourly wage", "hourly rate", "pay rate", "starting rate"
      - Ranges: "$XX-$XX/hour", "$XX-$XX/hr", "XX-XX per hour"
      - CRITICAL: Look for numbers like "25", "30", "35" followed by "hour", "hr", "per hour"
      - Look for: "25/hour", "30/hr", "35 per hour", "20-30/hour", "25-35/hr"
      - Examples:
        ✅ "$25 - $35 per hour"
        ✅ "$20-$30/hour"
        ✅ "Rate: $22/hour"
        ✅ "Hourly wage: $18-$25"
        ✅ "Starting at $15/hour"
        ✅ "Pay: $28/hr"
        ✅ "Hourly rate: $20-$28"
        ✅ "25-35 per hour"
        ✅ "30/hour"
        ✅ "Rate: 25-30/hr"
      
      AVOID THESE (Too Vague):
      ❌ "Competitive salary" (no specific amount)
      ❌ "Based on experience" (no specific amount)
      ❌ "Market rate" (no specific amount)
      ❌ "Negotiable" (no specific amount)
      ❌ "DOE" (Depends on Experience - no specific amount)
      
      4. JOB DESCRIPTION:
      - Look for: job requirements, responsibilities, qualifications in job content
      - Extract: Key job description details (2-3 sentences max)
      - Focus: What the role involves, key requirements, not generic text
      
      5. LOCATION:
      - Look for: job location in headers, job content, meta tags
      - Extract: City, state, or "Remote" as written
      - Examples: "San Francisco, CA", "New York, NY", "Remote", "Hybrid"
      
      6. EMPLOYMENT TYPE:
      - Look for: "Full-time", "Part-time", "Contract", "Temporary", "Internship"
      - Extract: Employment type as written
      - Default: "Full-time" if not specified
      
      ACCURACY REQUIREMENTS:
      - Extract ONLY what is explicitly stated in the job posting
      - Do NOT make assumptions or add information not present
      - Do NOT calculate or convert between salary and hourly rates
      - Return null for fields that are genuinely not found
      - Be precise with company names and job titles
      
      EXTRACTION TECHNIQUES FOR MAXIMUM ACCURACY:
      
      FOR POSITION/TITLE:
      - Look in <h1> tags first (most important)
      - Check meta tags: og:title, twitter:title
      - Look for breadcrumb navigation
      - Search for "Job Title:", "Position:", "Role:" labels
      - Avoid generic titles like "Job Opening", "Career Opportunity", "Job Detail"
      - Look for specific job titles with roles like: Engineer, Manager, Analyst, Developer, Designer, Coordinator, Specialist, Director, Lead, Senior, Junior, Intern
      - Extract the actual job title, not generic words like "job", "position", "career", "opportunity", "Job Detail"
      - Look for titles that describe what the person does: "Software Engineer", "Marketing Manager", "Data Analyst"
      - For Greenhouse jobs: Look for the main heading after "Back to jobs"
      - For IBM/Avature jobs: Look for the job title in the main content area
      
      FOR COMPANY NAME:
      - Look for the actual company name, not the job board platform
      - Avoid: "Greenhouse", "Avature", "LinkedIn", "Job Boards", "Indeed"
      - Look for: Company name in the job posting content, not the platform
      - For Greenhouse: Look for company name in the job posting, not "Greenhouse"
      - For IBM: Look for "IBM" or "International Business Machines", not "Avature"
      
      FOR COMPENSATION (AGGRESSIVE SEARCH):
      - Search for specific patterns: "$XX,XXX", "$XXk", "XX/hour"
      - Look for salary sections, benefits, compensation details
      - Check for salary ranges: "$XX,XXX - $XX,XXX"
      - Find hourly rates: "$XX/hour", "XX/hr", "hourly rate"
      - Look for context clues: "annual salary", "hourly wage"
      - Search in job requirements, benefits, and description sections
      - CRITICAL: Look for ANY number that could be salary: "100,000", "100K", "100k", "100000"
      - Look for ANY number that could be hourly: "25", "30", "35" followed by "hour", "hr"
      - Search the ENTIRE job posting content for these patterns
      - Don't give up easily - compensation is often hidden in job descriptions
      - Look for monthly salaries: "~$10,000/month", "Pay is around ~$10,000/month"
      - Look for salary ranges with decimals: "64,100.00 - 149,500.00"
      - Look for projected salaries: "Projected Minimum Salary per year", "Projected Maximum Salary per year"
      - Look for compensation in job descriptions: "Pay is around", "Salary range", "Compensation"
      
      COMPENSATION PATTERNS TO LOOK FOR:
      
      SALARY PATTERNS (High Priority):
      - Exact amounts: "$80,000", "$90,000", "$100,000"
      - K notation: "$80k", "$90k", "$100k", "80k", "90k", "100k"
      - Ranges: "$80,000 - $120,000", "$90k-$110k", "80k-120k", "100K-150K"
      - Annual context: "per year", "annually", "yearly", "annual salary"
      - Base salary: "base salary", "starting salary", "base pay"
      - Six figures: "six-figure", "six figure", "100k+", "100K+"
      
      HOURLY PATTERNS (High Priority):
      - Exact rates: "$25/hour", "$30/hour", "$35/hour"
      - Range rates: "$20-$30/hour", "$25-$35/hour", "$20-$30/hr"
      - Hourly context: "per hour", "hourly", "/hr", "hourly rate", "hourly wage"
      - Pay rate: "pay rate", "starting rate", "hourly pay"
      - Wage context: "wage", "hourly wage", "starting wage"
      
      CONTEXT PHRASES (Look for these):
      - Salary: "salary range", "compensation", "base salary", "annual salary"
      - Hourly: "hourly rate", "pay rate", "hourly wage", "starting rate"
      - Benefits: "Benefits:", "Compensation:", "Salary:", "Rate:", "Pay:"
      - Sections: "Salary Information", "Compensation Details", "Pay & Benefits"
      
      ADVANCED PATTERN DETECTION:
      - Look for numbers followed by: "k", "K", "thousand", "per year", "annually"
      - Look for numbers followed by: "per hour", "hourly", "/hr", "hourly rate"
      - Check for currency symbols: "$", "USD", "dollars"
      - Look for ranges: "XX-XX", "XX to XX", "XX - XX"
      - Check for context words: "salary", "wage", "rate", "pay", "compensation"
      
      Return ONLY a valid JSON object with these exact fields:
      {
        "company": "string or null",
        "position": "string or null", 
        "salary": "string or null",
        "hourlyRate": "string or null",
        "jobDescription": "string or null",
        "location": "string or null",
        "employmentType": "string or null"
      }

      HTML content to analyze:
      \`\`\`html
      ${contentToAnalyze}
      \`\`\`
    `;

    // Call OpenAI with optimized settings for maximum accuracy
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0, // Zero temperature for maximum consistency and accuracy
      max_tokens: 800, // Optimized for concise, accurate extraction
      top_p: 0.1, // Focus on most likely tokens for accuracy
    });

    const result = response.choices[0].message?.content;
    if (!result) {
      throw new Error('AI did not return a valid result.');
    }

    const jsonData = JSON.parse(result);
    
    // Return the extracted data as-is for maximum accuracy
    return { ...jsonData, jobUrl: jobURL };
  } catch (error) {
    console.error('AI Extraction error:', error);
    return { company: '', position: '', error: 'AI extraction failed. Please fill manually.', jobUrl: jobURL };
  }
}

// HTML preprocessing function to focus on job-relevant content for better accuracy
function preprocessHTMLForJobExtraction(html: string): string {
  try {
    const $ = cheerio.load(html);
    
    // Remove script and style tags that don't contain job data
    $('script:not([type="application/ld+json"])').remove();
    $('style').remove();
    $('noscript').remove();
    
    // Focus on job-relevant sections with emphasis on compensation
    const jobSections = [
      'h1, h2, h3', // Headers (likely to contain job titles)
      '[class*="job"]', // Elements with "job" in class name
      '[class*="position"]', // Elements with "position" in class name
      '[class*="title"]', // Elements with "title" in class name
      '[class*="salary"]', // Elements with "salary" in class name
      '[class*="compensation"]', // Elements with "compensation" in class name
      '[class*="benefits"]', // Benefits sections
      '[class*="requirements"]', // Requirements sections
      '[class*="description"]', // Description sections
      '[class*="pay"]', // Elements with "pay" in class name
      '[class*="rate"]', // Elements with "rate" in class name
      '[class*="wage"]', // Elements with "wage" in class name
      '[class*="hourly"]', // Elements with "hourly" in class name
      '[class*="annual"]', // Elements with "annual" in class name
      '[id*="salary"]', // Elements with "salary" in ID
      '[id*="compensation"]', // Elements with "compensation" in ID
      '[id*="benefits"]', // Elements with "benefits" in ID
      'meta[property="og:title"]', // Open Graph titles
      'meta[name="twitter:title"]', // Twitter titles
      'title' // Page titles
    ];
    
    // Extract job-relevant content
    let jobContent = '';
    jobSections.forEach(selector => {
      $(selector).each((_, element) => {
        const text = $(element).text().trim();
        if (text && text.length > 0) {
          jobContent += text + '\n';
        }
      });
    });
    
    // Also extract JSON-LD structured data (very reliable)
    $('script[type="application/ld+json"]').each((_, element) => {
      const jsonContent = $(element).html();
      if (jsonContent) {
        jobContent += '\n--- JSON-LD ---\n' + jsonContent + '\n';
      }
    });
    
    // Extract compensation-specific content for better accuracy
    const compensationContent = extractCompensationContent($);
    if (compensationContent) {
      jobContent += '\n--- COMPENSATION ---\n' + compensationContent + '\n';
    }
    
    // If we have good job content, use it; otherwise fall back to full HTML
    return jobContent.length > 500 ? jobContent : html;
    
  } catch (error) {
    console.log('HTML preprocessing failed, using original HTML');
    return html;
  }
}

// Extract compensation-specific content for maximum accuracy
function extractCompensationContent($: cheerio.CheerioAPI): string {
  let compensationText = '';
  
  // Look for compensation-related text patterns
  const compensationSelectors = [
    // Direct compensation sections
    '[class*="salary"]', '[class*="compensation"]', '[class*="pay"]', '[class*="rate"]', '[class*="wage"]',
    '[class*="hourly"]', '[class*="annual"]', '[class*="benefits"]',
    // ID-based selectors
    '[id*="salary"]', '[id*="compensation"]', '[id*="pay"]', '[id*="rate"]', '[id*="wage"]',
    '[id*="hourly"]', '[id*="annual"]', '[id*="benefits"]',
    // Text content that might contain compensation
    'p', 'div', 'span', 'li'
  ];
  
  compensationSelectors.forEach(selector => {
    $(selector).each((_, element) => {
      const text = $(element).text().trim();
      
      // Check if text contains compensation patterns (more aggressive)
      if (text && (
        text.includes('$') || 
        text.includes('salary') || 
        text.includes('compensation') || 
        text.includes('pay') || 
        text.includes('rate') || 
        text.includes('wage') || 
        text.includes('hourly') || 
        text.includes('annual') ||
        text.includes('per year') ||
        text.includes('per hour') ||
        text.includes('/hr') ||
        text.includes('k') ||
        text.includes('thousand') ||
        text.includes('month') ||
        text.includes('projected') ||
        text.includes('minimum') ||
        text.includes('maximum') ||
        // Look for number patterns that could be salary
        /\d{1,3}(,\d{3})*/.test(text) || // Numbers like 100,000
        /\d+k/i.test(text) || // Numbers like 100k
        /\d{2,3}\s*(hour|hr|per hour)/i.test(text) || // Numbers like 25 hour
        /\d{4,6}/.test(text) || // 4-6 digit numbers that could be salary
        /\d+\.\d{2}/.test(text) || // Numbers with decimals like 64,100.00
        /~\$\d+/.test(text) || // Numbers like ~$10,000
        /pay is around/i.test(text) || // "Pay is around" phrases
        /projected.*salary/i.test(text) // "Projected salary" phrases
      )) {
        compensationText += text + '\n';
      }
    });
  });
  
  return compensationText.trim();
}

// Helper functions (unchanged: extractSalaryFromText, cleanCompany, cleanTitle)
function extractSalaryFromText(text: string): string {
  const salaryRegex = /\$[\d,.]+(?:\s?k)?(?:\s?-\s?\$\d[,.]+(?:\s?k)?)?(?:\s*\/?\s*(?:per|a)?\s*(?:hour|year|hr|yr))/gi;
  const matches = text.match(salaryRegex);
  return matches ? matches[0] : '';
}

function cleanCompany(text: string): string {
    if (!text) return '';
    return text
      .replace(/[-_]/g, ' ')
      .replace(/\|.*$/,'') // Remove anything after a pipe
      .replace(/Careers/i, '')
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
      .replace(/\|.*$/,'') // Remove company name if separated by a pipe
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