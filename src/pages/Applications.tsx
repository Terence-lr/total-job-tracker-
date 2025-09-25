import React, { useEffect, useState } from 'react';
import { getJobApplications } from '../services/jobService';
import { useAuth } from '../contexts/AuthContext';
import { JobApplication } from '../types/job';
import JobForm from '../components/features/jobs/JobForm';
import { updateJobApplication } from '../services/enhancedJobService';

export function Applications() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadJobs = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getJobApplications();
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditJob = (job: JobApplication) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleUpdateJob = async (jobData: any) => {
    if (!user || !editingJob) return;
    
    try {
      setIsSubmitting(true);
      
      // Map the jobData to the format expected by updateJobApplication
      const updates: Partial<JobApplication> = {
        company: jobData.company,
        position: jobData.position,
        date_applied: jobData.date_applied,
        status: jobData.status,
        salary: jobData.salary,
        notes: jobData.notes,
        job_url: jobData.job_url,
        job_description: jobData.job_description
      };
      
      await updateJobApplication(editingJob.id, updates, user.id);
      await loadJobs();
      setEditingJob(null);
      setShowJobForm(false);
    } catch (error) {
      console.error('Error updating job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowJobForm(false);
    setEditingJob(null);
  };

  if (loading) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-white mb-8">All Applications</h1>
      <div className="bg-gray-900 rounded-lg">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              <th className="text-left p-4 text-gray-400">Company</th>
              <th className="text-left p-4 text-gray-400">Position</th>
              <th className="text-left p-4 text-gray-400">Date Applied</th>
              <th className="text-left p-4 text-gray-400">Status</th>
              <th className="text-left p-4 text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id} className="border-b border-gray-800">
                <td className="p-4 text-white">{job.company}</td>
                <td className="p-4 text-gray-300">{job.position}</td>
                <td className="p-4 text-gray-300">{new Date(job.date_applied).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    job.status === 'Applied' ? 'bg-blue-600' :
                    job.status === 'Interview' ? 'bg-yellow-600' :
                    job.status === 'Offer' ? 'bg-green-600' :
                    'bg-red-600'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => handleEditJob(job)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {jobs.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No applications yet. Add your first one!
          </div>
        )}
      </div>

      {/* Job Form Modal */}
      {showJobForm && editingJob && (
        <JobForm
          job={editingJob}
          onSubmit={handleUpdateJob}
          onCancel={handleCancelForm}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
