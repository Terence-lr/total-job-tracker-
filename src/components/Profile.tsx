import React, { useState, useEffect } from 'react';
import SkillsEditor from './SkillsEditor';
import ResumeImport from './ResumeImport';
import { profileService } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  async function accept(skills: string[]) {
    try {
      await profileService.updateSkills(skills);
      alert('Skills saved successfully!');
      loadProfile(); // Reload profile data
    } catch (error) {
      console.error('Error saving skills:', error);
      alert('Failed to save skills');
    }
  }

  if (loading) {
    return <div className="text-white p-8">Loading profile...</div>;
  }

  return (
    <main className="container section stack">
      <h1 className="page-title">Profile</h1>
      <ResumeImport onAccept={accept} />
      <SkillsEditor userId={user?.id || ''} />
    </main>
  );
};

export default Profile;
