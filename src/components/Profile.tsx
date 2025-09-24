import React, { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '../lib/supabase';

const Profile: React.FC = () => {
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUserProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserProfile = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      
      setUser(currentUser);
      
      // Get or create profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        await createProfile(currentUser);
      } else if (profile) {
        setSkills(profile.skills || []);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const createProfile = async (user: any) => {
    const { error } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: user.id,
          skills: []
        }
      ]);
    
    if (error) console.error('Error creating profile:', error);
  };

  const addSkill = async () => {
    if (!newSkill.trim() || !user) return;
    
    const updatedSkills = [...skills, newSkill.trim()];
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ skills: updatedSkills })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setSkills(updatedSkills);
      setNewSkill('');
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const removeSkill = async (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ skills: updatedSkills })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setSkills(updatedSkills);
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>
      
      {/* Resume Upload Section */}
      <div className="bg-gray-900 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Import Resume (PDF)</h3>
        <input 
          type="file" 
          accept=".pdf" 
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
        />
      </div>

      {/* Skills Section */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Your Skills</h3>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill (e.g., React, SQL)"
            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            className="flex-1 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button 
            onClick={addSkill}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Add
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill, index) => (
            <div key={index} className="flex items-center bg-red-600 text-white px-3 py-1 rounded-full">
              <span className="mr-2">{skill}</span>
              <button 
                onClick={() => removeSkill(skill)}
                className="text-red-200 hover:text-white font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        {skills.length > 0 && (
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            onClick={() => alert('Skills saved successfully!')}
          >
            Save Skills
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
