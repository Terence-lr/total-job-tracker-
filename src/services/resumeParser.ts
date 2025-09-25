import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedSkills {
  technicalSkills: string[];
  softSkills: string[];
  tools: string[];
  languages: string[];
  frameworks: string[];
  databases: string[];
  cloudServices: string[];
}

export interface ResumeAnalysis {
  extractedSkills: ExtractedSkills;
  allSkills: string[];
  confidence: number;
  rawText: string;
}

// Comprehensive skill databases
const TECHNICAL_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
  'HTML', 'CSS', 'SQL', 'NoSQL', 'GraphQL', 'REST', 'API', 'JSON', 'XML', 'YAML',
  'Node.js', 'Express.js', 'Django', 'Flask', 'Spring', 'Laravel', 'Ruby on Rails',
  'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby',
  'Redux', 'Vuex', 'MobX', 'Zustand', 'Jotai', 'Recoil',
  'Jest', 'Cypress', 'Selenium', 'Playwright', 'Mocha', 'Chai', 'Enzyme',
  'Webpack', 'Vite', 'Parcel', 'Rollup', 'Babel', 'ESLint', 'Prettier',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Heroku', 'Vercel',
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'CI/CD', 'Jenkins', 'GitHub Actions',
  'Linux', 'Unix', 'Windows', 'macOS', 'Bash', 'Shell', 'PowerShell',
  'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
  'Blockchain', 'Solidity', 'Web3', 'Ethereum', 'Bitcoin', 'Smart Contracts'
];

const SOFT_SKILLS = [
  'Leadership', 'Teamwork', 'Communication', 'Problem Solving', 'Critical Thinking',
  'Time Management', 'Project Management', 'Agile', 'Scrum', 'Kanban', 'Lean',
  'Customer Service', 'Sales', 'Marketing', 'Public Speaking', 'Presentation',
  'Mentoring', 'Training', 'Coaching', 'Collaboration', 'Negotiation',
  'Adaptability', 'Creativity', 'Innovation', 'Strategic Thinking', 'Analytical',
  'Detail Oriented', 'Self Motivated', 'Proactive', 'Results Driven'
];

const TOOLS = [
  'VS Code', 'IntelliJ', 'Eclipse', 'Sublime Text', 'Atom', 'Vim', 'Emacs',
  'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'InDesign',
  'Slack', 'Discord', 'Microsoft Teams', 'Zoom', 'Trello', 'Asana', 'Jira',
  'Confluence', 'Notion', 'Airtable', 'Monday.com', 'Basecamp',
  'Postman', 'Insomnia', 'Swagger', 'GraphQL Playground', 'Apollo Studio',
  'Chrome DevTools', 'Firefox DevTools', 'Safari Web Inspector'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese',
  'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian', 'Dutch', 'Swedish',
  'Norwegian', 'Danish', 'Finnish', 'Polish', 'Czech', 'Hungarian'
];

const FRAMEWORKS = [
  'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby',
  'Express.js', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Laravel',
  'Ruby on Rails', 'ASP.NET', 'Phoenix', 'Rails', 'Sinatra',
  'Bootstrap', 'Tailwind CSS', 'Material-UI', 'Ant Design', 'Chakra UI',
  'Styled Components', 'Emotion', 'CSS Modules', 'Sass', 'Less', 'Stylus'
];

const DATABASES = [
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra',
  'DynamoDB', 'Firebase', 'Supabase', 'PlanetScale', 'Neon', 'Railway',
  'SQLite', 'Oracle', 'SQL Server', 'MariaDB', 'CouchDB', 'Neo4j',
  'InfluxDB', 'TimescaleDB', 'CockroachDB', 'FaunaDB'
];

const CLOUD_SERVICES = [
  'AWS', 'Azure', 'Google Cloud', 'Heroku', 'Vercel', 'Netlify', 'Railway',
  'DigitalOcean', 'Linode', 'Vultr', 'Cloudflare', 'Fastly', 'CDN',
  'S3', 'CloudFront', 'Lambda', 'API Gateway', 'EC2', 'ECS', 'EKS',
  'RDS', 'DynamoDB', 'ElastiCache', 'SQS', 'SNS', 'SES', 'Cognito',
  'Firebase', 'Supabase', 'PlanetScale', 'Neon', 'Railway'
];

// Skill extraction function
export const extractSkillsFromText = (text: string): ExtractedSkills => {
  const lowerText = text.toLowerCase();
  
  const technicalSkills = TECHNICAL_SKILLS.filter(skill => 
    lowerText.includes(skill.toLowerCase()) ||
    lowerText.includes(skill.toLowerCase().replace(/\s+/g, '')) ||
    lowerText.includes(skill.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );

  const softSkills = SOFT_SKILLS.filter(skill => 
    lowerText.includes(skill.toLowerCase()) ||
    lowerText.includes(skill.toLowerCase().replace(/\s+/g, ''))
  );

  const tools = TOOLS.filter(tool => 
    lowerText.includes(tool.toLowerCase()) ||
    lowerText.includes(tool.toLowerCase().replace(/\s+/g, ''))
  );

  const languages = LANGUAGES.filter(lang => 
    lowerText.includes(lang.toLowerCase())
  );

  const frameworks = FRAMEWORKS.filter(framework => 
    lowerText.includes(framework.toLowerCase()) ||
    lowerText.includes(framework.toLowerCase().replace(/\s+/g, ''))
  );

  const databases = DATABASES.filter(db => 
    lowerText.includes(db.toLowerCase()) ||
    lowerText.includes(db.toLowerCase().replace(/\s+/g, ''))
  );

  const cloudServices = CLOUD_SERVICES.filter(service => 
    lowerText.includes(service.toLowerCase()) ||
    lowerText.includes(service.toLowerCase().replace(/\s+/g, ''))
  );

  return {
    technicalSkills,
    softSkills,
    tools,
    languages,
    frameworks,
    databases,
    cloudServices
  };
};

// Calculate confidence score based on skill matches
export const calculateConfidence = (extractedSkills: ExtractedSkills, textLength: number): number => {
  const totalSkills = Object.values(extractedSkills).flat().length;
  const textLengthScore = Math.min(textLength / 1000, 1); // Normalize by text length
  const skillDensity = totalSkills / Math.max(textLength / 100, 1);
  
  return Math.min((textLengthScore + skillDensity) * 50, 100);
};

// Main resume parsing function
export const parseResume = async (file: File): Promise<ResumeAnalysis> => {
  try {
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Validate PDF header
    const uint8Array = new Uint8Array(arrayBuffer);
    const header = Array.from(uint8Array.slice(0, 4))
      .map(byte => String.fromCharCode(byte))
      .join('');
    
    if (!header.startsWith('%PDF')) {
      throw new Error('Invalid PDF: File does not have a valid PDF header');
    }
    
    // Load PDF document with error handling
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: false
    }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + ' ';
      } catch (pageError) {
        console.warn(`Error extracting text from page ${i}:`, pageError);
        // Continue with other pages
      }
    }
    
    // Check if we extracted any text
    if (!fullText.trim()) {
      throw new Error('Failed to parse: No text could be extracted from the PDF. The file might be image-based or password-protected.');
    }

    // Clean up the text
    const cleanedText = fullText
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.]/g, ' ')
      .trim();

    // Extract skills
    const extractedSkills = extractSkillsFromText(cleanedText);
    
    // Combine all skills into one array
    const allSkills = [
      ...extractedSkills.technicalSkills,
      ...extractedSkills.softSkills,
      ...extractedSkills.tools,
      ...extractedSkills.languages,
      ...extractedSkills.frameworks,
      ...extractedSkills.databases,
      ...extractedSkills.cloudServices
    ];

    // Remove duplicates
    const uniqueSkills = Array.from(new Set(allSkills));

    // Calculate confidence
    const confidence = calculateConfidence(extractedSkills, cleanedText.length);

    return {
      extractedSkills,
      allSkills: uniqueSkills,
      confidence,
      rawText: cleanedText
    };

  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume. Please ensure the file is a valid PDF.');
  }
};

// Enhanced skill detection with context awareness
export const detectSkillsWithContext = (text: string): string[] => {
  const detectedSkills: string[] = [];

  // Look for skill sections
  const skillSectionPatterns = [
    /skills?[:\s]*([^.]*)/gi,
    /technical\s+skills?[:\s]*([^.]*)/gi,
    /technologies?[:\s]*([^.]*)/gi,
    /programming\s+languages?[:\s]*([^.]*)/gi,
    /tools?[:\s]*([^.]*)/gi,
    /frameworks?[:\s]*([^.]*)/gi
  ];

  skillSectionPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const skillText = match.replace(/skills?[:\s]*/gi, '').replace(/technical\s+skills?[:\s]*/gi, '');
        const skills = skillText.split(/[,;|•\n]/).map(s => s.trim()).filter(s => s.length > 0);
        detectedSkills.push(...skills);
      });
    }
  });

  // Also use the comprehensive skill extraction
  const extractedSkills = extractSkillsFromText(text);
  const allExtractedSkills = Object.values(extractedSkills).flat();

  // Combine and deduplicate
  const allSkills = Array.from(new Set([...detectedSkills, ...allExtractedSkills]));

  return allSkills;
};
