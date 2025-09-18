import { supabase } from '../lib/supabase';
import { JobApplication, CreateJobApplication, JobFilters } from '../types/job';

// Create a new job application
export const createJobApplication = async (
  jobData: CreateJobApplication,
  userId: string
): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        user_id: userId,
        title: jobData.position,
        company: jobData.company,
        status: jobData.status,
        notes: jobData.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('Job application created with ID:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error creating job application:', error);
    throw new Error('Failed to create job application');
  }
};

// Get all job applications for a user
export const getJobApplications = async (userId: string): Promise<JobApplication[]> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const jobs: JobApplication[] = data.map(job => ({
      id: job.id,
      company: job.company,
      position: job.title,
      dateApplied: new Date(job.created_at).toISOString().split('T')[0],
      status: job.status as any,
      salary: '', // Not in current schema
      notes: job.notes || '',
      jobUrl: '', // Not in current schema
      userId: job.user_id,
      createdAt: new Date(job.created_at),
      updatedAt: new Date(job.created_at)
    }));
    
    console.log(`Retrieved ${jobs.length} job applications for user ${userId}`);
    return jobs;
  } catch (error) {
    console.error('Error getting job applications:', error);
    throw new Error('Failed to retrieve job applications');
  }
};

// Get a single job application by ID
export const getJobApplication = async (jobId: string, userId: string): Promise<JobApplication | null> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw error;
    }
    
    return {
      id: data.id,
      company: data.company,
      position: data.title,
      dateApplied: new Date(data.created_at).toISOString().split('T')[0],
      status: data.status as any,
      salary: '', // Not in current schema
      notes: data.notes || '',
      jobUrl: '', // Not in current schema
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error getting job application:', error);
    throw new Error('Failed to retrieve job application');
  }
};

// Update a job application
export const updateJobApplication = async (
  jobId: string,
  updates: Partial<CreateJobApplication>,
  userId: string
): Promise<void> => {
  try {
    const updateData: any = {};
    
    if (updates.company) updateData.company = updates.company;
    if (updates.position) updateData.title = updates.position;
    if (updates.status) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    
    const { error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', jobId)
      .eq('user_id', userId);

    if (error) throw error;
    
    console.log('Job application updated:', jobId);
  } catch (error) {
    console.error('Error updating job application:', error);
    throw new Error('Failed to update job application');
  }
};

// Delete a job application
export const deleteJobApplication = async (jobId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)
      .eq('user_id', userId);

    if (error) throw error;
    
    console.log('Job application deleted:', jobId);
  } catch (error) {
    console.error('Error deleting job application:', error);
    throw new Error('Failed to delete job application');
  }
};

// Search and filter job applications
export const searchJobApplications = async (
  userId: string,
  filters: JobFilters = {}
): Promise<JobApplication[]> => {
  try {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('user_id', userId);

    // Apply status filter if provided
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    
    let jobs: JobApplication[] = data.map(job => ({
      id: job.id,
      company: job.company,
      position: job.title,
      dateApplied: new Date(job.created_at).toISOString().split('T')[0],
      status: job.status as any,
      salary: '', // Not in current schema
      notes: job.notes || '',
      jobUrl: '', // Not in current schema
      userId: job.user_id,
      createdAt: new Date(job.created_at),
      updatedAt: new Date(job.created_at)
    }));
    
    // Apply client-side filters for search and date range
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      jobs = jobs.filter(job => 
        job.company.toLowerCase().includes(searchTerm) ||
        job.position.toLowerCase().includes(searchTerm) ||
        (job.notes && job.notes.toLowerCase().includes(searchTerm))
      );
    }
    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      jobs = jobs.filter(job => new Date(job.dateApplied) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      jobs = jobs.filter(job => new Date(job.dateApplied) <= toDate);
    }
    
    console.log(`Found ${jobs.length} job applications matching filters`);
    return jobs;
  } catch (error) {
    console.error('Error searching job applications:', error);
    throw new Error('Failed to search job applications');
  }
};
