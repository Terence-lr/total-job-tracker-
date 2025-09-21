import { supabase } from '../lib/supabase';
import { JobApplication, JobFilters } from '../types/job';

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
    query = query.gte('dateApplied', filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte('dateApplied', filters.dateTo);
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
    .order('dateApplied', { ascending: false });

  if (error) throw error;
  return data || [];
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
  updates: Partial<JobApplication>
): Promise<void> => {
  const { error } = await supabase
    .from('jobs')
    .update(updates)
    .in('id', jobIds);

  if (error) throw error;
};

export const bulkDeleteJobs = async (jobIds: string[]): Promise<void> => {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .in('id', jobIds);

  if (error) throw error;
};

export const getJobStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('status, dateApplied')
    .eq('userId', userId);

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
    const month = new Date(job.dateApplied).toISOString().substring(0, 7);
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
      job.dateApplied,
      job.status,
      `"${job.salary || ''}"`,
      `"${job.notes || ''}"`,
      `"${job.jobUrl || ''}"`
    ].join(','))
  ].join('\n');

  return csvContent;
};
