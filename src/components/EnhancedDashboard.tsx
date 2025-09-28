import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { JobApplication, CreateJobApplication, JobFilters as JobFiltersType } from '../types/job';
import { supabase } from '../lib/supabase';
import { 
  createJobApplication, 
  getJobsWithFilters,
  updateJobApplication,
  deleteJobApplication
} from '../services/enhancedJobService';
import JobForm from './features/jobs/JobForm';
import JobFilters from './features/jobs/JobFilters';
import FollowUpsWidget from './FollowUpsWidget';
import QuickAnalyticsSummary from './features/analytics/QuickAnalyticsSummary';
import EnhancedJobCard from './features/jobs/EnhancedJobCard';
import BulkActions from './features/jobs/BulkActions';
import ResponsiveGrid from './features/responsive/ResponsiveGrid';
import Pagination from './ui/Pagination';
import ErrorBoundary from './ui/ErrorBoundary';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useOptimisticJobUpdate } from '../hooks/useOptimisticJobUpdate';
import { useJobStatusUpdate } from '../hooks/useJobStatusUpdate';
import { Briefcase, AlertCircle } from 'lucide-react';
import { FollowUp } from '../types/fitScore';
import { generateFollowUps } from '../services/followUpService';
import OfferCelebration from './features/jobs/OfferCelebration';
import JobAutomationDashboard from './features/jobs/JobAutomationDashboard';
// import StatusDropdown from './features/jobs/StatusDropdown'; // Used in EnhancedJobCard

const EnhancedDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFiltersType>({});
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showArchived, setShowArchived] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationJob, setCelebrationJob] = useState<{company: string, position: string} | null>(null);
  const [targetOfferRate, setTargetOfferRate] = useState<number>(20);
  const [showAutomation, setShowAutomation] = useState(false);
  const itemsPerPage = 12;

  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal();
  const { ref: jobsRef, isVisible: jobsVisible } = useScrollReveal();

  // Use optimistic updates
  const { updateJob, bulkUpdateJobs, bulkDeleteJobs } = useOptimisticJobUpdate(jobs);

  const loadJobs = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const userJobs = await getJobsWithFilters(user.id, filters);
      setJobs(userJobs);
      
      // Generate follow-ups for jobs
      const newFollowUps: FollowUp[] = [];
      userJobs.forEach(job => {
        if (job.status === 'Applied' || job.status === 'Interview') {
          const jobFollowUps = generateFollowUps(job.id, job.status, job.date_applied);
          newFollowUps.push(...jobFollowUps);
        }
      });
      setFollowUps(newFollowUps);
    } catch (err) {
      setError('Failed to load job applications');
      console.error('Error loading jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, filters]);

  // Use shared status update hook
  const { handleStatusChange } = useJobStatusUpdate({
    onJobsReload: loadJobs,
    onCelebration: (company, position) => {
      setCelebrationJob({ company, position });
      setShowCelebration(true);
    }
  });

  const loadTargetOfferRate = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('target_offer_rate')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading target offer rate:', error);
      } else if (profile) {
        setTargetOfferRate(profile.target_offer_rate || 20);
      }
    } catch (err) {
      console.error('Error loading target offer rate:', err);
    }
  }, [user]);

  const applyFilters = useCallback(() => {
    let filtered = [...jobs];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(job =>
        job.company.toLowerCase().includes(searchTerm) ||
        job.position.toLowerCase().includes(searchTerm) ||
        (job.notes && job.notes.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.status) {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(job => new Date(job.date_applied) >= new Date(filters.dateFrom!));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(job => new Date(job.date_applied) <= new Date(filters.dateTo!));
    }

    // Filter by archived status
    if (!showArchived) {
      filtered = filtered.filter(job => job.status !== 'Archived');
    }

    setFilteredJobs(filtered);
  }, [jobs, filters, showArchived]);

  // Load jobs on component mount
  useEffect(() => {
    if (user) {
      loadJobs();
      loadTargetOfferRate();
    }
  }, [user, loadJobs, loadTargetOfferRate]);

  // Apply filters whenever jobs or filters change
  useEffect(() => {
    applyFilters();
  }, [jobs, filters, applyFilters]);

  // Check for addJob URL parameter and open job form
  useEffect(() => {
    const addJob = searchParams.get('addJob');
    if (addJob === 'true') {
      setShowJobForm(true);
      // Remove the parameter from URL to clean it up
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleCreateJob = async (jobData: CreateJobApplication) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      await createJobApplication(jobData);
      await loadJobs();
      setShowJobForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create job application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateJob = async (jobData: CreateJobApplication) => {
    if (!user || !editingJob) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
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
    } catch (err: any) {
      setError(err.message || 'Failed to update job application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!user) return;
    
    try {
      await deleteJobApplication(jobId, user.id);
      await loadJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to delete job application');
    }
  };

  const handleBulkUpdate = async (updates: Partial<JobApplication>) => {
    if (!user) return;
    
    try {
      await bulkUpdateJobs(selectedJobs, updates, user.id);
      setSelectedJobs([]);
      await loadJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to update jobs');
    }
  };

  const handleBulkDelete = async () => {
    if (!user) return;
    
    try {
      await bulkDeleteJobs(selectedJobs, user.id);
      setSelectedJobs([]);
      await loadJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to delete jobs');
    }
  };

  const handleBulkArchive = async () => {
    if (!user) return;
    
    try {
      // Update all selected jobs to status: 'Archived'
      for (const jobId of selectedJobs) {
        await updateJobApplication(jobId, { status: 'Archived' }, user.id);
      }
      setSelectedJobs([]);
      await loadJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to archive jobs');
    }
  };

  const handleBulkUnarchive = async () => {
    if (!user) return;
    
    try {
      // Update all selected jobs to status: 'Applied'
      for (const jobId of selectedJobs) {
        await updateJobApplication(jobId, { status: 'Applied' }, user.id);
      }
      setSelectedJobs([]);
      await loadJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to unarchive jobs');
    }
  };

  const handleArchiveJob = async (jobId: string) => {
    if (!user) return;
    
    try {
      await updateJobApplication(jobId, { status: 'Archived' }, user.id);
      await loadJobs();
      console.log('Job archived successfully');
    } catch (error) {
      console.error('Error archiving job:', error);
      setError('Failed to archive job');
    }
  };

  const handleUnarchiveJob = async (jobId: string) => {
    if (!user) return;
    
    try {
      await updateJobApplication(jobId, { status: 'Applied' }, user.id);
      await loadJobs();
      console.log('Job unarchived successfully');
    } catch (error) {
      console.error('Error unarchiving job:', error);
      setError('Failed to unarchive job');
    }
  };



  const handleJobSelect = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleClearSelection = () => {
    setSelectedJobs([]);
  };

  const handleCancelForm = () => {
    setShowJobForm(false);
    setEditingJob(null);
  };

  // Pagination
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black">

        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 bg-red-900/20 border border-red-500/30 rounded-md p-3 sm:p-4">
              <div className="flex">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0" />
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Analytics Summary */}
          <div 
            ref={statsRef}
            className={`mb-6 sm:mb-8 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500`}
          >
            <QuickAnalyticsSummary jobs={jobs} targetOfferRate={targetOfferRate} />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Your Job Applications</h1>

          {/* Filters */}
          <div className="signature-card p-4 sm:p-6 mb-4 sm:mb-6">
            <JobFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={() => setFilters({})}
            />
            
            {/* Show Archived Toggle */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
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
          </div>

          {/* Bulk Actions */}
          <BulkActions
            selectedJobs={selectedJobs}
            onBulkUpdate={handleBulkUpdate}
            onBulkDelete={handleBulkDelete}
            onBulkArchive={handleBulkArchive}
            onBulkUnarchive={handleBulkUnarchive}
            onClearSelection={handleClearSelection}
            hasArchivedJobs={showArchived}
          />

          {/* Follow-up Reminders */}
          <FollowUpsWidget
            followUps={followUps}
            jobs={jobs.map(job => ({
              id: job.id,
              company: job.company,
              position: job.position,
              status: job.status
            }))}
            onUpdateFollowUps={setFollowUps}
          />

          {/* Jobs Grid */}
          <div 
            ref={jobsRef}
            className={`${jobsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : paginatedJobs.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Briefcase className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                <h3 className="mt-2 text-sm sm:text-base font-medium text-white">No job applications</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-400 px-4">
                  Get started by adding your first job application.
                </p>
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowJobForm(true)}
                    className="signature-btn inline-flex items-center text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Add Job Application
                  </button>
                  <button
                    onClick={() => setShowAutomation(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white inline-flex items-center text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Auto-Extract Job
                  </button>
                </div>
              </div>
            ) : (
              <>
                <ResponsiveGrid cols={{ default: 1, md: 2, xl: 3 }}>
                  {paginatedJobs.map(job => (
                    <EnhancedJobCard
                      key={job.id}
                      job={job}
                      isSelected={selectedJobs.includes(job.id)}
                      onSelect={handleJobSelect}
                      onUpdate={(id, updates) => updateJob(id, updates, user!.id)}
                      onDelete={(id) => handleDeleteJob(id)}
                      onEdit={(job) => {
                        setEditingJob(job);
                        setShowJobForm(true);
                      }}
                      onArchive={handleArchiveJob}
                      onUnarchive={handleUnarchiveJob}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </ResponsiveGrid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 sm:mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Job Form Modal */}
          {showJobForm && (
            <JobForm
              job={editingJob || undefined}
              onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
              onCancel={handleCancelForm}
              isLoading={isSubmitting}
            />
          )}

          {/* Job Automation Dashboard */}
          {showAutomation && (
            <JobAutomationDashboard
              onJobExtracted={handleCreateJob}
              onClose={() => setShowAutomation(false)}
            />
          )}
        </main>
      </div>

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
    </ErrorBoundary>
  );
};

export default EnhancedDashboard;
