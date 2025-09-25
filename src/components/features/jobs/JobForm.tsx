import React, { useState, useEffect } from 'react';
import { JobApplication, CreateJobApplication, JobStatus } from '../../../types/job';
import { X, Calendar, DollarSign, Link as LinkIcon, FileText } from 'lucide-react';
import FitScoreCard from './FitScoreCard';

interface JobFormProps {
  job?: JobApplication;
  onSubmit: (jobData: CreateJobApplication) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const JobForm: React.FC<JobFormProps> = ({ job, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<CreateJobApplication>({
    company: '',
    position: '',
    date_applied: new Date().toISOString().split('T')[0],
    status: 'Applied',
    salary: '',
    notes: '',
    job_url: '',
    job_description: '',
    offers: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get profile skills from localStorage
  const getProfileSkills = (): string[] => {
    const saved = localStorage.getItem('profile_demo');
    if (saved) {
      const profile = JSON.parse(saved);
      return profile.skills?.map((s: any) => s.name) || [];
    }
    return [];
  };

  useEffect(() => {
    if (job) {
      setFormData({
        company: job.company,
        position: job.position,
        date_applied: job.date_applied,
        status: job.status,
        salary: job.salary || '',
        notes: job.notes || '',
        job_url: job.job_url || '',
        job_description: job.job_description || '',
        offers: job.offers || ''
      });
    }
  }, [job]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.date_applied) {
      newErrors.date_applied = 'Date applied is required';
    }

    if (formData.job_url && !isValidUrl(formData.job_url)) {
      newErrors.job_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const statusOptions: JobStatus[] = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">
            {job ? 'Edit Job Application' : 'Add New Job Application'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Close form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="company" className="block text-sm font-medium text-gray-300">
                  Company *
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.company ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter company name"
                />
                {errors.company && (
                  <p className="text-sm text-red-400">{errors.company}</p>
                )}
            </div>

              <div className="space-y-2">
                <label htmlFor="position" className="block text-sm font-medium text-gray-300">
                  Position *
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.position ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter position title"
                />
                {errors.position && (
                  <p className="text-sm text-red-400">{errors.position}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="date_applied" className="block text-sm font-medium text-gray-300">
                  Date Applied *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date_applied"
                    name="date_applied"
                    value={formData.date_applied}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 pl-10 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.date_applied ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                </div>
                {errors.date_applied && (
                  <p className="text-sm text-red-400">{errors.date_applied}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-300">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="salary" className="block text-sm font-medium text-gray-300">
                Salary
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., $80,000 - $100,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="job_url" className="block text-sm font-medium text-gray-300">
                Job URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="job_url"
                  name="job_url"
                  value={formData.job_url}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pl-10 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.job_url ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="https://company.com/job-posting"
                />
              </div>
              {errors.job_url && (
                <p className="text-sm text-red-400">{errors.job_url}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300">
                Notes
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-h-[100px] resize-none"
                  placeholder="Add any additional notes about this application..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="job_description" className="block text-sm font-medium text-gray-300">
                Job Description
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="job_description"
                  name="job_description"
                  rows={6}
                  value={formData.job_description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-h-[150px] resize-none"
                  placeholder="Paste the job description here to analyze how well your skills match..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="offers" className="block text-sm font-medium text-gray-300">
                Job Offers
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="offers"
                  name="offers"
                  rows={3}
                  value={formData.offers}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-h-[100px] resize-none"
                  placeholder="Enter details about any job offers received..."
                />
              </div>
            </div>

          {/* Fit Score Analysis */}
          <FitScoreCard
            onCopyToNotes={(text) => {
              setFormData(prev => ({
                ...prev,
                notes: prev.notes ? `${prev.notes}\n\n${text}` : text
              }));
            }}
            profile={{
              skills: getProfileSkills(), // Get from localStorage
              summary: 'Full-stack developer with experience in modern web technologies'
            }}
          />

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {job ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  job ? 'Update Application' : 'Add Application'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobForm;
