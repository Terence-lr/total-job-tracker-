import React, { useEffect, useState } from 'react';
import { getJobApplications } from '../services/jobService';
import { useAuth } from '../contexts/AuthContext';
import { JobApplication } from '../types/job';
import JobForm from '../components/features/jobs/JobForm';
import EditJobModal from '../components/features/jobs/EditJobModal';
import { updateJobApplication } from '../services/enhancedJobService';
import { useNotification } from '../contexts/NotificationContext';
import { Archive, ArchiveRestore } from 'lucide-react';
import StatusDropdown from '../components/features/jobs/StatusDropdown';
import OfferCelebration from '../components/features/jobs/OfferCelebration';
import Button from '../components/ui/Button';

export function Applications() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationJob, setCelebrationJob] = useState<{company: string, position: string} | null>(null);
  const { showError, showSuccess } = useNotification();

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
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingJob(null);
    setShowEditModal(false);
  };

  const handleJobUpdated = () => {
    loadJobs(); // Refresh the jobs list
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        setLoading(true);
        // You'll need to implement deleteJobApplication in your service
        // await deleteJobApplication(jobId, user.id);
        await loadJobs(); // Refresh the list
      } catch (error) {
        console.error('Error deleting job:', error);
        showError('Delete Failed', 'Failed to delete job application. Please try again.');
      } finally {
        setLoading(false);
      }
    }
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

  const handleArchiveJob = async (jobId: string) => {
    if (!user) return;
    
    try {
      await updateJobApplication(jobId, { status: 'Archived' }, user.id);
      await loadJobs();
      showSuccess('Job Archived', 'Job application has been archived successfully.');
    } catch (error) {
      console.error('Error archiving job:', error);
      showError('Archive Failed', 'Failed to archive job application.');
    }
  };

  const handleUnarchiveJob = async (jobId: string) => {
    if (!user) return;
    
    try {
      await updateJobApplication(jobId, { status: 'Applied' }, user.id);
      await loadJobs();
      showSuccess('Job Unarchived', 'Job application has been unarchived successfully.');
    } catch (error) {
      console.error('Error unarchiving job:', error);
      showError('Unarchive Failed', 'Failed to unarchive job application.');
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    if (!user) return;
    
    try {
      await updateJobApplication(jobId, { status: newStatus as any }, user.id);
      
      // Trigger celebration for job offers
      if (newStatus === 'Offer') {
        const job = jobs.find(j => j.id === jobId);
        if (job) {
          setCelebrationJob({ company: job.company, position: job.position });
          setShowCelebration(true);
        }
      }
      
      await loadJobs();
      showSuccess('Status Updated', `Job status updated to ${newStatus}.`);
    } catch (error) {
      console.error('Error updating job status:', error);
      showError('Update Failed', 'Failed to update job status.');
    }
  };


  // Filter jobs based on archived status
  const filteredJobs = jobs.filter(job => {
    if (!showArchived && job.status === 'Archived') {
      return false; // Don't show archived jobs if checkbox is unchecked
    }
    return true;
  });

  if (loading) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-white mb-8">All Applications</h1>
      
      {/* Show Archived Toggle */}
      <div className="mb-6">
        <label className="flex items-center space-x-2 text-gray-300">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
          />
          <span className="text-sm">Show archived jobs</span>
        </label>
      </div>

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
            {filteredJobs.map(job => (
              <tr key={job.id} className="border-b border-gray-800">
                <td className="p-4 text-white">{job.company}</td>
                <td className="p-4 text-gray-300">{job.position}</td>
                <td className="p-4 text-gray-300">{new Date(job.date_applied).toLocaleDateString()}</td>
                <td className="p-4">
                  <StatusDropdown
                    job={job}
                    onStatusChange={handleStatusChange}
                    className="w-32"
                  />
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleEditJob(job)}
                      variant="ghost"
                      size="sm"
                    >
                      ✏️ Edit
                    </Button>
                    {job.status === 'Archived' ? (
                      <Button 
                        onClick={() => handleUnarchiveJob(job.id)}
                        variant="success"
                        size="sm"
                        leftIcon={<ArchiveRestore className="w-3 h-3" />}
                      >
                        Unarchive
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleArchiveJob(job.id)}
                        variant="outline"
                        size="sm"
                        leftIcon={<Archive className="w-3 h-3" />}
                      >
                        Archive
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleDeleteJob(job.id)}
                      variant="danger"
                      size="sm"
                    >
                      🗑️ Delete
                    </Button>
                  </div>
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

      {/* Edit Job Modal */}
      {showEditModal && editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={closeEditModal}
          onJobUpdated={handleJobUpdated}
        />
      )}

      {/* Offer Celebration */}
      {celebrationJob && (
        <OfferCelebration
          isVisible={showCelebration}
          onClose={() => {
            setShowCelebration(false);
            setCelebrationJob(null);
          }}
          companyName={celebrationJob.company}
          position={celebrationJob.position}
        />
      )}
    </div>
  );
}
