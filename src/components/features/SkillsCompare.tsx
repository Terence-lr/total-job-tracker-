import React from 'react';

interface SkillsCompareProps {
  userSkills: string[];
  jobKeywords: string[];
}

const SkillsCompare: React.FC<SkillsCompareProps> = ({ userSkills, jobKeywords }) => {
  const setU = new Set(userSkills.map(s => s.toLowerCase()));
  const matches = jobKeywords.filter(k => setU.has(k.toLowerCase()));
  const missing = jobKeywords.filter(k => !setU.has(k.toLowerCase()));

  const chip = (txt: string, kind: "match" | "miss") => (
    <span 
      key={kind + txt} 
      style={{
        padding: "6px 10px", 
        borderRadius: "999px",
        background: kind === "match" ? "rgba(16,185,129,.18)" : "rgba(225,29,72,.18)",
        border: `1px solid ${kind === "match" ? "#118f6b" : "#e11d48"}`,
        color: kind === "match" ? "#10b981" : "#ef4444"
      }}
    >
      {txt}
    </span>
  );

  return (
    <div className="card stack" style={{["--stack-gap" as any]: "var(--s-4)"}}>
      <h3 className="h4" style={{ margin: 0 }}>Compare: Your Skills vs Job Keywords</h3>
      <div><strong>Matches</strong></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {matches.map(m => chip(m, "match"))}
      </div>
      <div><strong>Missing</strong></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {missing.map(m => chip(m, "miss"))}
      </div>
    </div>
  );
};

export default SkillsCompare;
