import { jobAutomationService, JobExtractionResult } from './jobAutomationService';
import { createJobApplication } from './enhancedJobService';
import { CreateJobApplication } from '../types/job';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Backend integration service for job automation
 * Ensures proper error handling, logging, and data validation
 */
export class AutomationBackendService {
  private static instance: AutomationBackendService;

  constructor() {}

  static getInstance(): AutomationBackendService {
    if (!AutomationBackendService.instance) {
      AutomationBackendService.instance = new AutomationBackendService();
    }
    return AutomationBackendService.instance;
  }

  /**
   * Extract job data from URL without saving to backend
   */
  async extractJobDataFromUrl(url: string): Promise<{
    success: boolean;
    data?: Partial<CreateJobApplication>;
    error?: string;
    confidence?: number;
  }> {
    try {
      console.log('🔍 Starting URL job extraction:', url);
      
      // Validate URL
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid URL format');
      }

      // Extract job data using the automation service
      const extractionResult = await jobAutomationService.extractJobFromUrl(url);
      
      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(extractionResult.error || 'Failed to extract job data');
      }

      console.log('✅ Job data extracted successfully');
      
      return {
        success: true,
        data: extractionResult.data,
        confidence: extractionResult.confidence
      };

    } catch (error) {
      console.error('❌ Error in URL job extraction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Extract job from URL and save to backend
   */
  async extractAndSaveJobFromUrl(url: string): Promise<{
    success: boolean;
    jobId?: string;
    error?: string;
    confidence?: number;
  }> {
    try {
      console.log('🔍 Starting URL job extraction:', url);
      
      // Validate URL
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid URL format');
      }

      // Extract job data
      const extractionResult = await jobAutomationService.extractJobFromUrl(url);
      
      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(extractionResult.error || 'Failed to extract job data');
      }

      // Validate extracted data
      const validationResult = this.validateJobData(extractionResult.data);
      if (!validationResult.isValid) {
        throw new Error(`Invalid job data: ${validationResult.errors.join(', ')}`);
      }

      // Prepare job data for backend
      const jobData: CreateJobApplication = {
        company: extractionResult.data.company || '',
        position: extractionResult.data.position || '',
        date_applied: new Date().toISOString().split('T')[0],
        status: 'Applied',
        job_url: url,
        salary: extractionResult.data.salary || '',
        notes: extractionResult.data.notes || '',
        job_description: extractionResult.data.job_description || '',
        offers: extractionResult.data.offers || '',
        withdrawn: false
      };

      console.log('💾 Saving job to backend:', jobData);

      // Save to backend using existing service
      const savedJob = await createJobApplication(jobData);
      
      console.log('✅ Job saved successfully with ID:', savedJob.id);

      return {
        success: true,
        jobId: savedJob.id,
        confidence: extractionResult.confidence
      };

    } catch (error) {
      console.error('❌ Error in URL job extraction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Extract job from email and save to backend
   */
  async extractAndSaveJobFromEmail(emailContent: string): Promise<{
    success: boolean;
    jobId?: string;
    error?: string;
    confidence?: number;
  }> {
    try {
      console.log('📧 Starting email job extraction');
      
      if (!emailContent.trim()) {
        throw new Error('Email content is required');
      }

      // Extract job data from email
      const extractionResult = await jobAutomationService.extractJobFromEmail(emailContent);
      
      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(extractionResult.error || 'Failed to extract job data from email');
      }

      // Validate extracted data
      const validationResult = this.validateJobData(extractionResult.data);
      if (!validationResult.isValid) {
        throw new Error(`Invalid job data: ${validationResult.errors.join(', ')}`);
      }

      // Prepare job data for backend
      const jobData: CreateJobApplication = {
        company: extractionResult.data.company || '',
        position: extractionResult.data.position || '',
        date_applied: new Date().toISOString().split('T')[0],
        status: 'Applied',
        salary: extractionResult.data.salary || '',
        notes: extractionResult.data.notes || '',
        job_description: extractionResult.data.job_description || '',
        offers: extractionResult.data.offers || '',
        withdrawn: false
      };

      console.log('💾 Saving email job to backend:', jobData);

      // Save to backend using existing service
      const savedJob = await createJobApplication(jobData);
      
      console.log('✅ Email job saved successfully with ID:', savedJob.id);

      return {
        success: true,
        jobId: savedJob.id,
        confidence: extractionResult.confidence
      };

    } catch (error) {
      console.error('❌ Error in email job extraction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Validate extracted job data
   */
  private validateJobData(data: Partial<CreateJobApplication>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Required fields validation
    if (!data.company || data.company.trim().length === 0) {
      errors.push('Company name is required');
    }

    if (!data.position || data.position.trim().length === 0) {
      errors.push('Job position is required');
    }

    // Optional field validation
    if (data.company && data.company.length > 100) {
      errors.push('Company name is too long (max 100 characters)');
    }

    if (data.position && data.position.length > 100) {
      errors.push('Position title is too long (max 100 characters)');
    }

    if (data.notes && data.notes.length > 2000) {
      errors.push('Notes are too long (max 2000 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get extraction statistics
   */
  async getExtractionStats(): Promise<{
    totalExtractions: number;
    successfulExtractions: number;
    averageConfidence: number;
    supportedPortals: string[];
  }> {
    try {
      // This would typically query your analytics database
      // For now, return mock data
      return {
        totalExtractions: 0,
        successfulExtractions: 0,
        averageConfidence: 0,
        supportedPortals: jobAutomationService.getSupportedPortals()
      };
    } catch (error) {
      console.error('Error getting extraction stats:', error);
      return {
        totalExtractions: 0,
        successfulExtractions: 0,
        averageConfidence: 0,
        supportedPortals: []
      };
    }
  }

  /**
   * Test backend connectivity
   */
  async testBackendConnection(): Promise<boolean> {
    try {
      // Try to create a test job (will be rolled back)
      const testJob: CreateJobApplication = {
        company: 'Test Company',
        position: 'Test Position',
        date_applied: new Date().toISOString().split('T')[0],
        status: 'Applied',
        notes: 'Test job for connectivity check'
      };

      await createJobApplication(testJob);
      return true;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const automationBackendService = AutomationBackendService.getInstance();
