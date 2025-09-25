import React, { useEffect, useState } from 'react';
import type { Skill, Profile } from '../types/profile';
import { useNotification } from '../contexts/NotificationContext';

interface SkillsEditorProps {
  userId: string;
}

const SkillsEditor: React.FC<SkillsEditorProps> = ({ userId }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const { showSuccess } = useNotification();

  useEffect(() => {
    // For now, use localStorage as a simple storage
    const saved = localStorage.getItem(`profile_${userId}`);
    if (saved) {
      const profile: Profile = JSON.parse(saved);
      setSkills(profile.skills || []);
    }
  }, [userId]);

  const add = () => {
    if (!newSkill.trim()) return;
    setSkills(prev => [...prev, { name: newSkill.trim() }]);
    setNewSkill('');
  };

  async function save() {
    const profile: Profile = { userId, skills };
    localStorage.setItem(`profile_${userId}`, JSON.stringify(profile));
    showSuccess('Skills Saved', 'Your skills have been saved successfully!');
  }

  return (
    <div className="card stack" style={{["--stack-gap" as any]: "var(--s-4)"}}>
      <h2 className="h4" style={{ margin: 0 }}>Your Skills</h2>
      <div className="input" style={{ gridTemplateColumns: '28px 1fr 28px' }}>
        <span className="input__icon">➕</span>
        <input 
          value={newSkill} 
          onChange={e => setNewSkill(e.target.value)} 
          placeholder="Add a skill (e.g., React, SQL)"
          onKeyPress={e => e.key === 'Enter' && add()}
        />
        <button 
          className="input__icon cursor-halo"
          onClick={add}
          type="button"
        >
          ✓
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {skills.map((s, i) => (
          <span 
            key={i} 
            style={{ 
              padding: "6px 10px", 
              borderRadius: "999px", 
              border: "1px solid var(--border)",
              background: "var(--elev)"
            }}
          >
            {s.name}
            <button 
              style={{ marginLeft: 8, background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }} 
              onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={save}>Save Skills</button>
      </div>
    </div>
  );
};

export default SkillsEditor;
