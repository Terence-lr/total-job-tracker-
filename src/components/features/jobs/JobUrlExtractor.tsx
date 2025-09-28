import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Globe, Loader2, CheckCircle, AlertCircle, ExternalLink, Copy, Download } from 'lucide-react';
import { jobAutomationService, JobExtractionResult } from '../../../services/jobAutomationService';
import { automationBackendService } from '../../../services/automationBackendService';
import { CreateJobApplication } from '../../../types/job';
import { useNotification } from '../../../contexts/NotificationContext';

interface JobUrlExtractorProps {
  onJobExtracted: (jobData: CreateJobApplication) => void;
  onClose: () => void;
}

const JobUrlExtractor: React.FC<JobUrlExtractorProps> = ({ onJobExtracted, onClose }) => {
  const [url, setUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<JobExtractionResult | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<CreateJobApplication>>({});
  const { showSuccess, showError } = useNotification();

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      showError('URL Required', 'Please enter a job posting URL');
      return;
    }

    setIsExtracting(true);
    setExtractionResult(null);
    setExtractedData({});

    try {
      const result = await automationBackendService.extractAndSaveJobFromUrl(url);
      setExtractionResult({
        success: result.success,
        data: result.success ? {
          company: '',
          position: '',
          notes: '',
          salary: ''
        } : undefined,
        error: result.error,
        confidence: result.confidence
      });
      
      if (result.success) {
        setExtractedData({
          company: 'Job saved to backend',
          position: 'Successfully extracted and saved',
          notes: `Job ID: ${result.jobId}`,
          salary: ''
        });
        showSuccess('Job Saved!', `Job extracted and saved successfully with ID: ${result.jobId}`);
      } else {
        showError('Extraction Failed', result.error || 'Failed to extract and save job data');
      }
    } catch (error) {
      console.error('Error extracting job:', error);
      showError('Extraction Error', 'An error occurred while extracting job data');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUseExtractedData = () => {
    if (extractionResult?.success) {
      // Job is already saved to backend, just close the modal
      onClose();
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    showSuccess('Copied', 'URL copied to clipboard');
  };

  const handleOpenUrl = () => {
    window.open(url, '_blank');
  };

  const isSupportedPortal = jobAutomationService.isSupportedPortal(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Link className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Extract Job from URL</h2>
                <p className="text-gray-400">Automatically extract job details from job posting URLs</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-gray-400">×</span>
            </button>
          </div>

          {/* URL Input Form */}
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Job Posting URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://linkedin.com/jobs/view/..."
                  className="flex-1 px-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isExtracting || !url.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isExtracting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Globe className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Portal Support Indicator */}
            {url && (
              <div className="flex items-center space-x-2 text-sm">
                {isSupportedPortal ? (
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Supported job portal detected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Generic extraction will be attempted</span>
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Extraction Results */}
          {extractionResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-4"
            >
              {extractionResult.success ? (
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">Extraction Successful</span>
                    {extractionResult.confidence && (
                      <span className="text-sm text-gray-400">
                        ({Math.round(extractionResult.confidence * 100)}% confidence)
                      </span>
                    )}
                  </div>
                  
                  {/* Extracted Data Preview */}
                  <div className="space-y-3">
                    {extractedData.company && (
                      <div>
                        <span className="text-sm text-gray-400">Company:</span>
                        <span className="ml-2 text-white font-medium">{extractedData.company}</span>
                      </div>
                    )}
                    {extractedData.position && (
                      <div>
                        <span className="text-sm text-gray-400">Position:</span>
                        <span className="ml-2 text-white font-medium">{extractedData.position}</span>
                      </div>
                    )}
                    {extractedData.notes && extractedData.notes.includes('Location:') && (
                      <div>
                        <span className="text-sm text-gray-400">Location:</span>
                        <span className="ml-2 text-white">{extractedData.notes.split('Location:')[1]?.split('\n')[0]?.trim()}</span>
                      </div>
                    )}
                    {extractedData.salary && (
                      <div>
                        <span className="text-sm text-gray-400">Salary:</span>
                        <span className="ml-2 text-white">{extractedData.salary}</span>
                      </div>
                    )}
                    {extractedData.notes && (
                      <div>
                        <span className="text-sm text-gray-400">Description:</span>
                        <p className="mt-1 text-white text-sm line-clamp-3">{extractedData.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={handleUseExtractedData}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Use This Data
                    </button>
                    <button
                      onClick={handleOpenUrl}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open URL</span>
                    </button>
                    <button
                      onClick={handleCopyUrl}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy URL</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-medium">Extraction Failed</span>
                  </div>
                  <p className="text-red-300 text-sm">{extractionResult.error}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Supported Portals Info */}
          <div className="mt-6 p-4 bg-gray-800 rounded-xl">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Supported Job Portals</h3>
            <div className="flex flex-wrap gap-2">
              {jobAutomationService.getSupportedPortals().map((portal) => (
                <span
                  key={portal}
                  className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-lg"
                >
                  {portal}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JobUrlExtractor;
