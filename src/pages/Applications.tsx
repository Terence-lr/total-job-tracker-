import React, { useEffect, useState } from 'react';
import { getJobApplications } from '../services/jobService';
import { useAuth } from '../contexts/AuthContext';
import { JobApplication } from '../types/job';
import JobForm from '../components/features/jobs/JobForm';
import EditJobModal from '../components/features/jobs/EditJobModal';
import { updateJobApplication } from '../services/enhancedJobService';
import { useNotification } from '../contexts/NotificationContext';
import { useJobStatusUpdate } from '../hooks/useJobStatusUpdate';
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

  // Use shared status update hook
  const { handleStatusChange } = useJobStatusUpdate({
    onJobsReload: loadJobs,
    onCelebration: (company, position) => {
      setCelebrationJob({ company, position });
      setShowCelebration(true);
    }
  });

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



  // Filter jobs based on archived status
  const filteredJobs = jobs.filter(job => {
    if (!showArchived && job.status === 'Archived') {
      return false; // Don't show archived jobs if checkbox is unchecked
    }
    return true;
  });

  if (loading) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">All Applications</h1>
      
      {/* Show Archived Toggle */}
      <div className="mb-4 sm:mb-6">
        <label className="flex items-center space-x-2 text-gray-300">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
          />
          <span className="text-xs sm:text-sm">Show archived jobs</span>
        </label>
      </div>

      <div className="bg-gray-900 rounded-lg overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="border-b border-gray-800">
            <tr>
              <th className="text-left p-3 sm:p-4 text-gray-400 text-xs sm:text-sm">Company</th>
              <th className="text-left p-3 sm:p-4 text-gray-400 text-xs sm:text-sm">Position</th>
              <th className="text-left p-3 sm:p-4 text-gray-400 text-xs sm:text-sm hidden sm:table-cell">Date Applied</th>
              <th className="text-left p-3 sm:p-4 text-gray-400 text-xs sm:text-sm">Status</th>
              <th className="text-left p-3 sm:p-4 text-gray-400 text-xs sm:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map(job => (
              <tr key={job.id} className="border-b border-gray-800">
                <td className="p-3 sm:p-4 text-white text-sm sm:text-base font-medium">{job.company}</td>
                <td className="p-3 sm:p-4 text-gray-300 text-sm sm:text-base">{job.position}</td>
                <td className="p-3 sm:p-4 text-gray-300 text-sm sm:text-base hidden sm:table-cell">{new Date(job.date_applied).toLocaleDateString()}</td>
                <td className="p-3 sm:p-4">
                  <StatusDropdown
                    job={job}
                    onStatusChange={handleStatusChange}
                    className="w-24 sm:w-32"
                  />
                </td>
                <td className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                    <Button 
                      onClick={() => handleEditJob(job)}
                      variant="ghost"
                      size="sm"
                      className="text-xs px-2 py-1"
                    >
                      ✏️ Edit
                    </Button>
                    {job.status === 'Archived' ? (
                      <Button 
                        onClick={() => handleUnarchiveJob(job.id)}
                        variant="success"
                        size="sm"
                        leftIcon={<ArchiveRestore className="w-3 h-3" />}
                        className="text-xs px-2 py-1"
                      >
                        <span className="hidden sm:inline">Unarchive</span>
                        <span className="sm:hidden">Unarch</span>
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleArchiveJob(job.id)}
                        variant="outline"
                        size="sm"
                        leftIcon={<Archive className="w-3 h-3" />}
                        className="text-xs px-2 py-1"
                      >
                        <span className="hidden sm:inline">Archive</span>
                        <span className="sm:hidden">Arch</span>
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleDeleteJob(job.id)}
                      variant="danger"
                      size="sm"
                      className="text-xs px-2 py-1"
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
          <div className="p-6 sm:p-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">No applications yet. Add your first one!</p>
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
