// src/components/AddJobModal.tsx

import React, { useState } from 'react';
import { extractJobFromURL, ExtractedJobData } from '../utils/jobExtractor';
import { X, Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: any) => void;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [jobUrl, setJobUrl] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [status, setStatus] = useState('applied');
  const [notes, setNotes] = useState('');

  // Auto-extract state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState<{
    type: 'idle' | 'success' | 'partial' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  const handleAutoExtract = async () => {
    if (!jobUrl.trim()) {
      setExtractionStatus({
        type: 'error',
        message: 'Please enter a job URL first'
      });
      return;
    }

    setIsExtracting(true);
    setExtractionStatus({ type: 'idle', message: 'Extracting job details...' });

    try {
      const extracted: ExtractedJobData = await extractJobFromURL(jobUrl);

      if (extracted.company && extracted.position) {
        // Success - fill form fields
        setCompany(extracted.company);
        setPosition(extracted.position);
        if (extracted.salary) setSalary(extracted.salary);
        if (extracted.hourlyRate) setHourlyRate(extracted.hourlyRate);

        if (extracted.error) {
          // Partial extraction
          setExtractionStatus({
            type: 'partial',
            message: extracted.error
          });
        } else {
          // Full success
          setExtractionStatus({
            type: 'success',
            message: '✨ Job details extracted successfully! Review and save.'
          });
        }
      } else {
        // Failed extraction
        setExtractionStatus({
          type: 'error',
          message:
            extracted.error ||
            'Could not extract details. Please fill manually.'
        });
      }
    } catch (error) {
      console.error('Extraction error:', error);
      setExtractionStatus({
        type: 'error',
        message: 'Extraction failed. Please try manual entry.'
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!company.trim() || !position.trim()) {
      setExtractionStatus({
        type: 'error',
        message: 'Company and Position are required'
      });
      return;
    }

    onSubmit({
      company: company.trim(),
      position: position.trim(),
      salary: salary.trim() || null,
      hourly_rate: hourlyRate.trim() || null,
      job_url: jobUrl.trim() || null,
      status,
      notes: notes.trim() || null,
      applied_date: new Date().toISOString()
    });

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setJobUrl('');
    setCompany('');
    setPosition('');
    setSalary('');
    setHourlyRate('');
    setStatus('applied');
    setNotes('');
    setExtractionStatus({ type: 'idle', message: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] rounded-xl shadow-2xl border border-gray-700/50 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#1a1f2e]/95 backdrop-blur border-b border-gray-700/50">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-red-500" />
            Add New Job Application
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Job Entry Section */}
          <div className="p-5 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Quick Job Entry
                </h3>
                <p className="text-sm text-gray-400">
                  Paste any job posting URL for automatic extraction
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Posting URL (Optional)
                </label>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={e => {
                    setJobUrl(e.target.value);
                    setExtractionStatus({ type: 'idle', message: '' });
                  }}
                  placeholder="https://company.com/careers/job-posting..."
                  className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleAutoExtract}
                disabled={!jobUrl.trim() || isExtracting}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Auto-Extract Details
                  </>
                )}
              </button>

              {/* Extraction Status */}
              {extractionStatus.message && (
                <div
                  className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                    extractionStatus.type === 'success'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : extractionStatus.type === 'partial'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      : extractionStatus.type === 'error'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {extractionStatus.type === 'success' && (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  {(extractionStatus.type === 'partial' ||
                    extractionStatus.type === 'error') && (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{extractionStatus.message}</span>
                </div>
              )}

              <div className="flex items-center justify-center">
                <span className="text-sm text-gray-500 font-medium">OR</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  // Just clear extraction status, keep URL for reference
                  setExtractionStatus({ type: 'idle', message: '' });
                }}
                className="w-full px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white font-medium rounded-lg transition-all"
              >
                Fill Details Manually
              </button>
            </div>
          </div>

          {/* Manual Entry Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Enter company name"
                required
                className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Position <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={position}
                onChange={e => setPosition(e.target.value)}
                placeholder="Enter position title"
                required
                className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Salary
              </label>
              <input
                type="text"
                value={salary}
                onChange={e => setSalary(e.target.value)}
                placeholder="e.g., $80,000 - $100,000"
                className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hourly Rate
              </label>
              <input
                type="text"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                placeholder="e.g., $25.50/hr"
                className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
            >
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={4}
              className="w-full px-4 py-3 bg-[#0f1419] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white font-medium rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Add Job Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
