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
import { Plus, LogOut, User, Briefcase, TrendingUp, Calendar, AlertCircle, Menu, X } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFiltersType>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Error logging out:', err);
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your job applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center">
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 mr-2 sm:mr-3" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Job Tracker</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span className="truncate max-w-32">{user?.user_metadata?.display_name || user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 px-2">
                  <User className="h-4 w-4 mr-2" />
                  <span className="truncate">{user?.user_metadata?.display_name || user?.email}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-2 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Applied</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.applied}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Interviews</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.interviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Offers</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.offers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Job Button */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Job Applications</h2>
          <button
            onClick={() => setShowJobForm(true)}
            className="inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px] w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Job Application
          </button>
        </div>

        {/* Filters */}
        <JobFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No job applications</h3>
            <p className="mt-1 text-sm text-gray-500">
              {jobs.length === 0 
                ? "Get started by adding your first job application."
                : "No applications match your current filters."
              }
            </p>
            {jobs.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowJobForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job Application
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
