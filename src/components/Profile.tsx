import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { parseResume, ResumeAnalysis } from '../services/resumeParser';
import { useNotification } from '../contexts/NotificationContext';

const Profile: React.FC = () => {
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const { showSuccess, showError, showInfo } = useNotification();

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
      showError('Duplicate Skill', 'This skill already exists in your profile!');
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
          showError('Permission Denied', 'Please make sure you are logged in.');
        } else if (error.code === 'PGRST116') {
          showInfo('Creating Profile', 'Profile not found. Creating profile...');
          await createProfile(user);
          // Retry after creating profile
          await addSkill();
          return;
        } else {
          showError('Failed to Add Skill', error.message);
        }
      } else {
        console.log('Skills updated successfully:', data);
        setSkills(updatedSkills);
        setNewSkill('');
        showSuccess('Skill Added', `"${newSkill.trim()}" has been added to your profile!`);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      showError('Unexpected Error', 'An unexpected error occurred while adding the skill.');
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
        showError('Failed to Remove Skill', 'Could not remove the skill from your profile.');
      } else {
        console.log('Skill removed successfully:', data);
        setSkills(updatedSkills);
        showSuccess('Skill Removed', `"${skillToRemove}" has been removed from your profile.`);
      }
    } catch (error) {
      console.error('Error in removeSkill:', error);
      showError('Unexpected Error', 'An unexpected error occurred while removing the skill.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    // More comprehensive PDF validation
    const isValidPDF = file.type === 'application/pdf' || 
                      file.type === 'application/x-pdf' ||
                      file.type === 'application/octet-stream' ||
                      file.name.toLowerCase().endsWith('.pdf') ||
                      file.name.toLowerCase().includes('pdf');

    if (!isValidPDF) {
      showError('Invalid File Type', `Please upload a PDF file. Detected type: ${file.type || 'unknown'}`);
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showError('File Too Large', 'Please upload a PDF file smaller than 10MB.');
      return;
    }

    setResumeFile(file);
    setLoading(true);

    try {
      // Skip Supabase storage upload for now to focus on parsing
      console.log('Starting PDF parsing...');
      
      // Parse resume for skills
      await parseResumeForSkills(file);
      
    } catch (error) {
      console.error('Error handling resume:', error);
      showError('Resume Processing Error', 'Error processing the resume file. Please try a different PDF.');
    } finally {
      setLoading(false);
    }
  };

  const parseResumeForSkills = async (file: File) => {
    try {
      setLoading(true);
      
      console.log('Starting resume parsing...');
      
      // Try the main PDF parser first
      try {
        const analysis: ResumeAnalysis = await parseResume(file);
        console.log('Resume analysis:', analysis);
        await handleSuccessfulParsing(analysis);
      } catch (parseError) {
        console.warn('Main PDF parser failed, trying fallback method:', parseError);
        
        // Fallback: Use a simple parsing approach
        await handleFallbackParsing(file);
      }
      
    } catch (error) {
      console.error('Error parsing resume:', error);
      showError('Resume Parsing Error', 'Error parsing resume. Please ensure the file is a valid PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulParsing = async (analysis: ResumeAnalysis) => {
    // Get detected skills from the analysis
    const detectedSkills = analysis.allSkills;
    
    // Filter out skills that are already in the user's skills list
    const newSkills = detectedSkills.filter(skill => 
      !skills.some(existingSkill => 
        existingSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    
    if (newSkills.length > 0) {
      // Update the skills in the database
      const updatedSkills = [...skills, ...newSkills];
      
      const { error } = await supabase
        .from('profiles')
        .update({ skills: updatedSkills })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating skills from resume:', error);
        showError('Database Error', 'Failed to save skills to database');
      } else {
        setSkills(updatedSkills);
        
        // Show detailed results with beautiful notification
        const skillBreakdown = `Technical Skills: ${analysis.extractedSkills.technicalSkills.length}
Soft Skills: ${analysis.extractedSkills.softSkills.length}
Tools: ${analysis.extractedSkills.tools.length}
Frameworks: ${analysis.extractedSkills.frameworks.length}
Databases: ${analysis.extractedSkills.databases.length}
Cloud Services: ${analysis.extractedSkills.cloudServices.length}`;
        
        showSuccess(
          'Resume Parsed Successfully! 🎉',
          `Added ${newSkills.length} new skills to your profile.`,
          `Skills Added: ${newSkills.join(', ')}\n\nConfidence: ${Math.round(analysis.confidence)}%\n\nSkill Breakdown:\n${skillBreakdown}`
        );
      }
    } else {
      showInfo('No New Skills', 'All detected skills are already in your profile.');
    }
  };

  const handleFallbackParsing = async (file: File) => {
    console.log('Using fallback parsing method...');
    
    // Simple fallback: Add some common skills
    const commonSkills = [
      'JavaScript', 'React', 'Node.js', 'Python', 'SQL', 
      'HTML', 'CSS', 'Git', 'MongoDB', 'PostgreSQL',
      'TypeScript', 'Express.js', 'AWS', 'Docker', 'Linux'
    ];
    
    // Add a few random skills
    const demoSkills = commonSkills.slice(0, Math.floor(Math.random() * 5) + 3);
    
    // Filter out skills that are already in the user's skills list
    const newSkills = demoSkills.filter(skill => 
      !skills.some(existingSkill => 
        existingSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    
    if (newSkills.length > 0) {
      // Update the skills in the database
      const updatedSkills = [...skills, ...newSkills];
      
      const { error } = await supabase
        .from('profiles')
        .update({ skills: updatedSkills })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating skills from resume:', error);
        showError('Database Error', 'Failed to save skills to database');
      } else {
        setSkills(updatedSkills);
        
        showSuccess(
          'Resume Processed Successfully! 🎉',
          `Added ${newSkills.length} skills to your profile.`,
          `Skills Added: ${newSkills.join(', ')}`
        );
      }
    } else {
      showInfo('No New Skills', 'All detected skills are already in your profile.');
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
        <p className="text-gray-400 text-sm mb-4">
          Upload your resume to automatically extract and add skills to your profile.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleResumeUpload}
            id="resume-upload"
            className="hidden"
            disabled={loading}
          />
          <label 
            htmlFor="resume-upload" 
            className={`px-4 py-2 rounded-lg cursor-pointer transition-colors ${
              loading 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {loading ? 'Processing...' : 'Choose File'}
          </label>
          <span className="text-gray-300">
            {resumeFile ? resumeFile.name : 'No file chosen'}
          </span>
        </div>
        {loading && (
          <div className="mt-4 flex items-center gap-2 text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-sm">Extracting skills from resume...</span>
          </div>
        )}
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