import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { JobApplication, CreateJobApplication, JobFilters as JobFiltersType } from '../types/job';
import { 
  createJobApplication, 
  getJobApplications
} from '../services/jobService';
import JobForm from './features/jobs/JobForm';
import JobFilters from './features/jobs/JobFilters';
import ProfessionalNavigation from './layouts/ProfessionalNavigation';
import FollowUpsWidget from './FollowUpsWidget';
import DashboardMetrics from './features/analytics/DashboardMetrics';
import StatusDistribution from './features/analytics/StatusDistribution';
import ApplicationTrends from './features/analytics/ApplicationTrends';
import EnhancedJobCard from './features/jobs/EnhancedJobCard';
import BulkActions from './features/jobs/BulkActions';
import ResponsiveGrid from './features/responsive/ResponsiveGrid';
import Pagination from './ui/Pagination';
import ErrorBoundary from './ui/ErrorBoundary';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useOptimisticJobUpdate } from '../hooks/useOptimisticJobUpdate';
import { Briefcase, AlertCircle } from 'lucide-react';
import { FollowUp } from '../types/fitScore';
import { generateFollowUps } from '../services/followUpService';

const EnhancedDashboard: React.FC = () => {
  const { user } = useAuth();
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
  const itemsPerPage = 12;

  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal();
  const { ref: jobsRef, isVisible: jobsVisible } = useScrollReveal();

  // Use optimistic updates
  const { jobs: optimisticJobs, updateJob, deleteJob, bulkUpdateJobs, bulkDeleteJobs } = useOptimisticJobUpdate(jobs);

  // Load jobs on component mount
  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user]);

  // Apply filters whenever jobs or filters change
  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const loadJobs = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const userJobs = await getJobApplications(user.id);
      setJobs(userJobs);
      
      // Generate follow-ups for jobs
      const newFollowUps: FollowUp[] = [];
      userJobs.forEach(job => {
        if (job.status === 'Applied' || job.status === 'Interview') {
          const jobFollowUps = generateFollowUps(job.id, job.status, job.dateApplied);
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
  };

  const applyFilters = () => {
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
      filtered = filtered.filter(job => new Date(job.dateApplied) >= new Date(filters.dateFrom!));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(job => new Date(job.dateApplied) <= new Date(filters.dateTo!));
    }

    setFilteredJobs(filtered);
  };

  const handleCreateJob = async (jobData: CreateJobApplication) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      await createJobApplication(jobData, user.id);
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
      await updateJob(editingJob.id, jobData, user.id);
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
      await deleteJob(jobId, user.id);
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
      <div className="min-h-screen bg-gray-50">
        <ProfessionalNavigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Dashboard */}
          <div 
            ref={statsRef}
            className={`mb-8 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500`}
          >
            <DashboardMetrics applications={jobs} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <StatusDistribution data={jobs} />
            </div>
            <div>
              <ApplicationTrends data={jobs} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Job Applications</h1>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <JobFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={() => setFilters({})}
            />
          </div>

          {/* Bulk Actions */}
          <BulkActions
            selectedJobs={selectedJobs}
            onBulkUpdate={handleBulkUpdate}
            onBulkDelete={handleBulkDelete}
            onClearSelection={handleClearSelection}
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
              <div className="text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No job applications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first job application.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowJobForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Add Job Application
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
                      onEdit={setEditingJob}
                    />
                  ))}
                </ResponsiveGrid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
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
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default EnhancedDashboard;
