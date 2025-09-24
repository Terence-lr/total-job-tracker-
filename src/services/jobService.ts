import { supabase, getCurrentUser } from '../lib/supabase';
import { JobApplication, CreateJobApplication, JobFilters } from '../types/job';

// Create a new job application
export const createJobApplication = async (
  jobData: CreateJobApplication
): Promise<string> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('jobs')
      .insert([
        {
          ...jobData,
          user_id: currentUser.id  // Now this is a UUID
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    console.log('Job application created with ID:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error creating job application:', error);
    throw new Error('Failed to create job application');
  }
};

// Get all job applications for a user
export const getJobApplications = async (): Promise<JobApplication[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', currentUser.id)  // UUID comparison
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
    
    const jobs: JobApplication[] = (data || []).map(job => ({
      id: job.id,
      company: job.company,
      position: job.position,
      date_applied: job.date_applied || new Date(job.created_at).toISOString().split('T')[0],
      status: job.status as any,
      salary: job.salary || '',
      notes: job.notes || '',
      job_url: job.job_url || '',
      user_id: job.user_id,
      created_at: new Date(job.created_at),
      updated_at: new Date(job.updated_at || job.created_at)
    }));
    
    console.log(`Retrieved ${jobs.length} job applications for user ${currentUser.id}`);
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
      position: data.position,
      date_applied: data.date_applied || new Date(data.created_at).toISOString().split('T')[0],
      status: data.status as any,
      salary: data.salary || '',
      notes: data.notes || '',
      job_url: data.job_url || '',
      user_id: data.user_id,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at || data.created_at)
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
      position: job.position,
      date_applied: job.date_applied || new Date(job.created_at).toISOString().split('T')[0],
      status: job.status as any,
      salary: job.salary || '',
      notes: job.notes || '',
      job_url: job.job_url || '',
      user_id: job.user_id,
      created_at: new Date(job.created_at),
      updated_at: new Date(job.updated_at || job.created_at)
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
      jobs = jobs.filter(job => new Date(job.date_applied) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      jobs = jobs.filter(job => new Date(job.date_applied) <= toDate);
    }
    
    console.log(`Found ${jobs.length} job applications matching filters`);
    return jobs;
  } catch (error) {
    console.error('Error searching job applications:', error);
    throw new Error('Failed to search job applications');
  }
};
