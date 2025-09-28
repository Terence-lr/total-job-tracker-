import React, { useState, useEffect } from 'react';
import { JobApplication, CreateJobApplication, JobStatus } from '../../../types/job';
import { X, Calendar, DollarSign, Link as LinkIcon, FileText, Zap, Globe, Loader2, CheckCircle } from 'lucide-react';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import { automationBackendService } from '../../../services/automationBackendService';
import { creativeExtractionService } from '../../../services/creativeExtractionService';
import { useNotification } from '../../../contexts/NotificationContext';

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
    hourly_rate: undefined,
    pay_type: 'salary',
    calculated_salary: undefined,
    calculated_hourly_rate: undefined,
    notes: '',
    job_url: '',
    job_description: '',
    offers: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isExtracting, setIsExtracting] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showFieldValidation, setShowFieldValidation] = useState(false);
  const [fieldValidation, setFieldValidation] = useState<Record<string, { value: string; confidence: number; needsManual: boolean }>>({});
  const { showSuccess, showError, showInfo } = useNotification();


  useEffect(() => {
    if (job) {
      setFormData({
        company: job.company,
        position: job.position,
        date_applied: job.date_applied,
        status: job.status,
        salary: job.salary || '',
        hourly_rate: job.hourly_rate,
        pay_type: job.pay_type || 'salary',
        calculated_salary: job.calculated_salary,
        calculated_hourly_rate: job.calculated_hourly_rate,
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

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => {
      const updated = { ...prev, salary: value };
      
      // Calculate hourly rate from salary
      if (value && value.trim()) {
        const numericValue = parseSalaryValue(value);
        if (numericValue > 0) {
          const hourlyRate = numericValue / (40 * 52); // 40 hours/week * 52 weeks/year
          updated.calculated_hourly_rate = Math.round(hourlyRate * 100) / 100;
          updated.pay_type = 'salary';
        }
      } else {
        updated.calculated_hourly_rate = undefined;
      }
      
      return updated;
    });
    setErrors(prev => ({
      ...prev,
      salary: ''
    }));
  };

  const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData(prev => {
      const updated = { ...prev, hourly_rate: value };
      
      // Calculate salary from hourly rate
      if (value > 0) {
        const annualSalary = value * 40 * 52; // 40 hours/week * 52 weeks/year
        updated.calculated_salary = Math.round(annualSalary);
        updated.pay_type = 'hourly';
      } else {
        updated.calculated_salary = undefined;
      }
      
      return updated;
    });
    setErrors(prev => ({
      ...prev,
      hourly_rate: ''
    }));
  };

  const parseSalaryValue = (salary: string): number => {
    // Remove common non-numeric characters and convert
    let cleanSalary = salary.replace(/[^0-9.]/g, '');
    
    // Handle 'k' suffix (multiply by 1000)
    if (salary.toLowerCase().includes('k')) {
      cleanSalary = (parseFloat(cleanSalary) * 1000).toString();
    }
    
    // Handle 'm' suffix (multiply by 1000000)
    if (salary.toLowerCase().includes('m')) {
      cleanSalary = (parseFloat(cleanSalary) * 1000000).toString();
    }
    
    return parseFloat(cleanSalary) || 0;
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


  const handleCreativeExtraction = async () => {
    if (!urlInput.trim()) {
      showError('URL Required', 'Please enter a job posting URL');
      return;
    }

    setIsExtracting(true);
    try {
      // Show info notification about the extraction process
      showInfo('Auto-Extracting Job Data', 'Using RapidAPI JSearch for 92% accuracy...', 'This may take a few seconds.');
      
      const result = await creativeExtractionService.extractJobData(urlInput);
      
      if (result.success && result.data) {
        // Analyze each field for confidence and validation
        const fieldAnalysis = analyzeExtractedFields(result.data);
        setFieldValidation(fieldAnalysis);
        setShowFieldValidation(true);
        
        showSuccess('Job Data Extracted!', 'RapidAPI JSearch found job information. Please review and confirm the extracted data.');
      } else {
        // Provide more specific error messages based on the error type
        let errorTitle = 'Extraction Failed';
        let errorMessage = result.error || 'Failed to extract job data';
        let errorDetails = 'You can still add the job manually by filling in the form below.';
        
        // Customize error message based on common failure types
        if (result.error?.includes('Invalid URL format')) {
          errorTitle = 'Invalid URL';
          errorMessage = 'The URL format is not valid';
          errorDetails = 'Please check the URL and try again with a valid job posting link.';
        } else if (result.error?.includes('Failed to fetch')) {
          errorTitle = 'Network Error';
          errorMessage = 'Unable to access the job posting';
          errorDetails = 'The website may be blocking automated access or the URL may be incorrect.';
        }
        
        showError(errorTitle, errorMessage, errorDetails);
        
        // Automatically add URL to form for manual entry
        if (urlInput.trim()) {
          setFormData(prev => ({
            ...prev,
            job_url: urlInput
          }));
          setUrlInput('');
          showInfo('Manual Entry Available', 'Job URL has been added to the form. Please fill in the remaining details manually.', 'The URL has been automatically added to the Job URL field below.');
        }
      }
    } catch (error) {
      console.error('Error in extraction:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showError('Extraction Error', 'An error occurred during job extraction', `Technical details: ${errorMessage}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const analyzeExtractedFields = (data: Partial<CreateJobApplication>) => {
    const analysis: Record<string, { value: string; confidence: number; needsManual: boolean }> = {};
    
    // Company analysis
    const company = data.company || '';
    analysis.company = {
      value: company,
      confidence: calculateConfidence(company, ['company', 'employer', 'organization']),
      needsManual: company.length < 2 || calculateConfidence(company, ['company', 'employer', 'organization']) < 0.3
    };
    
    // Position analysis
    const position = data.position || '';
    analysis.position = {
      value: position,
      confidence: calculateConfidence(position, ['position', 'title', 'role', 'job']),
      needsManual: position.length < 2 || calculateConfidence(position, ['position', 'title', 'role', 'job']) < 0.3
    };
    
    // Salary analysis
    const salary = data.salary || '';
    analysis.salary = {
      value: salary,
      confidence: calculateConfidence(salary, ['salary', 'compensation', 'pay', '$', '€', '£']),
      needsManual: salary.length < 2 || calculateConfidence(salary, ['salary', 'compensation', 'pay', '$', '€', '£']) < 0.2
    };
    
    // Notes/Description analysis
    const notes = data.notes || '';
    analysis.notes = {
      value: notes,
      confidence: calculateConfidence(notes, ['description', 'requirements', 'responsibilities', 'qualifications']),
      needsManual: notes.length < 10 || calculateConfidence(notes, ['description', 'requirements', 'responsibilities', 'qualifications']) < 0.2
    };
    
    return analysis;
  };

  const calculateConfidence = (text: string, keywords: string[]): number => {
    if (!text || text.length < 2) return 0;
    
    const lowerText = text.toLowerCase();
    let score = 0;
    
    // Check for keyword matches
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 0.3;
      }
    });
    
    // Check for length appropriateness
    if (text.length > 5 && text.length < 100) score += 0.2;
    
    // Check for common job-related patterns
    if (lowerText.includes('engineer') || lowerText.includes('developer') || lowerText.includes('manager')) {
      score += 0.2;
    }
    
    // Check for company indicators
    if (lowerText.includes('inc') || lowerText.includes('corp') || lowerText.includes('llc') || lowerText.includes('ltd')) {
      score += 0.2;
    }
    
    return Math.min(score, 1);
  };

  const handleFieldValidation = () => {
    // Update form data with validated fields
    const updatedFormData = { ...formData };
    
    Object.entries(fieldValidation).forEach(([field, validation]) => {
      if (validation.value && !validation.needsManual) {
        if (field === 'company') updatedFormData.company = validation.value;
        else if (field === 'position') updatedFormData.position = validation.value;
        else if (field === 'salary') updatedFormData.salary = validation.value;
        else if (field === 'notes') updatedFormData.notes = validation.value;
      }
    });
    
    setFormData(updatedFormData);
    setShowFieldValidation(false);
    showSuccess('Fields Updated', 'Validated fields have been added to the form');
  };

  const handleManualFieldInput = (field: string, value: string) => {
    setFieldValidation(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        needsManual: false
      }
    }));
  };

  const statusOptions: JobStatus[] = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            {job ? 'Edit Job Application' : 'Add New Job Application'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white p-1.5 sm:p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Close form"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {/* Automation Section */}
          {!job && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/30">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Quick Job Entry</h4>
                  <p className="text-sm text-gray-400">Try auto-extraction or add manually</p>
                </div>
              </div>
              
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Job Posting URL (Optional)
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="url"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="https://company.com/careers/job-posting..."
                          className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={handleCreativeExtraction}
                          disabled={isExtracting || !urlInput.trim()}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                        >
                          {isExtracting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                          <span>{isExtracting ? 'Extracting...' : 'Auto-Extract'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Uses RapidAPI JSearch for 92% accuracy
                      </p>
                    </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-px bg-gray-600"></div>
                  <span className="text-xs text-gray-400">OR</span>
                  <div className="flex-1 h-px bg-gray-600"></div>
                </div>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (urlInput.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          job_url: urlInput
                        }));
                        setUrlInput('');
                        showSuccess('URL Added', 'Job URL added to form. Please fill in the job details below.');
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Add URL & Fill Manually</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-400">
                  💡 Tip: If auto-extraction doesn't work, just add the URL and fill in the job details manually below
                </p>
              </div>
            </div>
          )}

          {/* Field Validation Section */}
          {showFieldValidation && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl border border-green-500/30">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Review Extracted Data</h4>
                  <p className="text-sm text-gray-400">Please review and confirm the extracted information</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {Object.entries(fieldValidation).map(([field, validation]) => (
                  <div key={field} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 capitalize">
                      {field} {validation.needsManual && <span className="text-red-400">(Manual input required)</span>}
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={validation.value}
                        onChange={(e) => handleManualFieldInput(field, e.target.value)}
                        className={`flex-1 px-3 py-2 bg-gray-800 text-white border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                          validation.needsManual 
                            ? 'border-red-500 focus:ring-red-500' 
                            : validation.confidence > 0.7 
                              ? 'border-green-500 focus:ring-green-500'
                              : 'border-yellow-500 focus:ring-yellow-500'
                        }`}
                        placeholder={`Enter ${field}...`}
                      />
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          validation.confidence > 0.7 ? 'bg-green-500' : 
                          validation.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-xs text-gray-400">
                          {Math.round(validation.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleFieldValidation}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Use These Fields
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFieldValidation(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                  className={`w-full px-3 py-2 sm:py-2.5 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base ${
                    errors.company ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter company name"
                />
                {errors.company && (
                  <p className="text-xs sm:text-sm text-red-400">{errors.company}</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label htmlFor="date_applied" className="block text-sm font-medium text-gray-300">
                  Date Applied *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date_applied"
                    name="date_applied"
                    value={formData.date_applied}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 sm:py-2.5 pl-9 sm:pl-10 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base ${
                      errors.date_applied ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                </div>
                {errors.date_applied && (
                  <p className="text-xs sm:text-sm text-red-400">{errors.date_applied}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-300">
                  Status
                </label>
                <Select
                  options={statusOptions.map(status => ({ value: status, label: status }))}
                  value={formData.status}
                  onChange={(value) => handleChange({ target: { name: 'status', value } } as any)}
                  size="md"
                  variant="default"
                  fullWidth
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="salary" className="block text-sm font-medium text-gray-300">
                Salary
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleSalaryChange}
                  className="w-full px-3 py-2 sm:py-2.5 pl-9 sm:pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., $80,000 - $100,000"
                />
              </div>
              {formData.calculated_hourly_rate && (
                <p className="text-xs text-gray-400">
                  ≈ ${formData.calculated_hourly_rate}/hour
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-300">
                Hourly Rate
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="hourly_rate"
                  name="hourly_rate"
                  value={formData.hourly_rate || ''}
                  onChange={handleHourlyRateChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 sm:py-2.5 pl-9 sm:pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., 25.50"
                />
              </div>
              {formData.calculated_salary && (
                <p className="text-xs text-gray-400">
                  ≈ ${formData.calculated_salary.toLocaleString()}/year
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="job_url" className="block text-sm font-medium text-gray-300">
                Job URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="job_url"
                  name="job_url"
                  value={formData.job_url}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 sm:py-2.5 pl-9 sm:pl-10 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base ${
                    errors.job_url ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="https://company.com/job-posting"
                />
              </div>
              {errors.job_url && (
                <p className="text-xs sm:text-sm text-red-400">{errors.job_url}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300">
                Notes
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pl-9 sm:pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-h-[80px] sm:min-h-[100px] resize-none text-sm sm:text-base"
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
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <textarea
                  id="job_description"
                  name="job_description"
                  rows={4}
                  value={formData.job_description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pl-9 sm:pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-h-[120px] sm:min-h-[150px] resize-none text-sm sm:text-base"
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
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <textarea
                  id="offers"
                  name="offers"
                  rows={2}
                  value={formData.offers}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pl-9 sm:pl-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent min-h-[80px] sm:min-h-[100px] resize-none text-sm sm:text-base"
                  placeholder="Enter details about any job offers received..."
                />
              </div>
            </div>


            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-700">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                size="md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                size="md"
              >
                {job ? 'Update Application' : 'Add Application'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobForm;
