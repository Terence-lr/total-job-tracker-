import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { JobApplication, CreateJobApplication, JobFilters as JobFiltersType } from '../types/job';
import { 
  createJobApplication, 
  getJobApplications, 
  updateJobApplication, 
  deleteJobApplication,
  searchJobApplications 
} from '../services/jobService';
import JobForm from './jobs/JobForm';
import JobCard from './jobs/JobCard';
import JobFilters from './jobs/JobFilters';
import Navigation from './Navigation';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Briefcase, TrendingUp, Calendar, AlertCircle, FileText, Download } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFiltersType>({});
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal();
  const { ref: jobsRef, isVisible: jobsVisible } = useScrollReveal();

  // Load jobs on component mount
  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply filters whenever jobs or filters change
  useEffect(() => {
    applyFilters();
  }, [jobs, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadJobs = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const userJobs = await getJobApplications(user.id);
      setJobs(userJobs);
    } catch (err) {
      setError('Failed to load job applications');
      console.error('Error loading jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = async () => {
    if (!user) return;

    try {
      if (Object.keys(filters).length === 0) {
        setFilteredJobs(jobs);
      } else {
        const filtered = await searchJobApplications(user.id, filters);
        setFilteredJobs(filtered);
      }
    } catch (err) {
      console.error('Error applying filters:', err);
      setFilteredJobs(jobs);
    }
  };

  const handleCreateJob = async (jobData: CreateJobApplication) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await createJobApplication(jobData, user.id);
      await loadJobs(); // Reload jobs to get the updated list
      setShowJobForm(false);
    } catch (err) {
      setError('Failed to create job application');
      console.error('Error creating job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateJob = async (jobData: CreateJobApplication) => {
    if (!user || !editingJob) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await updateJobApplication(editingJob.id, jobData, user.id);
      await loadJobs(); // Reload jobs to get the updated list
      setEditingJob(null);
    } catch (err) {
      setError('Failed to update job application');
      console.error('Error updating job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!user) return;

    if (!window.confirm('Are you sure you want to delete this job application?')) {
      return;
    }

    try {
      setError(null);
      await deleteJobApplication(jobId, user.id);
      await loadJobs(); // Reload jobs to get the updated list
    } catch (err) {
      setError('Failed to delete job application');
      console.error('Error deleting job:', err);
    }
  };

  const handleEditJob = (job: JobApplication) => {
    setEditingJob(job);
  };

  const handleCancelForm = () => {
    setShowJobForm(false);
    setEditingJob(null);
  };

  const handleFiltersChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };


  // Calculate statistics
  const stats = {
    total: jobs.length,
    applied: jobs.filter(job => job.status === 'Applied').length,
    interviews: jobs.filter(job => job.status === 'Interview').length,
    offers: jobs.filter(job => job.status === 'Offer').length,
    rejected: jobs.filter(job => job.status === 'Rejected').length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-var(--bg) flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-var(--accent) mx-auto"></div>
          <p className="mt-4 text-var(--muted)">Loading your job applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-var(--bg) flex flex-col">
      <Navigation onAddJob={() => setShowJobForm(true)} />

      <main className="container section">
        {/* Error Message */}
        {error && (
          <div className="mb-6 card p-4 border-var(--err)">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-var(--err)" />
              <div className="ml-3">
                <p className="text-sm text-var(--err)">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div 
          ref={statsRef}
          className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 scroll-reveal ${statsVisible ? 'revealed' : ''}`}
        >
          <div className="card p-4 cursor-halo">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Briefcase className="h-8 w-8 text-var(--accent)" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-var(--muted)">Total</p>
                <p className="text-2xl font-semibold text-var(--text)">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 cursor-halo">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-var(--muted)">Applied</p>
                <p className="text-2xl font-semibold text-var(--text)">{stats.applied}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 cursor-halo">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-var(--warn)" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-var(--muted)">Interviews</p>
                <p className="text-2xl font-semibold text-var(--text)">{stats.interviews}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 cursor-halo">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-var(--ok)" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-var(--muted)">Offers</p>
                <p className="text-2xl font-semibold text-var(--text)">{stats.offers}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 cursor-halo">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-var(--err)" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-var(--muted)">Rejected</p>
                <p className="text-2xl font-semibold text-var(--text)">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        <h1 className="page-title text-xl font-semibold text-var(--text)">Your Job Applications</h1>

        {/* Filters */}
        <section className="card stack" style={{["--stack-gap" as any]:"var(--s-4)"}}>
          <header className="stack" style={{["--stack-gap" as any]:"var(--s-2)"}}>
            <h2 className="h4" style={{margin:0}}>Filters</h2>
          </header>

          <JobFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

          <div className="btn-row">
            <button className="btn btn-secondary cursor-halo">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button className="btn btn-secondary cursor-halo">
              <FileText className="h-4 w-4" />
              Filters
            </button>
          </div>
        </section>

        {/* Jobs List */}
        <div 
          ref={jobsRef}
          className={`scroll-reveal ${jobsVisible ? 'revealed' : ''}`}
        >
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="mx-auto h-16 w-16 text-var(--muted)" />
              <h3 className="mt-4 text-lg font-medium text-var(--text)">No job applications</h3>
              <p className="mt-2 text-var(--muted)">
                {jobs.length === 0 
                  ? "Get started by adding your first job application."
                  : "No applications match your current filters."
                }
              </p>
              {jobs.length === 0 && (
                <div className="mt-8">
                  <button
                    onClick={() => setShowJobForm(true)}
                    className="btn btn-primary cursor-halo"
                  >
                    Add Job Application
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid-responsive">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={handleEditJob}
                  onDelete={handleDeleteJob}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Job Form Modal */}
      {(showJobForm || editingJob) && (
        <JobForm
          job={editingJob || undefined}
          onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
          onCancel={handleCancelForm}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default Dashboard;
