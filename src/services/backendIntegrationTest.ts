import { automationBackendService } from './automationBackendService';
import { createJobApplication } from './enhancedJobService';
import { CreateJobApplication } from '../types/job';

/**
 * Backend Integration Test Suite
 * Tests the automation features with your existing backend
 */
export class BackendIntegrationTest {
  private static instance: BackendIntegrationTest;

  constructor() {}

  static getInstance(): BackendIntegrationTest {
    if (!BackendIntegrationTest.instance) {
      BackendIntegrationTest.instance = new BackendIntegrationTest();
    }
    return BackendIntegrationTest.instance;
  }

  /**
   * Test basic backend connectivity
   */
  async testBasicConnectivity(): Promise<{
    success: boolean;
    error?: string;
    details: string;
  }> {
    try {
      console.log('🧪 Testing basic backend connectivity...');
      
      const isConnected = await automationBackendService.testBackendConnection();
      
      if (isConnected) {
        return {
          success: true,
          details: '✅ Backend connection successful - Supabase is accessible'
        };
      } else {
        return {
          success: false,
          error: 'Backend connection failed',
          details: '❌ Cannot connect to Supabase backend'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: '❌ Backend connectivity test failed'
      };
    }
  }

  /**
   * Test job creation with automation data
   */
  async testJobCreationWithAutomationData(): Promise<{
    success: boolean;
    jobId?: string;
    error?: string;
    details: string;
  }> {
    try {
      console.log('🧪 Testing job creation with automation data...');
      
      // Create test job data that mimics automation extraction
      const testJobData: CreateJobApplication = {
        company: 'Test Automation Company',
        position: 'Senior Software Engineer',
        date_applied: new Date().toISOString().split('T')[0],
        status: 'Applied',
        job_url: 'https://example.com/job/123',
        salary: '$120,000 - $150,000',
        notes: 'Test job created by automation system\nLocation: San Francisco, CA',
        job_description: 'We are looking for a senior software engineer...',
        offers: '',
        withdrawn: false
      };

      // Test direct job creation
      const savedJob = await createJobApplication(testJobData);
      
      console.log('✅ Test job created successfully with ID:', savedJob.id);
      
      return {
        success: true,
        jobId: savedJob.id,
        details: `✅ Job creation test passed - Job ID: ${savedJob.id}`
      };
    } catch (error) {
      console.error('❌ Job creation test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: '❌ Job creation test failed - Check backend configuration'
      };
    }
  }

  /**
   * Test URL extraction with backend integration
   */
  async testUrlExtractionWithBackend(): Promise<{
    success: boolean;
    jobId?: string;
    error?: string;
    details: string;
  }> {
    try {
      console.log('🧪 Testing URL extraction with backend integration...');
      
      // Test with a mock URL (won't actually extract, but tests the flow)
      const testUrl = 'https://linkedin.com/jobs/view/test-job-123';
      
      const result = await automationBackendService.extractAndSaveJobFromUrl(testUrl);
      
      if (result.success && result.jobId) {
        return {
          success: true,
          jobId: result.jobId,
          details: `✅ URL extraction test passed - Job ID: ${result.jobId}`
        };
      } else {
        return {
          success: false,
          error: result.error,
          details: `❌ URL extraction test failed: ${result.error}`
        };
      }
    } catch (error) {
      console.error('❌ URL extraction test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: '❌ URL extraction test failed - Check automation service'
      };
    }
  }

  /**
   * Test email extraction with backend integration
   */
  async testEmailExtractionWithBackend(): Promise<{
    success: boolean;
    jobId?: string;
    error?: string;
    details: string;
  }> {
    try {
      console.log('🧪 Testing email extraction with backend integration...');
      
      // Test with mock email content
      const testEmailContent = `
        Subject: Job Application Confirmation
        
        Dear John,
        
        Thank you for applying to the Software Engineer position at TechCorp.
        We have received your application and will review it within 5 business days.
        
        Position: Senior Software Engineer
        Company: TechCorp
        Location: Remote
        Salary: $100,000 - $130,000
        
        Best regards,
        HR Team
      `;
      
      const result = await automationBackendService.extractAndSaveJobFromEmail(testEmailContent);
      
      if (result.success && result.jobId) {
        return {
          success: true,
          jobId: result.jobId,
          details: `✅ Email extraction test passed - Job ID: ${result.jobId}`
        };
      } else {
        return {
          success: false,
          error: result.error,
          details: `❌ Email extraction test failed: ${result.error}`
        };
      }
    } catch (error) {
      console.error('❌ Email extraction test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: '❌ Email extraction test failed - Check automation service'
      };
    }
  }

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<{
    overallSuccess: boolean;
    results: Array<{
      testName: string;
      success: boolean;
      details: string;
      error?: string;
    }>;
    summary: string;
  }> {
    console.log('🚀 Starting backend integration tests...');
    
    const results = [];
    
    // Test 1: Basic connectivity
    const connectivityTest = await this.testBasicConnectivity();
    results.push({
      testName: 'Backend Connectivity',
      success: connectivityTest.success,
      details: connectivityTest.details,
      error: connectivityTest.error
    });
    
    // Test 2: Job creation
    const jobCreationTest = await this.testJobCreationWithAutomationData();
    results.push({
      testName: 'Job Creation',
      success: jobCreationTest.success,
      details: jobCreationTest.details,
      error: jobCreationTest.error
    });
    
    // Test 3: URL extraction
    const urlExtractionTest = await this.testUrlExtractionWithBackend();
    results.push({
      testName: 'URL Extraction',
      success: urlExtractionTest.success,
      details: urlExtractionTest.details,
      error: urlExtractionTest.error
    });
    
    // Test 4: Email extraction
    const emailExtractionTest = await this.testEmailExtractionWithBackend();
    results.push({
      testName: 'Email Extraction',
      success: emailExtractionTest.success,
      details: emailExtractionTest.details,
      error: emailExtractionTest.error
    });
    
    const overallSuccess = results.every(result => result.success);
    
    const summary = overallSuccess 
      ? '🎉 All backend integration tests passed! Your automation features are ready to use.'
      : '⚠️ Some tests failed. Check the details above and fix any issues.';
    
    console.log('📊 Test Results Summary:', { overallSuccess, results, summary });
    
    return {
      overallSuccess,
      results,
      summary
    };
  }
}

export const backendIntegrationTest = BackendIntegrationTest.getInstance();
