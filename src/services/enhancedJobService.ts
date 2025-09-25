import { supabase, getCurrentUser } from '../lib/supabase';
import { JobApplication, JobFilters } from '../types/job';

export const createJobApplication = async (jobData: Omit<JobApplication, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error('User not authenticated');

  // Map the job data to match database column names
  const dbJob = {
    company: jobData.company,
    position: jobData.position,
    date_applied: jobData.date_applied,
    status: jobData.status,
    salary: jobData.salary,
    notes: jobData.notes,
    job_url: jobData.job_url,
    job_description: jobData.job_description,
    user_id: currentUser.id
  };

  const { data, error } = await supabase
    .from('jobs')
    .insert(dbJob)
    .select()
    .single();

  if (error) throw error;
  
  // Map the returned data to match TypeScript interface
  return {
    id: data.id,
    company: data.company,
    position: data.position,
    date_applied: data.date_applied,
    status: data.status,
    salary: data.salary || '',
    notes: data.notes || '',
    job_url: data.job_url || '',
    job_description: data.job_description || '',
    user_id: data.user_id,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at || data.created_at)
  };
};

export const getJobsWithFilters = async (
  userId: string,
  filters: JobFilters
): Promise<JobApplication[]> => {
  let query = supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId);

  // Status filtering
  if (filters.status && filters.status.length > 0) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status);
    } else {
      query = query.eq('status', filters.status);
    }
  }

  // Date range filtering
  if (filters.dateFrom) {
    query = query.gte('date_applied', filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte('date_applied', filters.dateTo);
  }

  // Search filtering (company, position, notes)
  if (filters.search) {
    query = query.or(
      `company.ilike.%${filters.search}%,position.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
    );
  }

  // Salary range filtering
  if (filters.minSalary) {
    query = query.gte('salary', filters.minSalary);
  }

  if (filters.maxSalary) {
    query = query.lte('salary', filters.maxSalary);
  }

  const { data, error } = await query
    .order('date_applied', { ascending: false });

  if (error) throw error;
  
  // Map database columns to TypeScript interface
  return (data || []).map(job => ({
    id: job.id,
    company: job.company,
    position: job.position,
    date_applied: job.date_applied,
    status: job.status as any,
    salary: job.salary || '',
    notes: job.notes || '',
    job_url: job.job_url || '',
    job_description: job.job_description || '',
    user_id: job.user_id,
    created_at: new Date(job.created_at),
    updated_at: new Date(job.updated_at || job.created_at)
  }));
};

export const subscribeToJobsChanges = (
  userId: string,
  onUpdate: (payload: any) => void
) => {
  const subscription = supabase
    .channel('jobs_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'jobs',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return subscription;
};

export const bulkUpdateJobs = async (
  jobIds: string[],
  updates: Partial<JobApplication>,
  userId: string
): Promise<void> => {
  const { error } = await supabase
    .from('jobs')
    .update(updates)
    .in('id', jobIds)
    .eq('user_id', userId);

  if (error) throw error;
};

export const bulkDeleteJobs = async (jobIds: string[], userId: string): Promise<void> => {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .in('id', jobIds)
    .eq('user_id', userId);

  if (error) throw error;
};

export const updateJobApplication = async (id: string, updates: Partial<JobApplication>, userId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  
  // Map the returned data to match TypeScript interface
  return {
    id: data.id,
    company: data.company,
    position: data.position,
    date_applied: data.date_applied,
    status: data.status,
    salary: data.salary || '',
    notes: data.notes || '',
    job_url: data.job_url || '',
    job_description: data.job_description || '',
    user_id: data.user_id,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at || data.created_at)
  };
};

export const deleteJobApplication = async (id: string, userId: string) => {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};

// Alias functions for compatibility
export const updateJob = updateJobApplication;
export const deleteJob = deleteJobApplication;

export const getJobStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('status, date_applied')
    .eq('user_id', userId);

  if (error) throw error;

  const stats = {
    total: data?.length || 0,
    byStatus: {} as Record<string, number>,
    byMonth: {} as Record<string, number>
  };

  data?.forEach(job => {
    // Count by status
    stats.byStatus[job.status] = (stats.byStatus[job.status] || 0) + 1;
    
    // Count by month
    const month = new Date(job.date_applied).toISOString().substring(0, 7);
    stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
  });

  return stats;
};

export const exportJobsToCSV = async (
  userId: string,
  filters?: JobFilters
): Promise<string> => {
  const jobs = await getJobsWithFilters(userId, filters || {});
  
  const headers = [
    'Company',
    'Position',
    'Date Applied',
    'Status',
    'Salary',
    'Notes',
    'Job URL'
  ];

  const csvContent = [
    headers.join(','),
    ...jobs.map(job => [
      `"${job.company}"`,
      `"${job.position}"`,
      job.date_applied,
      job.status,
      `"${job.salary || ''}"`,
      `"${job.notes || ''}"`,
      `"${job.job_url || ''}"`
    ].join(','))
  ].join('\n');

  return csvContent;
};
