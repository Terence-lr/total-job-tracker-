import { useState, useCallback } from 'react';
import { JobApplication } from '../types/job';
import { updateJobApplication, deleteJobApplication } from '../services/jobService';

export const useOptimisticJobUpdate = (initialJobs: JobApplication[]) => {
  const [jobs, setJobs] = useState<JobApplication[]>(initialJobs);

  const updateJob = useCallback(async (
    id: string, 
    updates: Partial<JobApplication>,
    userId: string
  ) => {
    // Optimistic update
    setJobs(current => 
      current.map(job => 
        job.id === id ? { ...job, ...updates } : job
      )
    );

    try {
      await updateJobApplication(id, updates, userId);
    } catch (error) {
      // Revert on error
      setJobs(current => 
        current.map(job => 
          job.id === id ? { ...job, ...updates } : job
        )
      );
      throw error;
    }
  }, []);

  const deleteJob = useCallback(async (id: string, userId: string) => {
    // Store original job for potential rollback
    const originalJob = jobs.find(job => job.id === id);
    
    // Optimistic delete
    setJobs(current => current.filter(job => job.id !== id));

    try {
      await deleteJobApplication(id, userId);
    } catch (error) {
      // Revert on error
      if (originalJob) {
        setJobs(current => [...current, originalJob]);
      }
      throw error;
    }
  }, [jobs]);

  const bulkUpdateJobs = useCallback(async (
    jobIds: string[],
    updates: Partial<JobApplication>,
    userId: string
  ) => {
    // Store original jobs for potential rollback
    const originalJobs = jobs.filter(job => jobIds.includes(job.id));
    
    // Optimistic bulk update
    setJobs(current => 
      current.map(job => 
        jobIds.includes(job.id) ? { ...job, ...updates } : job
      )
    );

    try {
      // Import the bulk update function
      const { bulkUpdateJobs: bulkUpdate } = await import('../services/enhancedJobService');
      await bulkUpdate(jobIds, updates);
    } catch (error) {
      // Revert on error
      setJobs(current => 
        current.map(job => {
          const original = originalJobs.find(orig => orig.id === job.id);
          return original ? original : job;
        })
      );
      throw error;
    }
  }, [jobs]);

  const bulkDeleteJobs = useCallback(async (
    jobIds: string[],
    userId: string
  ) => {
    // Store original jobs for potential rollback
    const originalJobs = jobs.filter(job => jobIds.includes(job.id));
    
    // Optimistic bulk delete
    setJobs(current => current.filter(job => !jobIds.includes(job.id)));

    try {
      // Import the bulk delete function
      const { bulkDeleteJobs: bulkDelete } = await import('../services/enhancedJobService');
      await bulkDelete(jobIds);
    } catch (error) {
      // Revert on error
      setJobs(current => [...current, ...originalJobs]);
      throw error;
    }
  }, [jobs]);

  return {
    jobs,
    setJobs,
    updateJob,
    deleteJob,
    bulkUpdateJobs,
    bulkDeleteJobs
  };
};
