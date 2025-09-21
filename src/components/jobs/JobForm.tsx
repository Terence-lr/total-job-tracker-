import React, { useState, useEffect } from 'react';
import { JobApplication, CreateJobApplication, JobStatus } from '../../types/job';
import { X, Calendar, DollarSign, Link as LinkIcon, FileText } from 'lucide-react';

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
    dateApplied: new Date().toISOString().split('T')[0],
    status: 'Applied',
    salary: '',
    notes: '',
    jobUrl: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (job) {
      setFormData({
        company: job.company,
        position: job.position,
        dateApplied: job.dateApplied,
        status: job.status,
        salary: job.salary || '',
        notes: job.notes || '',
        jobUrl: job.jobUrl || ''
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

    if (!formData.dateApplied) {
      newErrors.dateApplied = 'Date applied is required';
    }

    if (formData.jobUrl && !isValidUrl(formData.jobUrl)) {
      newErrors.jobUrl = 'Please enter a valid URL';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 sm:top-20 mx-auto p-6 w-11/12 sm:w-5/6 md:w-2/3 lg:w-1/2 card max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-var(--text)">
            {job ? 'Edit Job Application' : 'Add New Job Application'}
          </h3>
          <button
            onClick={onCancel}
            className="text-var(--muted) hover:text-var(--text) p-1 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-halo"
            aria-label="Close form"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="company" className="form-label">
                Company *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={`form-input w-full ${
                  errors.company ? 'border-var(--err)' : ''
                }`}
                placeholder="Enter company name"
              />
              {errors.company && (
                <p className="mt-1 text-sm text-var(--err)">{errors.company}</p>
              )}
            </div>

            <div>
              <label htmlFor="position" className="form-label">
                Position *
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={`form-input w-full ${
                  errors.position ? 'border-var(--err)' : ''
                }`}
                placeholder="Enter position title"
              />
              {errors.position && (
                <p className="mt-1 text-sm text-var(--err)">{errors.position}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dateApplied" className="form-label">
                Date Applied *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-var(--muted)" />
                </div>
                <input
                  type="date"
                  id="dateApplied"
                  name="dateApplied"
                  value={formData.dateApplied}
                  onChange={handleChange}
                  className={`form-input w-full pl-10 ${
                    errors.dateApplied ? 'border-var(--err)' : ''
                  }`}
                />
              </div>
              {errors.dateApplied && (
                <p className="mt-1 text-sm text-var(--err)">{errors.dateApplied}</p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input w-full"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="salary" className="form-label">
              Salary
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-var(--muted)" />
              </div>
              <input
                type="text"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="form-input w-full pl-10"
                placeholder="e.g., $80,000 - $100,000"
              />
            </div>
          </div>

          <div>
            <label htmlFor="jobUrl" className="form-label">
              Job URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-var(--muted)" />
              </div>
              <input
                type="url"
                id="jobUrl"
                name="jobUrl"
                value={formData.jobUrl}
                onChange={handleChange}
                className={`form-input w-full pl-10 ${
                  errors.jobUrl ? 'border-var(--err)' : ''
                }`}
                placeholder="https://company.com/job-posting"
              />
            </div>
            {errors.jobUrl && (
              <p className="mt-1 text-sm text-var(--err)">{errors.jobUrl}</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="form-label">
              Notes
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-var(--muted)" />
              </div>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className="form-input w-full pl-10 min-h-[100px] resize-none"
                placeholder="Add any additional notes about this application..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary cursor-halo"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary cursor-halo disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};

export default JobForm;
