import React from 'react';
import SkillsEditor from './SkillsEditor';
import ResumeImport from './ResumeImport';

const Profile: React.FC = () => {
  const userId = "demo"; // TODO: replace with authed user id

  async function accept(skills: string[]) {
    const saved = localStorage.getItem(`profile_${userId}`);
    const current = saved ? JSON.parse(saved) : { skills: [] };
    const merged = Array.from(new Set([
      ...(current.skills || []).map((s: any) => s.name?.toLowerCase?.() || s),
      ...skills
    ])).map(n => ({ name: n }));
    
    const profile = { userId, skills: merged };
    localStorage.setItem(`profile_${userId}`, JSON.stringify(profile));
    alert('Added suggested skills');
  }

  return (
    <main className="container section stack">
      <h1 className="page-title">Profile</h1>
      <ResumeImport onAccept={accept} />
      <SkillsEditor userId={userId} />
    </main>
  );
};

export default Profile;
