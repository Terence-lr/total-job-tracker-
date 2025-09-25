import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { JobApplication, JobStatus } from '../../../types/job';

interface EditJobModalProps {
  job: JobApplication;
  onClose: () => void;
  onJobUpdated: () => void;
}

const EditJobModal: React.FC<EditJobModalProps> = ({ job, onClose, onJobUpdated }) => {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    date_applied: '',
    status: 'Applied' as JobStatus,
    salary: '',
    job_url: '',
    notes: '',
    job_description: ''
  });
  const [loading, setLoading] = useState(false);

  // Populate form with existing job data when modal opens
  useEffect(() => {
    if (job) {
      setFormData({
        company: job.company || '',
        position: job.position || '',
        date_applied: job.date_applied || '',
        status: job.status || 'Applied',
        salary: job.salary || '',
        job_url: job.job_url || '',
        notes: job.notes || '',
        job_description: job.job_description || ''
      });
    }
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          company: formData.company,
          position: formData.position,
          date_applied: formData.date_applied,
          status: formData.status,
          salary: formData.salary,
          job_url: formData.job_url,
          notes: formData.notes,
          job_description: formData.job_description
        })
        .eq('id', job.id);

      if (error) throw error;

      onJobUpdated(); // Refresh the jobs list
      onClose(); // Close modal
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Error updating job application');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Edit Job Application</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Company *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Position *
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Date Applied *
              </label>
              <input
                type="date"
                value={formData.date_applied}
                onChange={(e) => handleChange('date_applied', e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Salary
            </label>
            <input
              type="text"
              placeholder="e.g., $80,000 - $100,000"
              value={formData.salary}
              onChange={(e) => handleChange('salary', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="mt-6 space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Job URL
            </label>
            <input
              type="url"
              placeholder="https://company.com/job-posting"
              value={formData.job_url}
              onChange={(e) => handleChange('job_url', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="mt-6 space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Notes
            </label>
            <textarea
              placeholder="Add any additional notes..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="mt-6 space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Job Description
            </label>
            <textarea
              placeholder="Paste job description here..."
              value={formData.job_description}
              onChange={(e) => handleChange('job_description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobModal;
