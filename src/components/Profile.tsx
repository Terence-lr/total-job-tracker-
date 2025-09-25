import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Profile: React.FC = () => {
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserProfile = async () => {
    try {
      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        console.error('Error getting user:', userError);
        return;
      }

      setUser(currentUser);
      console.log('Current user:', currentUser);

      // Get or create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('Creating new profile...');
          await createProfile(currentUser);
        } else {
          console.error('Error loading profile:', profileError);
        }
      } else if (profile) {
        console.log('Profile loaded:', profile);
        setSkills(profile.skills || []);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const createProfile = async (user: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            user_id: user.id,
            email: user.email,
            skills: []
          }
        ])
        .select();
      
      if (error) {
        console.error('Error creating profile:', error);
      } else {
        console.log('Profile created successfully:', data);
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
    }
  };

  const addSkill = async () => {
    if (!newSkill.trim() || !user) {
      console.log('Invalid skill or no user');
      return;
    }
    
    // Avoid duplicate skills
    if (skills.includes(newSkill.trim())) {
      alert('Skill already exists!');
      return;
    }

    const updatedSkills = [...skills, newSkill.trim()];
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ skills: updatedSkills })
        .eq('id', user.id)
        .select();

      if (error) {
        console.error('Error updating skills:', error);
        
        // Handle specific policy errors
        if (error.code === '42501') {
          alert('Permission denied. Please make sure you are logged in.');
        } else if (error.code === 'PGRST116') {
          alert('Profile not found. Creating profile...');
          await createProfile(user);
          // Retry after creating profile
          await addSkill();
          return;
        } else {
          alert('Failed to add skill: ' + error.message);
        }
      } else {
        console.log('Skills updated successfully:', data);
        setSkills(updatedSkills);
        setNewSkill('');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const removeSkill = async (skillToRemove: string) => {
    if (!user) return;

    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ skills: updatedSkills })
        .eq('id', user.id)
        .select();

      if (error) {
        console.error('Error removing skill:', error);
        alert('Failed to remove skill');
      } else {
        console.log('Skill removed successfully:', data);
        setSkills(updatedSkills);
      }
    } catch (error) {
      console.error('Error in removeSkill:', error);
      alert('Failed to remove skill');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setResumeFile(file);
    setLoading(true);

    try {
      // Upload resume to Supabase Storage (optional - you can skip this part initially)
      const fileName = `resumes/${user.id}-${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        // Continue with parsing even if upload fails
      }

      // Parse resume for skills (simplified version)
      await parseResumeForSkills(file);
      
    } catch (error) {
      console.error('Error handling resume:', error);
      alert('Error processing resume');
    } finally {
      setLoading(false);
    }
  };

  const parseResumeForSkills = async (file: File) => {
    try {
      // Simple PDF text extraction (you'll need a PDF parser library)
      // For now, let's add some common skills as a demo
      const commonSkills = [
        'JavaScript', 'React', 'Node.js', 'Python', 'SQL', 
        'HTML', 'CSS', 'Git', 'MongoDB', 'PostgreSQL'
      ];
      
      // In a real implementation, you'd parse the PDF and extract skills
      // For now, let's just add a few common ones as an example
      const detectedSkills = commonSkills.slice(0, 3); // Just add first 3 as demo
      
      // Add detected skills that aren't already in the list
      const newSkills = detectedSkills.filter(skill => 
        !skills.some(existingSkill => 
          existingSkill.toLowerCase() === skill.toLowerCase()
        )
      );
      
      if (newSkills.length > 0) {
        const updatedSkills = [...skills, ...newSkills];
        
        const { error } = await supabase
          .from('profiles')
          .update({ skills: updatedSkills })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating skills from resume:', error);
        } else {
          setSkills(updatedSkills);
          alert(`Added ${newSkills.length} skills from resume: ${newSkills.join(', ')}`);
        }
      } else {
        alert('No new skills detected in resume');
      }
      
    } catch (error) {
      console.error('Error parsing resume:', error);
      alert('Error parsing resume');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addSkill();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>
      
      {/* Resume Upload Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Import Resume (PDF)</h2>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleResumeUpload}
            id="resume-upload"
            className="hidden"
          />
          <label 
            htmlFor="resume-upload" 
            className="bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-red-700 transition-colors"
          >
            Choose File
          </label>
          <span className="text-gray-300">
            {resumeFile ? resumeFile.name : 'No file chosen'}
          </span>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Your Skills</h2>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a skill (e.g., React, SQL)"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button 
            onClick={addSkill}
            disabled={loading || !newSkill.trim()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>

        {/* Display Skills */}
        <div>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <div key={index} className="bg-gray-700 text-white px-3 py-1 rounded-full flex items-center gap-2">
                  <span>{skill}</span>
                  <button 
                    onClick={() => removeSkill(skill)}
                    className="text-gray-400 hover:text-white transition-colors"
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No skills added yet. Add some skills or upload your resume!</p>
          )}
        </div>

        {/* Debug info (remove in production) */}
        <div className="mt-6 text-xs text-gray-500">
          <p>User ID: {user?.id}</p>
          <p>Skills count: {skills.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;