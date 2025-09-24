import React, { useState } from 'react';

interface ResumeImportProps {
  onAccept: (skills: string[]) => void;
}

const ResumeImport: React.FC<ResumeImportProps> = ({ onAccept }) => {
  const [suggested, setSuggested] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Simple keyword extraction for demo
  const KNOWN_SKILLS = [
    "javascript", "typescript", "react", "next.js", "node", "express", 
    "sql", "postgres", "mongodb", "aws", "docker", "kubernetes", 
    "python", "java", "git", "css", "html", "tailwind", "vue", "angular",
    "php", "ruby", "go", "rust", "c++", "c#", ".net", "spring", "django",
    "flask", "laravel", "rails", "mysql", "redis", "elasticsearch",
    "graphql", "rest", "api", "microservices", "ci/cd", "jenkins",
    "terraform", "ansible", "linux", "ubuntu", "centos", "nginx",
    "apache", "kubernetes", "helm", "prometheus", "grafana"
  ];

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    
    setLoading(true);
    
    try {
      // For demo purposes, we'll simulate PDF parsing
      // In a real app, you'd send this to a server endpoint
      const text = await simulatePDFExtraction(f);
      const suggestedSkills = extractSkillsFromText(text);
      setSuggested(suggestedSkills);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Simulate PDF text extraction
  async function simulatePDFExtraction(file: File): Promise<string> {
    // In a real implementation, you'd use a PDF parsing library
    // For demo, we'll return some sample text
    return `
      John Doe - Software Engineer
      
      Skills: JavaScript, TypeScript, React, Node.js, Python, SQL, AWS, Docker
      
      Experience:
      - 5 years of full-stack development
      - React and Vue.js frontend development
      - Node.js and Express backend development
      - PostgreSQL and MongoDB database management
      - AWS cloud services and deployment
      - Docker containerization
      - Git version control
      - RESTful API design
      - Microservices architecture
      
      Education: Computer Science Degree
    `;
  }

  function extractSkillsFromText(text: string): string[] {
    const lowerText = text.toLowerCase();
    const foundSkills = KNOWN_SKILLS.filter(skill => 
      lowerText.includes(skill.toLowerCase())
    );
    return Array.from(new Set(foundSkills)); // Remove duplicates
  }

  return (
    <div className="card stack" style={{["--stack-gap" as any]: "var(--s-4)"}}>
      <h2 className="h4" style={{ margin: 0 }}>Import Resume (PDF)</h2>
      <input 
        type="file" 
        accept="application/pdf" 
        onChange={upload}
        style={{
          padding: "12px",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          background: "var(--elev)",
          color: "var(--text)",
          width: "100%"
        }}
      />
      {loading && <p>Parsing…</p>}
      {!!suggested.length && (
        <>
          <p>Suggested skills from resume:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {suggested.map(s => (
              <span 
                key={s} 
                style={{ 
                  padding: "6px 10px", 
                  borderRadius: "999px", 
                  border: "1px solid var(--border)",
                  background: "var(--elev)"
                }}
              >
                {s}
              </span>
            ))}
          </div>
          <div className="btn-row">
            <button 
              className="btn btn-primary" 
              onClick={() => onAccept(suggested)}
            >
              Add to My Skills
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ResumeImport;


